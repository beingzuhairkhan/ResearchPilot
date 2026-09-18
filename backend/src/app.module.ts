import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER } from '@nestjs/core';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import configuration from './config/configuration';
import { DatabaseModule } from './database/database.module';
import { ResearchModule } from './research/research.module';
import { SerpApiModule } from './serpapi/serpapi.module';
import { AgentsModule } from './agents/agents.module';
import { SourcesModule } from './sources/sources.module';
import { RagModule } from './rag/rag.module';
import { LlmModule } from './llm/llm.module';
import { QueueModule } from './queue/queue.module';
import { ReportsModule } from './reports/reports.module';
import { EventsModule } from './events/events.module';
import { HealthModule } from './health/health.module';
import { AllExceptionsFilter } from './common/exceptions/all-exceptions.filter';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),
    ThrottlerModule.forRoot([
      { ttl: 60000, limit: 30 },
    ]),
    DatabaseModule,
    ResearchModule,
    SerpApiModule,
    AgentsModule,
    SourcesModule,
    RagModule,
    LlmModule,
    QueueModule,
    ReportsModule,
    EventsModule,
    HealthModule,
  ],
  providers: [
    {
      provide: APP_FILTER,
      useClass: AllExceptionsFilter,
    },
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
