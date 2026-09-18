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
const research_status_enum_1 = require("../../common/enums/research-status.enum");
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
    async runResearch(researchId) {
        const session = await this.repository.findSessionById(researchId);
        if (!session) {
            this.logger.error(`[Orchestrator] Session not found: ${researchId}`);
            return;
        }
        try {
            await this.repository.setStartedAt(researchId);
            console.log('[STEP 1] PLANNING', {
                researchId,
                question: session.question,
                mode: session.mode,
                includeNews: session.includeNews,
                includeScholar: session.includeScholar,
            });
            await this.updateStage(researchId, research_status_enum_1.ResearchStatus.PLANNING, 'Planning research tasks');
            this.publishEvent(researchId, research_event_enum_1.ResearchEventType.PLANNING, 'Planning research tasks');
            const plan = await this.plannerService.plan(session.question, session.mode, session.includeNews, session.includeScholar);
            console.log('[STEP 1] PLAN RESULT', {
                taskCount: plan.tasks.length,
                tasks: plan.tasks,
            });
            console.log('[STEP 2] SEARCHING', {
                taskCount: plan.tasks.length,
                maxSources: session.maxSources,
                includeScholar: session.includeScholar,
            });
            const taskResults = await this.researcherService.executeTasks(plan.tasks, session.maxSources, session.includeScholar);
            console.log('[STEP 2] SEARCH RESULT', {
                taskResultsCount: taskResults.length,
                resultCount: taskResults.reduce((total, task) => total + task.results.length, 0),
            });
            console.log('[STEP 3] COLLECTING SOURCES', {
                taskResultsCount: taskResults.length,
            });
            const allResults = taskResults.flatMap((r) => r.results);
            const sources = await this.sourcesService.collectSources(researchId, allResults, session.maxSources);
            const dedupedSources = await this.sourcesService.deduplicateSources(researchId);
            console.log('[STEP 3] SOURCES RESULT', {
                allResults: allResults.length,
                sources: sources.length,
                dedupedSources: dedupedSources.length,
            });
            console.log('[STEP 4] PROCESSING', {
                sourceCount: dedupedSources.length,
            });
            for (const source of dedupedSources) {
                const extracted = await this.extractorService.extract(source.url);
                if (extracted) {
                    await this.sourcesService.updateSourceContent(source._id.toString(), extracted.content, source_type_enum_1.ContentStatus.EXTRACTED, extracted.canonicalUrl, extracted.author || '', extracted.publishedAt ? new Date(extracted.publishedAt) : undefined);
                }
                else {
                    await this.sourcesService.updateSourceContent(source._id.toString(), source.snippet, source_type_enum_1.ContentStatus.SKIPPED);
                }
            }
            console.log('[STEP 4] PROCESSING RESULT', {
                processedSources: dedupedSources.length,
            });
            console.log('[STEP 5] INDEXING', {
                researchId,
                sourceCount: dedupedSources.length,
            });
            const processedSources = await this.sourceModel.find({ researchId }).exec();
            let totalChunks = 0;
            for (const source of processedSources) {
                if (!source.content || source.content.length < 50)
                    continue;
                const chunks = await this.ragService.indexSource(researchId, source._id.toString(), source.content, {
                    title: source.title,
                    url: source.url,
                    domain: source.domain,
                    publishedAt: source.publishedAt
                        ? source.publishedAt.toISOString()
                        : null,
                });
                totalChunks += chunks;
            }
            console.log('[STEP 5] INDEXING RESULT', {
                processedSources: processedSources.length,
                totalChunks,
            });
            console.log('[STEP 6] RAG RETRIEVAL', {
                question: session.question,
                topK: 15,
            });
            const evidence = await this.ragService.retrieveEvidence(researchId, session.question, 15);
            console.log('[STEP 6] RAG RESULT', {
                evidenceCount: evidence.length,
                evidence,
            });
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
            const analysis = await this.analyzerService.analyze(session.question, evidence, sourceInfos);
            console.log('[STEP 7] ANALYSIS RESULT', {
                claimCount: analysis.claims.length,
                claims: analysis.claims,
            });
            console.log('[STEP 8] COMPARING', {
                claimCount: analysis.claims.length,
                question: session.question,
            });
            const comparison = await this.comparisonService.compare(analysis.claims, session.question);
            console.log('[STEP 8] COMPARISON RESULT', {
                conflicts: comparison.conflicts.length,
                agreements: comparison.agreements.length,
            });
            console.log('[STEP 9] REPORT GENERATION', {
                question: session.question,
                taskCount: plan.tasks.length,
                claimCount: analysis.claims.length,
                sourceCount: sourceInfos.length,
                conflicts: comparison.conflicts.length,
                agreements: comparison.agreements.length,
            });
            const metrics = await this.calculateMetrics(researchId, dedupedSources, comparison.conflicts.length, plan.tasks.length);
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
            const report = new this.reportModel({
                researchId,
                ...reportData,
                claims: analysis.claims,
                metrics,
            });
            await report.save();
            await this.repository.setCompleted(researchId, report._id.toString());
            await this.repository.updateMetrics(researchId, metrics);
            await this.repository.updateSession(researchId, {
                sourcesFound: dedupedSources.length,
                sourcesAnalyzed: metrics.sourcesAnalyzed,
                relevantSources: metrics.relevantSources,
                conflictingClaims: comparison.conflicts.length,
            });
            this.publishEvent(researchId, research_event_enum_1.ResearchEventType.COMPLETED, 'Research completed', {
                reportId: report._id.toString(),
            });
            this.logger.log(`[Orchestrator] Research completed: ${researchId}`);
        }
        catch (error) {
            const message = error instanceof Error ? error.message : 'Unknown error';
            this.logger.error(`[Orchestrator] Research failed: ${message}`, error instanceof Error ? error.stack : undefined);
            await this.repository.setFailed(researchId, message);
            this.publishEvent(researchId, research_event_enum_1.ResearchEventType.FAILED, `Research failed: ${message}`, {
                error: message,
            });
        }
    }
    async updateStage(researchId, status, step) {
        const progress = constants_1.STAGE_PROGRESS[status] || 0;
        await this.repository.updateStatus(researchId, status, progress, step);
    }
    publishEvent(researchId, event, message, data) {
        const session = this.repository.findSessionById(researchId);
        session.then((s) => {
            const progress = s?.progress || 0;
            this.eventsService.publish(researchId, event, progress, message, data);
        });
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