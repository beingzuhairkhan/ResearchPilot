import { OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Queue } from 'bullmq';
import IORedis from 'ioredis';
export interface ResearchJobData {
    researchId: string;
    stage?: string;
}
export declare class ResearchQueueService implements OnModuleInit {
    private readonly configService;
    private readonly logger;
    private queue;
    private connection;
    private readonly redisUrl;
    private readonly isMockMode;
    constructor(configService: ConfigService);
    onModuleInit(): Promise<void>;
    addResearchJob(researchId: string): Promise<string | null>;
    getQueue(): Queue<ResearchJobData, unknown, string> | null;
    getConnection(): IORedis | null;
    isReady(): boolean;
}
