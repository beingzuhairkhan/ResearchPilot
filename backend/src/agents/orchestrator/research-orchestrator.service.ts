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
      console.log('[STEP 1] PLANNING', {
        researchId,
        question: session.question,
        mode: session.mode,
        includeNews: session.includeNews,
        includeScholar: session.includeScholar,
      });

      await this.updateStage(researchId, ResearchStatus.PLANNING, 'Planning research tasks');
      this.publishEvent(researchId, ResearchEventType.PLANNING, 'Planning research tasks');

      const plan = await this.plannerService.plan(
        session.question,
        session.mode as ResearchMode,
        session.includeNews,
        session.includeScholar,
      );

      console.log('[STEP 1] PLAN RESULT', {
        taskCount: plan.tasks.length,
        tasks: plan.tasks,
      });

      // STEP 2: SEARCHING
      console.log('[STEP 2] SEARCHING', {
        taskCount: plan.tasks.length,
        maxSources: session.maxSources,
        includeScholar: session.includeScholar,
      });

      const taskResults = await this.researcherService.executeTasks(
        plan.tasks,
        session.maxSources,
        session.includeScholar,
      );

      console.log('[STEP 2] SEARCH RESULT', {
        taskResultsCount: taskResults.length,
        resultCount: taskResults.reduce(
          (total, task) => total + task.results.length,
          0,
        ),
      });

      // STEP 3: COLLECTING SOURCES
      console.log('[STEP 3] COLLECTING SOURCES', {
        taskResultsCount: taskResults.length,
      });

      const allResults = taskResults.flatMap((r) => r.results);

      const sources = await this.sourcesService.collectSources(
        researchId,
        allResults,
        session.maxSources,
      );

      const dedupedSources =
        await this.sourcesService.deduplicateSources(researchId);

      console.log('[STEP 3] SOURCES RESULT', {
        allResults: allResults.length,
        sources: sources.length,
        dedupedSources: dedupedSources.length,
      });

      // STEP 4: PROCESSING
      console.log('[STEP 4] PROCESSING', {
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

      console.log('[STEP 4] PROCESSING RESULT', {
        processedSources: dedupedSources.length,
      });

      // STEP 5: INDEXING
      console.log('[STEP 5] INDEXING', {
        researchId,
        sourceCount: dedupedSources.length,
      });

      const processedSources =
        await this.sourceModel.find({ researchId }).exec();

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
            publishedAt: source.publishedAt
              ? source.publishedAt.toISOString()
              : null,
          },
        );

        totalChunks += chunks;
      }

      console.log('[STEP 5] INDEXING RESULT', {
        processedSources: processedSources.length,
        totalChunks,
      });

      // STEP 6: RAG RETRIEVAL
      console.log('[STEP 6] RAG RETRIEVAL', {
        question: session.question,
        topK: 15,
      });

      const evidence = await this.ragService.retrieveEvidence(
        researchId,
        session.question,
        15,
      );

      console.log('[STEP 6] RAG RESULT', {
        evidenceCount: evidence.length,
        evidence,
      });

      // STEP 7: ANALYZING
      const sourceInfos = processedSources.map((s) => ({
        sourceId: s._id.toString(),
        title: s.title,
        url: s.url,
        domain: s.domain,
        snippet: s.snippet,
        content: s.content,
        publishedAt: s.publishedAt
          ? s.publishedAt.toISOString()
          : null,
      }));

      console.log('[STEP 7] ANALYZING', {
        question: session.question,
        evidenceCount: evidence.length,
        sourceCount: sourceInfos.length,
      });

      const analysis = await this.analyzerService.analyze(
        session.question,
        evidence,
        sourceInfos,
      );

      console.log('[STEP 7] ANALYSIS RESULT', {
        claimCount: analysis.claims.length,
        claims: analysis.claims,
      });

      // STEP 8: COMPARING
      console.log('[STEP 8] COMPARING', {
        claimCount: analysis.claims.length,
        question: session.question,
      });

      const comparison = await this.comparisonService.compare(
        analysis.claims,
        session.question,
      );

      console.log('[STEP 8] COMPARISON RESULT', {
        conflicts: comparison.conflicts.length,
        agreements: comparison.agreements.length,
      });

      // STEP 9: REPORT GENERATION
      console.log('[STEP 9] REPORT GENERATION', {
        question: session.question,
        taskCount: plan.tasks.length,
        claimCount: analysis.claims.length,
        sourceCount: sourceInfos.length,
        conflicts: comparison.conflicts.length,
        agreements: comparison.agreements.length,
      });

      const metrics = await this.calculateMetrics(
        researchId,
        dedupedSources,
        comparison.conflicts.length,
        plan.tasks.length,
      );

      console.log('[STEP 9] METRICS', metrics);

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

      console.log('[STEP 9] REPORT RESULT', {
        reportData,
      });

      // ... existing save/update/complete code


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

      this.publishEvent(researchId, ResearchEventType.COMPLETED, 'Research completed', {
        reportId: report._id.toString(),
      });
      this.logger.log(`[Orchestrator] Research completed: ${researchId}`);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`[Orchestrator] Research failed: ${message}`, error instanceof Error ? error.stack : undefined);
      await this.repository.setFailed(researchId, message);
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
