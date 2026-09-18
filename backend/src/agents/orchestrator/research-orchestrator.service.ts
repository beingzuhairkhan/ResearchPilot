import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ResearchSession, ResearchSessionDocument } from '../../research/schemas/research-session.schema';
import { ResearchTask, ResearchTaskDocument } from '../../research/schemas/research-task.schema';
import { Source, SourceDocument } from '../../sources/schemas/source.schema';
import { Report, ReportDocument } from '../../reports/schemas/report.schema';
import { ResearchRepository } from '../../research/research.repository';
import { ResearchEventsService } from '../../events/research-events.service';
import { PlannerService } from '../planner/planner.service';
import { ResearcherService } from '../researcher/researcher.service';
import { AnalyzerService } from '../analyzer/analyzer.service';
import { ComparisonService } from '../comparison/comparison.service';
import { ReporterService } from '../reporter/reporter.service';
import { SourcesService } from '../../sources/sources.service';
import { SourceExtractorService } from '../../sources/source-extractor.service';
import { RagService } from '../../rag/rag.service';
import { PineconeService } from '../../rag/pinecone.service';
import { ResearchStatus } from '../../common/enums/research-status.enum';
import { ResearchMode } from '../../common/enums/research-mode.enum';
import { ResearchEventType } from '../../common/enums/research-event.enum';
import { ContentStatus } from '../../common/enums/source-type.enum';
import { STAGE_PROGRESS } from '../../common/constants';
import { isRecentDate } from '../../common/utils/url.utils';

@Injectable()
export class ResearchOrchestratorService {
  private readonly logger = new Logger(ResearchOrchestratorService.name);

  constructor(
    private readonly repository: ResearchRepository,
    private readonly eventsService: ResearchEventsService,
    private readonly plannerService: PlannerService,
    private readonly researcherService: ResearcherService,
    private readonly analyzerService: AnalyzerService,
    private readonly comparisonService: ComparisonService,
    private readonly reporterService: ReporterService,
    private readonly sourcesService: SourcesService,
    private readonly extractorService: SourceExtractorService,
    private readonly ragService: RagService,
    private readonly pineconeService: PineconeService,
    @InjectModel(ResearchSession.name) private sessionModel: Model<ResearchSessionDocument>,
    @InjectModel(ResearchTask.name) private taskModel: Model<ResearchTaskDocument>,
    @InjectModel(Source.name) private sourceModel: Model<SourceDocument>,
    @InjectModel(Report.name) private reportModel: Model<ReportDocument>,
  ) { }

  async runResearch(researchId: string): Promise<void> {
    const session = await this.repository.findSessionById(researchId);
    if (!session) {
      this.logger.error(`[Orchestrator] Session not found: ${researchId}`);
      return;
    }

    try {
      await this.repository.setStartedAt(researchId);

      // STEP 1: PLANNING
      await this.updateStage(researchId, ResearchStatus.PLANNING, 'Planning research tasks');
      this.publishEvent(researchId, ResearchEventType.PLANNING, 'Planning research tasks', {
        question: session.question,
        mode: session.mode,
        includeNews: session.includeNews,
        includeScholar: session.includeScholar,
      });

      const plan = await this.plannerService.plan(
        session.question,
        session.mode as ResearchMode,
        session.includeNews,
        session.includeScholar,
      );

      this.publishEvent(researchId, ResearchEventType.PLAN_CREATED, `Created ${plan.tasks.length} research tasks`, {
        taskCount: plan.tasks.length,
        tasks: plan.tasks,
      });

      // STEP 2: SEARCHING
      await this.updateStage(researchId, ResearchStatus.SEARCHING, 'Searching sources');
      this.publishEvent(researchId, ResearchEventType.SEARCH_STARTED, 'Searching sources', {
        taskCount: plan.tasks.length,
        maxSources: session.maxSources,
        includeScholar: session.includeScholar,
      });

      const taskResults = await this.researcherService.executeTasks(
        plan.tasks,
        session.maxSources,
        session.includeScholar,
      );

      const resultCount = taskResults.reduce((total, task) => total + task.results.length, 0);

      this.publishEvent(researchId, ResearchEventType.SEARCH_COMPLETED, `Found ${resultCount} results`, {
        taskResultsCount: taskResults.length,
        resultCount,
      });

      // STEP 3: COLLECTING SOURCES
      await this.updateStage(researchId, ResearchStatus.COLLECTING, 'Collecting sources');
      this.publishEvent(researchId, ResearchEventType.SOURCES_COLLECTED, 'Collecting sources', {
        taskResultsCount: taskResults.length,
      });

      const allResults = taskResults.flatMap((r) => r.results);

      const sources = await this.sourcesService.collectSources(
        researchId,
        allResults,
        session.maxSources,
      );

      const dedupedSources = await this.sourcesService.deduplicateSources(researchId);

      this.publishEvent(researchId, ResearchEventType.DEDUPLICATION_COMPLETED, `Deduplicated to ${dedupedSources.length} sources`, {
        allResults: allResults.length,
        sources: sources.length,
        dedupedSources: dedupedSources.length,
      });

      // STEP 4: PROCESSING
      await this.updateStage(researchId, ResearchStatus.PROCESSING, 'Extracting content from sources');
      this.publishEvent(researchId, ResearchEventType.PROCESSING_STARTED, 'Extracting content from sources', {
        sourceCount: dedupedSources.length,
      });

      for (const source of dedupedSources) {
        const extracted = await this.extractorService.extract(source.url);

        if (extracted) {
          await this.sourcesService.updateSourceContent(
            source._id.toString(),
            extracted.content,
            ContentStatus.EXTRACTED,
            extracted.canonicalUrl,
            extracted.author || '',
            extracted.publishedAt ? new Date(extracted.publishedAt) : undefined,
          );
        } else {
          await this.sourcesService.updateSourceContent(
            source._id.toString(),
            source.snippet,
            ContentStatus.SKIPPED,
          );
        }
      }

      // STEP 5: INDEXING
      await this.updateStage(researchId, ResearchStatus.INDEXING, 'Indexing sources');
      this.publishEvent(researchId, ResearchEventType.INDEXING_STARTED, 'Indexing sources', {
        researchId,
        sourceCount: dedupedSources.length,
      });

      const processedSources = await this.sourceModel.find({ researchId }).exec();

      let totalChunks = 0;

      for (const source of processedSources) {
        if (!source.content || source.content.length < 50) continue;

        const chunks = await this.ragService.indexSource(
          researchId,
          source._id.toString(),
          source.content,
          {
            title: source.title,
            url: source.url,
            domain: source.domain,
            publishedAt: source.publishedAt ? source.publishedAt.toISOString() : null,
          },
        );

        totalChunks += chunks;
      }

      // STEP 6: RAG RETRIEVAL
      const evidence = await this.ragService.retrieveEvidence(
        researchId,
        session.question,
        15,
      );

      this.publishEvent(researchId, ResearchEventType.RAG_COMPLETED, `Retrieved ${evidence.length} evidence chunks`, {
        processedSources: processedSources.length,
        totalChunks,
        evidenceCount: evidence.length,
      });

      // STEP 7: ANALYZING
      const sourceInfos = processedSources.map((s) => ({
        sourceId: s._id.toString(),
        title: s.title,
        url: s.url,
        domain: s.domain,
        snippet: s.snippet,
        content: s.content,
        publishedAt: s.publishedAt ? s.publishedAt.toISOString() : null,
      }));

      await this.updateStage(researchId, ResearchStatus.ANALYZING, 'Analyzing evidence and extracting claims');
      this.publishEvent(researchId, ResearchEventType.ANALYSIS_STARTED, 'Analyzing evidence and extracting claims', {
        question: session.question,
        evidenceCount: evidence.length,
        sourceCount: sourceInfos.length,
      });

      const analysis = await this.analyzerService.analyze(
        session.question,
        evidence,
        sourceInfos,
      );

      // STEP 8: COMPARING
      await this.updateStage(researchId, ResearchStatus.COMPARING, 'Comparing claims across sources');

      const comparison = await this.comparisonService.compare(
        analysis.claims,
        session.question,
      );

      this.publishEvent(researchId, ResearchEventType.COMPARISON_COMPLETED, `Found ${comparison.agreements.length} agreements, ${comparison.conflicts.length} conflicts`, {
        claimCount: analysis.claims.length,
        conflicts: comparison.conflicts.length,
        agreements: comparison.agreements.length,
      });

      // STEP 9: REPORT GENERATION
      await this.updateStage(researchId, ResearchStatus.GENERATING_REPORT, 'Generating report');

      const metrics = await this.calculateMetrics(
        researchId,
        dedupedSources,
        comparison.conflicts.length,
        plan.tasks.length,
      );

      this.publishEvent(researchId, ResearchEventType.REPORT_STARTED, 'Generating report', {
        question: session.question,
        taskCount: plan.tasks.length,
        claimCount: analysis.claims.length,
        sourceCount: sourceInfos.length,
        conflicts: comparison.conflicts.length,
        agreements: comparison.agreements.length,
        metrics,
      });

      const reportData = await this.reporterService.generateReport({
        question: session.question,
        plan,
        claims: analysis.claims,
        comparison,
        sources: sourceInfos.map((s) => ({
          sourceId: s.sourceId,
          title: s.title,
          url: s.url,
          domain: s.domain,
          publishedAt: s.publishedAt,
        })),
        metrics,
      });

      // Store report in MongoDB
      const report = new this.reportModel({
        researchId,
        ...reportData,
        claims: analysis.claims,
        metrics,
      });
      await report.save();

      // Update session
      await this.repository.setCompleted(researchId, report._id.toString());
      await this.repository.updateMetrics(researchId, metrics);
      await this.repository.updateSession(researchId, {
        sourcesFound: dedupedSources.length,
        sourcesAnalyzed: metrics.sourcesAnalyzed as number,
        relevantSources: metrics.relevantSources as number,
        conflictingClaims: comparison.conflicts.length,
      });

      await this.updateStage(researchId, ResearchStatus.COMPLETED, 'Research completed');
      this.publishEvent(researchId, ResearchEventType.COMPLETED, 'Research completed', {
        reportId: report._id.toString(),
      });
      this.logger.log(`[Orchestrator] Research completed: ${researchId}`);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`[Orchestrator] Research failed: ${message}`, error instanceof Error ? error.stack : undefined);
      await this.repository.setFailed(researchId, message);
      await this.updateStage(researchId, ResearchStatus.FAILED, `Research failed: ${message}`);
      this.publishEvent(researchId, ResearchEventType.FAILED, `Research failed: ${message}`, {
        error: message,
      });
    }
  }
  private async updateStage(researchId: string, status: ResearchStatus, step: string): Promise<void> {
    const progress = STAGE_PROGRESS[status] || 0;
    await this.repository.updateStatus(researchId, status, progress, step);
  }

  private publishEvent(
    researchId: string,
    event: ResearchEventType,
    message: string,
    data?: Record<string, unknown>,
  ): void {
    const session = this.repository.findSessionById(researchId);
    session.then((s) => {
      const progress = s?.progress || 0;
      this.eventsService.publish(researchId, event, progress, message, data);
    });
  }

  private async calculateMetrics(
    researchId: string,
    sources: SourceDocument[],
    conflictingClaims: number,
    searchQueriesExecuted: number,
  ): Promise<Record<string, number>> {
    const uniqueDomains = new Set(sources.map((s) => s.domain)).size;
    const recentSources = sources.filter((s) => isRecentDate(s.publishedAt)).length;
    const sourcesAnalyzed = sources.filter((s) => s.contentStatus === ContentStatus.EXTRACTED).length;
    const relevantSources = sources.filter((s) => s.relevanceScore > 0).length;

    return {
      sourcesFound: sources.length,
      sourcesAnalyzed,
      relevantSources,
      uniqueDomains,
      recentSources,
      primarySources: 0,
      conflictingClaims,
      searchQueriesExecuted,
    };
  }
}
