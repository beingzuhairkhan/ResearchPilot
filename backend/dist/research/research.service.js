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
var ResearchService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResearchService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const source_schema_1 = require("../sources/schemas/source.schema");
const report_schema_1 = require("../reports/schemas/report.schema");
const research_repository_1 = require("./research.repository");
const research_status_enum_1 = require("../common/enums/research-status.enum");
const research_mode_enum_1 = require("../common/enums/research-mode.enum");
const research_events_service_1 = require("../events/research-events.service");
const research_queue_1 = require("../queue/research.queue");
const text_utils_1 = require("../common/utils/text.utils");
let ResearchService = ResearchService_1 = class ResearchService {
    constructor(repository, eventsService, queueService, configService, sourceModel, reportModel) {
        this.repository = repository;
        this.eventsService = eventsService;
        this.queueService = queueService;
        this.configService = configService;
        this.sourceModel = sourceModel;
        this.reportModel = reportModel;
        this.logger = new common_1.Logger(ResearchService_1.name);
    }
    async createResearch(dto) {
        if (!dto.question || dto.question.trim().length < 10) {
            throw new common_1.BadRequestException('Research question must be at least 10 characters long');
        }
        const mode = dto.mode || research_mode_enum_1.ResearchMode.DEEP;
        const maxSources = dto.maxSources ||
            (mode === research_mode_enum_1.ResearchMode.QUICK
                ? this.configService.get('sources.maxQuick', 10)
                : this.configService.get('sources.maxDeep', 30));
        const normalizedQuestion = (0, text_utils_1.normalizeWhitespace)(dto.question);
        const session = await this.repository.createSession({
            question: dto.question.trim(),
            normalizedQuestion,
            status: research_status_enum_1.ResearchStatus.QUEUED,
            mode,
            progress: 0,
            currentStep: 'queued',
            maxSources,
            includeNews: dto.includeNews ?? true,
            includeScholar: dto.includeScholar ?? false,
        });
        const researchId = session._id.toString();
        this.logger.log(`[Research] Created researchId=${researchId} question="${dto.question}"`);
        this.eventsService.publish(researchId, 'research.created', 0, 'Research session created');
        await this.queueService.addResearchJob(researchId);
        return { researchId, status: research_status_enum_1.ResearchStatus.QUEUED };
    }
    async getResearch(id) {
        const session = await this.repository.findSessionById(id);
        if (!session) {
            return null;
        }
        return session;
    }
    async getResearchHistory(query) {
        const page = query.page || 1;
        const limit = query.limit || 10;
        const { sessions, total } = await this.repository.findSessionsPaginated(page, limit, query.status, query.search);
        return {
            data: sessions,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        };
    }
    async deleteResearch(id) {
        const session = await this.repository.findSessionById(id);
        if (!session) {
            return;
        }
        await this.sourceModel.deleteMany({ researchId: id }).exec();
        await this.reportModel.deleteMany({ researchId: id }).exec();
        await this.repository.deleteSession(id);
        this.logger.log(`[Research] Deleted researchId=${id}`);
    }
    async getResearchPlan(id) {
        const session = await this.repository.findSessionById(id);
        if (!session) {
            return null;
        }
        const tasks = await this.repository.findTasksByResearchId(id);
        return {
            objective: session.plan?.objective || '',
            tasks: tasks.map((t) => ({
                type: t.type,
                query: t.query,
                purpose: t.purpose,
            })),
        };
    }
    async getResearchSources(id, query) {
        const page = query.page || 1;
        const limit = query.limit || 20;
        const skip = (page - 1) * limit;
        const filter = { researchId: id };
        if (query.sourceType) {
            filter.sourceType = query.sourceType;
        }
        const [sources, total] = await Promise.all([
            this.sourceModel.find(filter).sort({ relevanceScore: -1 }).skip(skip).limit(limit).exec(),
            this.sourceModel.countDocuments(filter).exec(),
        ]);
        return {
            data: sources,
            pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
        };
    }
};
exports.ResearchService = ResearchService;
exports.ResearchService = ResearchService = ResearchService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(4, (0, mongoose_1.InjectModel)(source_schema_1.Source.name)),
    __param(5, (0, mongoose_1.InjectModel)(report_schema_1.Report.name)),
    __metadata("design:paramtypes", [research_repository_1.ResearchRepository,
        research_events_service_1.ResearchEventsService,
        research_queue_1.ResearchQueueService,
        config_1.ConfigService,
        mongoose_2.Model,
        mongoose_2.Model])
], ResearchService);
//# sourceMappingURL=research.service.js.map