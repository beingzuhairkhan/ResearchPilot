import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ResearchSessionSchema } from '../research/schemas/research-session.schema';
import { HealthController } from './health.controller';
import { HealthService } from './health.service';
import { SerpApiModule } from '../serpapi/serpapi.module';
import { RagModule } from '../rag/rag.module';
import { QueueModule } from '../queue/queue.module';
import { ResearchQueueModule } from '../queue/research-queue.module'; 
@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'ResearchSession', schema: ResearchSessionSchema }]),
    SerpApiModule,
    RagModule,
    QueueModule,
    ResearchQueueModule
  ],
  controllers: [HealthController],
  providers: [HealthService],
  exports: [HealthService],
})
export class HealthModule {}
