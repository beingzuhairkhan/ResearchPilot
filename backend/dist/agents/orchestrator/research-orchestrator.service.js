"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var ResearchOrchestratorService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResearchOrchestratorService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const research_session_schema_1 = require("../../research/schemas/research-session.schema");
const research_task_schema_1 = require("../../research/schemas/research-task.schema");
const source_schema_1 = require("../../sources/schemas/source.schema");
const report_schema_1 = require("../../reports/schemas/report.schema");
const research_repository_1 = require("../../research/research.repository");
const research_events_service_1 = require("../../events/research-events.service");
const planner_service_1 = require("../planner/planner.service");
const researcher_service_1 = require("../researcher/researcher.service");
const analyzer_service_1 = require("../analyzer/analyzer.service");
const comparison_service_1 = require("../comparison/comparison.service");
const reporter_service_1 = require("../reporter/reporter.service");
const sources_service_1 = require("../../sources/sources.service");
const source_extractor_service_1 = require("../../sources/source-extractor.service");
const rag_service_1 = require("../../rag/rag.service");
const pinecone_service_1 = require("../../rag/pinecone.service");
const index_1 = require("../../common/constants/index");
const research_event_enum_1 = require("../../common/enums/research-event.enum");
const source_type_enum_1 = require("../../common/enums/source-type.enum");
const constants_1 = require("../../common/constants");
const url_utils_1 = require("../../common/utils/url.utils");
let ResearchOrchestratorService = ResearchOrchestratorService_1 = class ResearchOrchestratorService {
    constructor(repository, eventsService, plannerService, researcherService, analyzerService, comparisonService, reporterService, sourcesService, extractorService, ragService, pineconeService, sessionModel, taskModel, sourceModel, reportModel) {
        this.repository = repository;
        this.eventsService = eventsService;
        this.plannerService = plannerService;
        this.researcherService = researcherService;
        this.analyzerService = analyzerService;
        this.comparisonService = comparisonService;
        this.reporterService = reporterService;
        this.sourcesService = sourcesService;
        this.extractorService = extractorService;
        this.ragService = ragService;
        this.pineconeService = pineconeService;
        this.sessionModel = sessionModel;
        this.taskModel = taskModel;
        this.sourceModel = sourceModel;
        this.reportModel = reportModel;
        this.logger = new common_1.Logger(ResearchOrchestratorService_1.name);
    }
    parseDate(value) {
        if (!value)
            return undefined;
        const date = new Date(value);
        return Number.isNaN(date.getTime()) ? undefined : date;
    }
    toISODate(value) {
        const date = this.parseDate(value);
        return date ? date.toISOString() : null;
    }
    async runResearch(researchId) {
        const session = await this.repository.findSessionById(researchId);
        if (!session) {
            this.logger.error(`[Orchestrator] Session not found: ${researchId}`);
            return;
        }
        try {
            await this.repository.setStartedAt(researchId);
            await this.updateStage(researchId, index_1.ResearchStatus.PLANNING, 'Planning research tasks');
            await this.publishEvent(researchId, research_event_enum_1.ResearchEventType.PLAN_CREATED, constants_1.STAGE_PROGRESS[index_1.ResearchStatus.PLANNING] ?? 0, 'Planning research tasks');
            const plan = await this.plannerService.plan(session.question, session.mode, session.includeNews, session.includeScholar);
            await this.repository.savePlan(researchId, plan);
            await this.repository.createTasks(researchId, plan.tasks);
            await this.repository.updateSession(researchId, {
                plan,
            });
            await this.publishEvent(researchId, research_event_enum_1.ResearchEventType.PLAN_CREATED, constants_1.STAGE_PROGRESS[index_1.ResearchStatus.PLANNING] ?? 0, `Created ${plan.tasks.length} research tasks`);
            await this.updateStage(researchId, index_1.ResearchStatus.SEARCHING, 'Searching sources');
            const taskResults = await this.researcherService.executeTasks(plan.tasks, session.maxSources, session.includeScholar);
            const resultCount = taskResults.reduce((total, task) => total + task.results.length, 0);
            await this.publishEvent(researchId, research_event_enum_1.ResearchEventType.SEARCH_COMPLETED, constants_1.STAGE_PROGRESS[index_1.ResearchStatus.SEARCHING] ?? 0, `Found ${resultCount} results`);
            await this.updateStage(researchId, index_1.ResearchStatus.COLLECTING, 'Collecting sources');
            const allResults = taskResults.flatMap((result) => result.results);
            await this.sourcesService.collectSources(researchId, allResults, session.maxSources);
            const dedupedSources = await this.sourcesService.deduplicateSources(researchId);
            await this.publishEvent(researchId, research_event_enum_1.ResearchEventType.DEDUPLICATION_COMPLETED, constants_1.STAGE_PROGRESS[index_1.ResearchStatus.COLLECTING] ?? 0, `Deduplicated to ${dedupedSources.length} sources`);
            await this.updateStage(researchId, index_1.ResearchStatus.PROCESSING, 'Extracting content from sources');
            for (const source of dedupedSources) {
                if (source.contentStatus === source_type_enum_1.ContentStatus.EXTRACTED) {
                    continue;
                }
                try {
                    const extracted = await this.extractorService.extract(source.url);
                    if (!extracted) {
                        await this.sourcesService.updateSourceContent(source._id.toString(), source.snippet, source_type_enum_1.ContentStatus.SKIPPED);
                        continue;
                    }
                    const publishedAt = this.parseDate(extracted.publishedAt);
                    this.logger.debug(`[Orchestrator] Source=${source.url} ` +
                        `rawPublishedAt=${JSON.stringify(extracted.publishedAt)} ` +
                        `parsedPublishedAt=${publishedAt?.toISOString() ?? 'undefined'}`);
                    await this.sourcesService.updateSourceContent(source._id.toString(), extracted.content, source_type_enum_1.ContentStatus.EXTRACTED, extracted.canonicalUrl, extracted.author || '', publishedAt);
                }
                catch (err) {
                    this.logger.warn(`[Orchestrator] Extraction failed for ${source.url}: ${err instanceof Error ? err.message : String(err)}`);
                    try {
                        await this.sourcesService.updateSourceContent(source._id.toString(), source.snippet, source_type_enum_1.ContentStatus.SKIPPED);
                    }
                    catch (fallbackError) {
                        this.logger.error(`[Orchestrator] Failed to mark source as skipped: ${fallbackError instanceof Error
                            ? fallbackError.message
                            : String(fallbackError)}`);
                    }
                }
            }
            await this.publishEvent(researchId, research_event_enum_1.ResearchEventType.PROCESSING_COMPLETED, constants_1.STAGE_PROGRESS[index_1.ResearchStatus.PROCESSING] ?? 0, 'Document processing completed');
            await this.updateStage(researchId, index_1.ResearchStatus.INDEXING, 'Indexing sources');
            const processedSources = await this.sourceModel
                .find({ researchId })
                .exec();
            for (const source of processedSources) {
                if (!source.content || source.content.length < 50) {
                    continue;
                }
                await this.ragService.indexSource(researchId, source._id.toString(), source.content, {
                    title: source.title,
                    url: source.url,
                    domain: source.domain,
                    publishedAt: this.toISODate(source.publishedAt),
                });
            }
            await this.publishEvent(researchId, research_event_enum_1.ResearchEventType.INDEXING_COMPLETED, constants_1.STAGE_PROGRESS[index_1.ResearchStatus.INDEXING] ?? 0, 'Indexing completed');
            await this.updateStage(researchId, index_1.ResearchStatus.RAG_RETRIEVAL, 'Retrieving evidence');
            const evidence = await this.ragService.retrieveEvidence(researchId, session.question, 15);
            await this.publishEvent(researchId, research_event_enum_1.ResearchEventType.RAG_COMPLETED, constants_1.STAGE_PROGRESS[index_1.ResearchStatus.RAG_RETRIEVAL] ?? 0, 'Evidence retrieval completed');
            await this.updateStage(researchId, index_1.ResearchStatus.ANALYZING, 'Analyzing evidence and extracting claims');
            const sourceInfos = processedSources.map((source) => ({
                sourceId: source._id.toString(),
                title: source.title,
                url: source.url,
                domain: source.domain,
                snippet: source.snippet,
                content: source.content,
                publishedAt: this.toISODate(source.publishedAt),
            }));
            const analysis = await this.analyzerService.analyze(session.question, evidence, sourceInfos);
            await this.publishEvent(researchId, research_event_enum_1.ResearchEventType.ANALYSIS_COMPLETED, constants_1.STAGE_PROGRESS[index_1.ResearchStatus.ANALYZING] ?? 0, 'Analysis completed');
            await this.updateStage(researchId, index_1.ResearchStatus.COMPARING, 'Comparing claims across sources');
            const comparison = await this.comparisonService.compare(analysis.claims, session.question);
            await this.publishEvent(researchId, research_event_enum_1.ResearchEventType.COMPARISON_COMPLETED, constants_1.STAGE_PROGRESS[index_1.ResearchStatus.COMPARING] ?? 0, 'Comparison completed');
            await this.updateStage(researchId, index_1.ResearchStatus.GENERATING_REPORT, 'Generating report');
            const metrics = await this.calculateMetrics(researchId, dedupedSources, comparison.conflicts.length, plan.tasks.length);
            const reportData = await this.reporterService.generateReport({
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
            await this.publishEvent(researchId, research_event_enum_1.ResearchEventType.REPORT_COMPLETED, constants_1.STAGE_PROGRESS[index_1.ResearchStatus.GENERATING_REPORT] ?? 0, 'Report generation completed');
            await this.repository.setCompleted(researchId, report._id.toString());
            await this.repository.updateMetrics(researchId, metrics);
            await this.repository.updateSession(researchId, {
                sourcesFound: dedupedSources.length,
                sourcesAnalyzed: metrics.sourcesAnalyzed,
                relevantSources: metrics.relevantSources,
                conflictingClaims: comparison.conflicts.length,
            });
            await this.updateStage(researchId, index_1.ResearchStatus.COMPLETED, 'Research completed');
            await this.publishEvent(researchId, research_event_enum_1.ResearchEventType.COMPLETED, constants_1.STAGE_PROGRESS[index_1.ResearchStatus.COMPLETED] ?? 100, 'Research completed');
            this.logger.log(`[Orchestrator] Research completed: ${researchId}`);
        }
        catch (error) {
            const message = error instanceof Error
                ? error.message
                : 'Unknown error';
            this.logger.error(`[Orchestrator] Research failed: ${message}`, error instanceof Error ? error.stack : undefined);
            await this.repository.setFailed(researchId, message);
            await this.updateStage(researchId, index_1.ResearchStatus.FAILED, `Research failed: ${message}`);
            await this.publishEvent(researchId, research_event_enum_1.ResearchEventType.FAILED, constants_1.STAGE_PROGRESS[index_1.ResearchStatus.FAILED] ?? 0, `Research failed: ${message}`);
        }
    }
    async updateStage(researchId, status, step) {
        const progress = constants_1.STAGE_PROGRESS[status] ?? 0;
        await this.repository.updateStatus(researchId, status, progress, step);
    }
    async publishEvent(researchId, event, progress, message) {
        await this.eventsService.publish(researchId, event, progress, message);
    }
    async calculateMetrics(researchId, sources, conflictingClaims, searchQueriesExecuted) {
        const uniqueDomains = new Set(sources.map((s) => s.domain)).size;
        const recentSources = sources.filter((s) => (0, url_utils_1.isRecentDate)(s.publishedAt)).length;
        const sourcesAnalyzed = sources.filter((s) => s.contentStatus === source_type_enum_1.ContentStatus.EXTRACTED).length;
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
};
exports.ResearchOrchestratorService = ResearchOrchestratorService;
exports.ResearchOrchestratorService = ResearchOrchestratorService = ResearchOrchestratorService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(11, (0, mongoose_1.InjectModel)(research_session_schema_1.ResearchSession.name)),
    __param(12, (0, mongoose_1.InjectModel)(research_task_schema_1.ResearchTask.name)),
    __param(13, (0, mongoose_1.InjectModel)(source_schema_1.Source.name)),
    __param(14, (0, mongoose_1.InjectModel)(report_schema_1.Report.name)),
    __metadata("design:paramtypes", [research_repository_1.ResearchRepository,
        research_events_service_1.ResearchEventsService,
        planner_service_1.PlannerService,
        researcher_service_1.ResearcherService,
        analyzer_service_1.AnalyzerService,
        comparison_service_1.ComparisonService,
        reporter_service_1.ReporterService,
        sources_service_1.SourcesService,
        source_extractor_service_1.SourceExtractorService,
        rag_service_1.RagService,
        pinecone_service_1.PineconeService,
        mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model])
], ResearchOrchestratorService);
//# sourceMappingURL=research-orchestrator.service.js.map