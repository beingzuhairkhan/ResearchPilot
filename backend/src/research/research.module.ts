import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ResearchController } from './research.controller';
import { ResearchService } from './research.service';
import { ResearchRepository } from './research.repository';
import { ResearchSessionSchema } from './schemas/research-session.schema';
import { ResearchTaskSchema } from './schemas/research-task.schema';
import { SourceSchema } from '../sources/schemas/source.schema';
import { ReportSchema } from '../reports/schemas/report.schema';
import { EventsModule } from '../events/events.module';
import { ResearchQueueModule } from '../queue/research-queue.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'ResearchSession', schema: ResearchSessionSchema },
      { name: 'ResearchTask', schema: ResearchTaskSchema },
      { name: 'Source', schema: SourceSchema },
      { name: 'Report', schema: ReportSchema },
    ]),
    EventsModule,
    ResearchQueueModule,
  ],
  controllers: [ResearchController],
  providers: [ResearchService, ResearchRepository],
  exports: [ResearchService, ResearchRepository],
})
export class ResearchModule {}