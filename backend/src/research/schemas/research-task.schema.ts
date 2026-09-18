import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { ResearchTaskStatus } from '../../common/enums/research-task-status.enum';

@Schema({ timestamps: true, collection: 'research_tasks' })
export class ResearchTask {
  @Prop({ required: true, index: true })
  researchId!: string;

  @Prop({ required: true })
  type!: string;

  @Prop({ required: true })
  query!: string;

  @Prop({ required: true })
  purpose!: string;

  @Prop({ type: String, enum: ResearchTaskStatus, default: ResearchTaskStatus.PENDING, index: true })
  status!: ResearchTaskStatus;

  @Prop({ type: Number, default: 0 })
  resultsCount!: number;

  @Prop({ type: String, default: null })
  error!: string | null;
}

export type ResearchTaskDocument = HydratedDocument<ResearchTask>;
export const ResearchTaskSchema = SchemaFactory.createForClass(ResearchTask);

ResearchTaskSchema.index({ researchId: 1, status: 1 });
