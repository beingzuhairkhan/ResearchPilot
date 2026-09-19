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
import { ResearchStatus } from '../../common/constants/index'
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

  private parseDate(value: unknown): Date | undefined {
    if (!value) return undefined;
    const date = new Date(value as string | number | Date);
    return Number.isNaN(date.getTime()) ? undefined : date;
  }


  private toISODate(value: unknown): string | null {
    const date = this.parseDate(value);
    return date ? date.toISOString() : null;
  }

  async runResearch(researchId: string): Promise<void> {
    const session = await this.repository.findSessionById(researchId);

    if (!session) {
      this.logger.error(`[Orchestrator] Session not found: ${researchId}`);
      return;
    }

    try {
      await this.repository.setStartedAt(researchId);

      // STEP 1: PLANNING

      await this.updateStage(
        researchId,
        ResearchStatus.PLANNING,
        'Planning research tasks',
      );

      await this.publishEvent(
        researchId,
        ResearchEventType.PLAN_CREATED,
        STAGE_PROGRESS[ResearchStatus.PLANNING] ?? 0,
        'Planning research tasks',
      );

      const plan = await this.plannerService.plan(
        session.question,
        session.mode as ResearchMode,
        session.includeNews,
        session.includeScholar,
      );

      await this.repository.savePlan(researchId, plan);
      await this.repository.createTasks(researchId, plan.tasks);

      await this.repository.updateSession(researchId, {
        plan,
      });

      await this.publishEvent(
        researchId,
        ResearchEventType.PLAN_CREATED,
        STAGE_PROGRESS[ResearchStatus.PLANNING] ?? 0,
        `Created ${plan.tasks.length} research tasks`,
      );

      // STEP 2: SEARCHING

      await this.updateStage(
        researchId,
        ResearchStatus.SEARCHING,
        'Searching sources',
      );

      const taskResults = await this.researcherService.executeTasks(
        plan.tasks,
        session.maxSources,
        session.includeScholar,
      );

      const resultCount = taskResults.reduce(
        (total, task) => total + task.results.length,
        0,
      );

      await this.publishEvent(
        researchId,
        ResearchEventType.SEARCH_COMPLETED,
        STAGE_PROGRESS[ResearchStatus.SEARCHING] ?? 0,
        `Found ${resultCount} results`,
      );

      // STEP 3: COLLECTING SOURCES

      await this.updateStage(
        researchId,
        ResearchStatus.COLLECTING,
        'Collecting sources',
      );

      const allResults = taskResults.flatMap(
        (result) => result.results,
      );

      await this.sourcesService.collectSources(
        researchId,
        allResults,
        session.maxSources,
      );

      const dedupedSources =
        await this.sourcesService.deduplicateSources(researchId);

      await this.publishEvent(
        researchId,
        ResearchEventType.DEDUPLICATION_COMPLETED,
        STAGE_PROGRESS[ResearchStatus.COLLECTING] ?? 0,
        `Deduplicated to ${dedupedSources.length} sources`,
      );

      // STEP 4: PROCESSING

      await this.updateStage(
        researchId,
        ResearchStatus.PROCESSING,
        'Extracting content from sources',
      );

      for (const source of dedupedSources) {
        if (source.contentStatus === ContentStatus.EXTRACTED) {
          continue;
        }

        try {
          const extracted = await this.extractorService.extract(source.url);

          if (!extracted) {
            await this.sourcesService.updateSourceContent(
              source._id.toString(),
              source.snippet,
              ContentStatus.SKIPPED,
            );

            continue;
          }

          const publishedAt = this.parseDate(
            extracted.publishedAt,
          );

          this.logger.debug(
            `[Orchestrator] Source=${source.url} ` +
            `rawPublishedAt=${JSON.stringify(extracted.publishedAt)} ` +
            `parsedPublishedAt=${publishedAt?.toISOString() ?? 'undefined'}`,
          );

          await this.sourcesService.updateSourceContent(
            source._id.toString(),
            extracted.content,
            ContentStatus.EXTRACTED,
            extracted.canonicalUrl,
            extracted.author || '',
            publishedAt,
          );
        } catch (err) {
          this.logger.warn(
            `[Orchestrator] Extraction failed for ${source.url}: ${err instanceof Error ? err.message : String(err)
            }`,
          );

          try {
            await this.sourcesService.updateSourceContent(
              source._id.toString(),
              source.snippet,
              ContentStatus.SKIPPED,
            );
          } catch (fallbackError) {
            this.logger.error(
              `[Orchestrator] Failed to mark source as skipped: ${fallbackError instanceof Error
                ? fallbackError.message
                : String(fallbackError)
              }`,
            );
          }
        }
      }

      await this.publishEvent(
        researchId,
        ResearchEventType.PROCESSING_COMPLETED,
        STAGE_PROGRESS[ResearchStatus.PROCESSING] ?? 0,
        'Document processing completed',
      );

      // STEP 5: INDEXING

      await this.updateStage(
        researchId,
        ResearchStatus.INDEXING,
        'Indexing sources',
      );

      const processedSources = await this.sourceModel
        .find({ researchId })
        .exec();

      for (const source of processedSources) {
        if (!source.content || source.content.length < 50) {
          continue;
        }

        await this.ragService.indexSource(
          researchId,
          source._id.toString(),
          source.content,
          {
            title: source.title,
            url: source.url,
            domain: source.domain,
            publishedAt: this.toISODate(source.publishedAt),
          },
        );
      }

      await this.publishEvent(
        researchId,
        ResearchEventType.INDEXING_COMPLETED,
        STAGE_PROGRESS[ResearchStatus.INDEXING] ?? 0,
        'Indexing completed',
      );

      // STEP 6: RAG RETRIEVAL

      await this.updateStage(
        researchId,
        ResearchStatus.RAG_RETRIEVAL,
        'Retrieving evidence',
      );

      const evidence = await this.ragService.retrieveEvidence(
        researchId,
        session.question,
        15,
      );

      await this.publishEvent(
        researchId,
        ResearchEventType.RAG_COMPLETED,
        STAGE_PROGRESS[ResearchStatus.RAG_RETRIEVAL] ?? 0,
        'Evidence retrieval completed',
      );

      // STEP 7: ANALYZING

      await this.updateStage(
        researchId,
        ResearchStatus.ANALYZING,
        'Analyzing evidence and extracting claims',
      );

      const sourceInfos = processedSources.map((source) => ({
        sourceId: source._id.toString(),
        title: source.title,
        url: source.url,
        domain: source.domain,
        snippet: source.snippet,
        content: source.content,
        publishedAt: this.toISODate(source.publishedAt),
      }));

      const analysis = await this.analyzerService.analyze(
        session.question,
        evidence,
        sourceInfos,
      );

      await this.publishEvent(
        researchId,
        ResearchEventType.ANALYSIS_COMPLETED,
        STAGE_PROGRESS[ResearchStatus.ANALYZING] ?? 0,
        'Analysis completed',
      );

      // STEP 8: COMPARING

      await this.updateStage(
        researchId,
        ResearchStatus.COMPARING,
        'Comparing claims across sources',
      );

      const comparison = await this.comparisonService.compare(
        analysis.claims,
        session.question,
      );

      await this.publishEvent(
        researchId,
        ResearchEventType.COMPARISON_COMPLETED,
        STAGE_PROGRESS[ResearchStatus.COMPARING] ?? 0,
        'Comparison completed',
      );

      // STEP 9: REPORT GENERATION

      await this.updateStage(
        researchId,
        ResearchStatus.GENERATING_REPORT,
        'Generating report',
      );

      const metrics = await this.calculateMetrics(
        researchId,
        dedupedSources,
        comparison.conflicts.length,
        plan.tasks.length,
      );

      const reportData =
        await this.reporterService.generateReport({
          question: session.question,
          plan,
          claims: analysis.claims,
          comparison,
          sources: sourceInfos.map((source) => ({
            sourceId: source.sourceId,
            title: source.title,
            url: source.url,
            domain: source.domain,
            publishedAt: source.publishedAt,
          })),
          metrics,
        });

      const report = new this.reportModel({
        researchId,
        ...reportData,
        claims: analysis.claims,
        metrics,
      });

      await report.save();

      await this.publishEvent(
        researchId,
        ResearchEventType.REPORT_COMPLETED,
        STAGE_PROGRESS[ResearchStatus.GENERATING_REPORT] ?? 0,
        'Report generation completed',
      );

      // UPDATE SESSION

      await this.repository.setCompleted(
        researchId,
        report._id.toString(),
      );

      await this.repository.updateMetrics(
        researchId,
        metrics,
      );

      await this.repository.updateSession(researchId, {
        sourcesFound: dedupedSources.length,
        sourcesAnalyzed: metrics.sourcesAnalyzed as number,
        relevantSources: metrics.relevantSources as number,
        conflictingClaims: comparison.conflicts.length,
      });

      // FINAL

      await this.updateStage(
        researchId,
        ResearchStatus.COMPLETED,
        'Research completed',
      );

      await this.publishEvent(
        researchId,
        ResearchEventType.COMPLETED,
        STAGE_PROGRESS[ResearchStatus.COMPLETED] ?? 100,
        'Research completed',
      );

      this.logger.log(
        `[Orchestrator] Research completed: ${researchId}`,
      );
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Unknown error';

      this.logger.error(
        `[Orchestrator] Research failed: ${message}`,
        error instanceof Error ? error.stack : undefined,
      );

      await this.repository.setFailed(
        researchId,
        message,
      );

      await this.updateStage(
        researchId,
        ResearchStatus.FAILED,
        `Research failed: ${message}`,
      );

      await this.publishEvent(
        researchId,
        ResearchEventType.FAILED,
        STAGE_PROGRESS[ResearchStatus.FAILED] ?? 0,
        `Research failed: ${message}`,
      );
    }
  }




  private async updateStage(
    researchId: string,
    status: ResearchStatus,
    step: string,
  ): Promise<void> {
    const progress = STAGE_PROGRESS[status] ?? 0;

    await this.repository.updateStatus(
      researchId,
      status,
      progress,
      step,
    );
  }


  private async publishEvent(
    researchId: string,
    event: ResearchEventType,
    progress: number,
    message: string,
  ): Promise<void> {
    await this.eventsService.publish(
      researchId,
      event,
      progress,
      message,
    );
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
