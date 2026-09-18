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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var ResearchQueueService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResearchQueueService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const bullmq_1 = require("bullmq");
const ioredis_1 = __importDefault(require("ioredis"));
const constants_1 = require("../common/constants");
let ResearchQueueService = ResearchQueueService_1 = class ResearchQueueService {
    constructor(configService) {
        this.configService = configService;
        this.logger = new common_1.Logger(ResearchQueueService_1.name);
        this.queue = null;
        this.connection = null;
        this.redisUrl = this.configService.get('redis.url', 'redis://localhost:6379');
        this.isMockMode = this.configService.get('mockExternalServices', false);
    }
    async onModuleInit() {
        if (this.isMockMode) {
            this.logger.warn('[Queue] MOCK mode — BullMQ queue will not connect to Redis');
            return;
        }
        try {
            this.connection = new ioredis_1.default(this.redisUrl, {
                maxRetriesPerRequest: null,
                enableReadyCheck: false,
            });
            this.queue = new bullmq_1.Queue(constants_1.QUEUE_NAME, { connection: this.connection });
            await this.queue.waitUntilReady();
            this.logger.log(`[Queue] Connected to Redis and queue "${constants_1.QUEUE_NAME}" ready`);
        }
        catch (error) {
            const message = error instanceof Error ? error.message : 'Unknown error';
            this.logger.error(`[Queue] Failed to connect: ${message}`);
        }
    }
    async addResearchJob(researchId) {
        if (this.isMockMode || !this.queue) {
            this.logger.warn(`[Queue] MOCK mode — job not added for researchId=${researchId}`);
            return null;
        }
        const job = await this.queue.add('research', { researchId, stage: 'plan' }, {
            attempts: 3,
            backoff: { type: 'exponential', delay: 5000 },
        });
        this.logger.log(`[Queue] Added job ${job.id} for researchId=${researchId}`);
        return job.id ?? null;
    }
    getQueue() {
        return this.queue;
    }
    getConnection() {
        return this.connection;
    }
    isReady() {
        return this.isMockMode || this.queue !== null;
    }
};
exports.ResearchQueueService = ResearchQueueService;
exports.ResearchQueueService = ResearchQueueService = ResearchQueueService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], ResearchQueueService);
//# sourceMappingURL=research.queue.js.map