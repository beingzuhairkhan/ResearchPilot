import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Queue, QueueEvents } from 'bullmq';
import IORedis from 'ioredis';
import { QUEUE_NAME } from '../common/constants';

export interface ResearchJobData {
  researchId: string;
  stage?: string;
}

@Injectable()
export class ResearchQueueService implements OnModuleInit {
  private readonly logger = new Logger(ResearchQueueService.name);
  private queue: Queue<ResearchJobData, unknown, string> | null = null;
  private connection: IORedis | null = null;
  private readonly redisUrl: string;
  private readonly isMockMode: boolean;

  constructor(private readonly configService: ConfigService) {
    this.redisUrl = this.configService.get<string>('redis.url', 'redis://localhost:6379');
    this.isMockMode = this.configService.get<boolean>('mockExternalServices', false);
  }

  async onModuleInit(): Promise<void> {
    if (this.isMockMode) {
      this.logger.warn('[Queue] MOCK mode — BullMQ queue will not connect to Redis');
      return;
    }
    try {
      this.connection = new IORedis(this.redisUrl, {
        maxRetriesPerRequest: null,
        enableReadyCheck: false,
      });
      this.queue = new Queue<ResearchJobData>(QUEUE_NAME, { connection: this.connection });
      await this.queue.waitUntilReady();
      this.logger.log(`[Queue] Connected to Redis and queue "${QUEUE_NAME}" ready`);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`[Queue] Failed to connect: ${message}`);
    }
  }

  async addResearchJob(researchId: string): Promise<string | null> {
    if (this.isMockMode || !this.queue) {
      this.logger.warn(`[Queue] MOCK mode — job not added for researchId=${researchId}`);
      return null;
    }
    const job = await this.queue.add(
      'research',
      { researchId, stage: 'plan' },
      {
        attempts: 3,
        backoff: { type: 'exponential', delay: 5000 },
      },
    );
    this.logger.log(`[Queue] Added job ${job.id} for researchId=${researchId}`);
    return job.id ?? null;
  }

  getQueue(): Queue<ResearchJobData, unknown, string> | null {
    return this.queue;
  }

  getConnection(): IORedis | null {
    return this.connection;
  }

  isReady(): boolean {
    return this.isMockMode || this.queue !== null;
  }
}
