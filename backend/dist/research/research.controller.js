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
var ResearchController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResearchController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const research_service_1 = require("./research.service");
const create_research_dto_1 = require("./dto/create-research.dto");
const research_query_dto_1 = require("./dto/research-query.dto");
const source_query_dto_1 = require("./dto/source-query.dto");
const research_events_service_1 = require("../events/research-events.service");
let ResearchController = ResearchController_1 = class ResearchController {
    constructor(researchService, eventsService) {
        this.researchService = researchService;
        this.eventsService = eventsService;
        this.logger = new common_1.Logger(ResearchController_1.name);
    }
    async createResearch(dto) {
        const result = await this.researchService.createResearch(dto);
        return { success: true, data: result };
    }
    async getResearchHistory(query) {
        const result = await this.researchService.getResearchHistory(query);
        return { success: true, ...result };
    }
    async getResearch(id) {
        const session = await this.researchService.getResearch(id);
        if (!session) {
            throw new common_1.NotFoundException('Research session not found');
        }
        return { success: true, data: session };
    }
    async deleteResearch(id) {
        await this.researchService.deleteResearch(id);
        return { success: true, message: 'Research session deleted' };
    }
    async getResearchPlan(id) {
        const plan = await this.researchService.getResearchPlan(id);
        if (!plan) {
            throw new common_1.NotFoundException('Research session not found');
        }
        return { success: true, data: plan };
    }
    async getResearchSources(id, query) {
        const result = await this.researchService.getResearchSources(id, query);
        return { success: true, ...result };
    }
    async streamResearch(id, res) {
        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');
        res.setHeader('X-Accel-Buffering', 'no');
        res.flushHeaders();
        const recentEvents = this.eventsService.getRecentEvents(id);
        for (const evt of recentEvents) {
            res.write(`event: ${evt.event}\n`);
            res.write(`data: ${JSON.stringify(evt)}\n\n`);
        }
        const unsubscribe = this.eventsService.subscribe(id, (evt) => {
            res.write(`event: ${evt.event}\n`);
            res.write(`data: ${JSON.stringify(evt)}\n\n`);
        });
        const keepAlive = setInterval(() => {
            res.write(': keepalive\n\n');
        }, 15000);
        res.on('close', () => {
            clearInterval(keepAlive);
            unsubscribe();
        });
    }
};
exports.ResearchController = ResearchController;
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Create a new research session' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Research session created and queued' }),
    (0, swagger_1.ApiBody)({ type: create_research_dto_1.CreateResearchDto }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_research_dto_1.CreateResearchDto]),
    __metadata("design:returntype", Promise)
], ResearchController.prototype, "createResearch", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get research history with pagination' }),
    (0, swagger_1.ApiQuery)({ name: 'page', required: false, type: Number }),
    (0, swagger_1.ApiQuery)({ name: 'limit', required: false, type: Number }),
    (0, swagger_1.ApiQuery)({ name: 'status', required: false, type: String }),
    (0, swagger_1.ApiQuery)({ name: 'search', required: false, type: String }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [research_query_dto_1.ResearchQueryDto]),
    __metadata("design:returntype", Promise)
], ResearchController.prototype, "getResearchHistory", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get research session by ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Research session details' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ResearchController.prototype, "getResearch", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Delete research session and associated data' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Research session deleted' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ResearchController.prototype, "deleteResearch", null);
__decorate([
    (0, common_1.Get)(':id/plan'),
    (0, swagger_1.ApiOperation)({ summary: 'Get the research plan generated by the Planner Agent' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ResearchController.prototype, "getResearchPlan", null);
__decorate([
    (0, common_1.Get)(':id/sources'),
    (0, swagger_1.ApiOperation)({ summary: 'Get sources collected for a research session' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, source_query_dto_1.SourceQueryDto]),
    __metadata("design:returntype", Promise)
], ResearchController.prototype, "getResearchSources", null);
__decorate([
    (0, common_1.Get)(':id/stream'),
    (0, swagger_1.ApiOperation)({ summary: 'SSE stream of research progress events' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ResearchController.prototype, "streamResearch", null);
exports.ResearchController = ResearchController = ResearchController_1 = __decorate([
    (0, swagger_1.ApiTags)('research'),
    (0, common_1.Controller)('research'),
    __metadata("design:paramtypes", [research_service_1.ResearchService,
        research_events_service_1.ResearchEventsService])
], ResearchController);
//# sourceMappingURL=research.controller.js.map