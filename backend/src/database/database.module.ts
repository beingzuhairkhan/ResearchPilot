import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ResearchSessionSchema } from '../research/schemas/research-session.schema';
import { ResearchTaskSchema } from '../research/schemas/research-task.schema';
import { SourceSchema } from '../sources/schemas/source.schema';
import { ReportSchema } from '../reports/schemas/report.schema';

@Module({
  imports: [
    MongooseModule.forRootAsync({
      useFactory: () => ({
        uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/researchpilot',
      }),
    }),
    MongooseModule.forFeature([
      { name: 'ResearchSession', schema: ResearchSessionSchema },
      { name: 'ResearchTask', schema: ResearchTaskSchema },
      { name: 'Source', schema: SourceSchema },
      { name: 'Report', schema: ReportSchema },
    ]),
  ],
  exports: [MongooseModule],
})
export class DatabaseModule {}
