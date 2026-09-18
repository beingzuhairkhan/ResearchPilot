import { ConfigService } from '@nestjs/config';
import { Model } from 'mongoose';
import { ResearchSession } from '../research/schemas/research-session.schema';
import { SerpApiService } from '../serpapi/serpapi.service';
import { PineconeService } from '../rag/pinecone.service';
import { ResearchQueueService } from '../queue/research.queue';
export declare class HealthService {
    private readonly configService;
    private sessionModel;
    private readonly serpApiService;
    private readonly pineconeService;
    private readonly queueService;
    private readonly logger;
    constructor(configService: ConfigService, sessionModel: Model<ResearchSession>, serpApiService: SerpApiService, pineconeService: PineconeService, queueService: ResearchQueueService);
    checkHealth(): Promise<{
        status: string;
        services: Record<string, string>;
        timestamp: string;
    }>;
}
