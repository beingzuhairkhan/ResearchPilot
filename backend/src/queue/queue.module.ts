import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ResearchProcessorService } from './research.processor';
import { ResearchQueueModule } from './research-queue.module';
import { EventsModule } from '../events/events.module';
import { AgentsModule } from '../agents/agents.module';
import { ResearchModule } from '../research/research.module';
import { SourcesModule } from '../sources/sources.module';
import { RagModule } from '../rag/rag.module';
import { SerpApiModule } from '../serpapi/serpapi.module';
import { LlmModule } from '../llm/llm.module';
import { ReportsModule } from '../reports/reports.module';

@Module({
  imports: [
    ConfigModule,
    ResearchQueueModule,
    EventsModule,
    AgentsModule,
    ResearchModule,
    SourcesModule,
    RagModule,
    SerpApiModule,
    LlmModule,
    ReportsModule,
  ],
  providers: [ResearchProcessorService],
  exports: [ResearchProcessorService],
})
export class QueueModule {}