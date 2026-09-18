import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ResearchSession } from '../research/schemas/research-session.schema';
import { SerpApiService } from '../serpapi/serpapi.service';
import { PineconeService } from '../rag/pinecone.service';
import { ResearchQueueService } from '../queue/research.queue';

@Injectable()
export class HealthService {
  private readonly logger = new Logger(HealthService.name);

  constructor(
    private readonly configService: ConfigService,
    @InjectModel(ResearchSession.name) private sessionModel: Model<ResearchSession>,
    private readonly serpApiService: SerpApiService,
    private readonly pineconeService: PineconeService,
    private readonly queueService: ResearchQueueService,
  ) {}

  async checkHealth(): Promise<{
    status: string;
    services: Record<string, string>;
    timestamp: string;
  }> {
    const services: Record<string, string> = {};

    // MongoDB
    try {
      await this.sessionModel.db.db?.admin().ping();
      services.mongodb = 'up';
    } catch {
      services.mongodb = 'down';
    }

    // Redis
    services.redis = this.queueService.isReady() ? 'up' : 'down';

    // Pinecone
    services.pinecone = this.pineconeService.isConfigured() ? 'configured' : 'not_configured';

    // SerpApi
    services.serpapi = this.serpApiService.isConfigured() ? 'configured' : 'not_configured';

    const allUp = services.mongodb === 'up' && services.redis === 'up';

    return {
      status: allUp ? 'ok' : 'degraded',
      services,
      timestamp: new Date().toISOString(),
    };
  }
}
