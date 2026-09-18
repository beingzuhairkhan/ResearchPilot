"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const common_1 = require("@nestjs/common");
const bullmq_1 = require("bullmq");
const ioredis_1 = __importDefault(require("ioredis"));
const app_module_1 = require("../app.module");
const research_processor_1 = require("./research.processor");
const constants_1 = require("../common/constants");
async function bootstrapWorker() {
    const logger = new common_1.Logger('Worker');
    const app = await core_1.NestFactory.createApplicationContext(app_module_1.AppModule);
    const processor = app.get(research_processor_1.ResearchProcessorService);
    const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
    const connection = new ioredis_1.default(redisUrl, {
        maxRetriesPerRequest: null,
        enableReadyCheck: false,
    });
    const worker = new bullmq_1.Worker(constants_1.QUEUE_NAME, async (job) => {
        const { researchId } = job.data;
        logger.log(`[Worker] Processing job ${job.id} for researchId=${researchId}`);
        await processor.process(researchId);
    }, {
        connection,
        concurrency: 2,
    });
    worker.on('completed', (job) => {
        logger.log(`[Worker] Job ${job.id} completed`);
    });
    worker.on('failed', (job, err) => {
        logger.error(`[Worker] Job ${job?.id} failed: ${err.message}`);
    });
    logger.log('ResearchPilot worker started and listening for jobs');
    process.on('SIGTERM', async () => {
        logger.log('SIGTERM received, closing worker...');
        await worker.close();
        await connection.quit();
        await app.close();
        process.exit(0);
    });
}
bootstrapWorker().catch((err) => {
    console.error('Worker failed to start', err);
    process.exit(1);
});
//# sourceMappingURL=worker.js.map