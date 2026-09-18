import { NestFactory } from '@nestjs/core';
import { Logger } from '@nestjs/common';
import { Worker, Job } from 'bullmq';
import IORedis from 'ioredis';
import { AppModule } from '../app.module';
import { ResearchProcessorService } from './research.processor';
import { QUEUE_NAME } from '../common/constants';

async function bootstrapWorker() {
  const logger = new Logger('Worker');
  const app = await NestFactory.createApplicationContext(AppModule);
  const processor = app.get(ResearchProcessorService);

  const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
  const connection = new IORedis(redisUrl, {
    maxRetriesPerRequest: null,
    enableReadyCheck: false,
  });

  const worker = new Worker(
    QUEUE_NAME,
    async (job: Job) => {
      const { researchId } = job.data;
      logger.log(`[Worker] Processing job ${job.id} for researchId=${researchId}`);
      await processor.process(researchId);
    },
    {
      connection,
      concurrency: 2,
    },
  );

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
