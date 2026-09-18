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
var HealthService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.HealthService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const research_session_schema_1 = require("../research/schemas/research-session.schema");
const serpapi_service_1 = require("../serpapi/serpapi.service");
const pinecone_service_1 = require("../rag/pinecone.service");
const research_queue_1 = require("../queue/research.queue");
let HealthService = HealthService_1 = class HealthService {
    constructor(configService, sessionModel, serpApiService, pineconeService, queueService) {
        this.configService = configService;
        this.sessionModel = sessionModel;
        this.serpApiService = serpApiService;
        this.pineconeService = pineconeService;
        this.queueService = queueService;
        this.logger = new common_1.Logger(HealthService_1.name);
    }
    async checkHealth() {
        const services = {};
        try {
            await this.sessionModel.db.db?.admin().ping();
            services.mongodb = 'up';
        }
        catch {
            services.mongodb = 'down';
        }
        services.redis = this.queueService.isReady() ? 'up' : 'down';
        services.pinecone = this.pineconeService.isConfigured() ? 'configured' : 'not_configured';
        services.serpapi = this.serpApiService.isConfigured() ? 'configured' : 'not_configured';
        const allUp = services.mongodb === 'up' && services.redis === 'up';
        return {
            status: allUp ? 'ok' : 'degraded',
            services,
            timestamp: new Date().toISOString(),
        };
    }
};
exports.HealthService = HealthService;
exports.HealthService = HealthService = HealthService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(1, (0, mongoose_1.InjectModel)(research_session_schema_1.ResearchSession.name)),
    __metadata("design:paramtypes", [config_1.ConfigService,
        mongoose_2.Model,
        serpapi_service_1.SerpApiService,
        pinecone_service_1.PineconeService,
        research_queue_1.ResearchQueueService])
], HealthService);
//# sourceMappingURL=health.service.js.map