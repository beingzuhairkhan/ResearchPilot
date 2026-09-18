import { Module , forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ResearchSessionSchema } from '../research/schemas/research-session.schema';
import { ResearchTaskSchema } from '../research/schemas/research-task.schema';
import { SourceSchema } from '../sources/schemas/source.schema';
import { ReportSchema } from '../reports/schemas/report.schema';
import { SerpApiModule } from '../serpapi/serpapi.module';
import { LlmModule } from '../llm/llm.module';
import { SourcesModule } from '../sources/sources.module';
import { RagModule } from '../rag/rag.module';
import { EventsModule } from '../events/events.module';
import { ResearchModule } from '../research/research.module';
import { PlannerAgent } from './planner/planner.agent';
import { PlannerService } from './planner/planner.service';
import { ResearcherAgent } from './researcher/researcher.agent';
import { ResearcherService } from './researcher/researcher.service';
import { AnalyzerAgent } from './analyzer/analyzer.agent';
import { AnalyzerService } from './analyzer/analyzer.service';
import { ComparisonAgent } from './comparison/comparison.agent';
import { ComparisonService } from './comparison/comparison.service';
import { ReporterAgent } from './reporter/reporter.agent';
import { ReporterService } from './reporter/reporter.service';
import { ResearchOrchestratorService } from './orchestrator/research-orchestrator.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'ResearchSession', schema: ResearchSessionSchema },
      { name: 'ResearchTask', schema: ResearchTaskSchema },
      { name: 'Source', schema: SourceSchema },
      { name: 'Report', schema: ReportSchema },
    ]),
    SerpApiModule,
    LlmModule,
    SourcesModule,
    RagModule,
    EventsModule,
    forwardRef(() => ResearchModule),
  ],
  providers: [
    PlannerAgent,
    PlannerService,
    ResearcherAgent,
    ResearcherService,
    AnalyzerAgent,
    AnalyzerService,
    ComparisonAgent,
    ComparisonService,
    ReporterAgent,
    ReporterService,
    ResearchOrchestratorService,
  ],
  exports: [
    PlannerService,
    ResearcherService,
    AnalyzerService,
    ComparisonService,
    ReporterService,
    ResearchOrchestratorService,
  ],
})
export class AgentsModule {}
