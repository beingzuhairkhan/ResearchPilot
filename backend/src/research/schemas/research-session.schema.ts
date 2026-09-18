import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { ResearchStatus } from '../../common/enums/research-status.enum';
import { ResearchMode } from '../../common/enums/research-mode.enum';
import { ResearchPlan } from '../../common/interfaces/research.interface';

@Schema({ timestamps: true, collection: 'research_sessions' })
export class ResearchSession {
  @Prop({ required: true })
  question!: string;

  @Prop({ required: true })
  normalizedQuestion!: string;

  @Prop({ type: String, enum: ResearchStatus, default: ResearchStatus.QUEUED, index: true })
  status!: ResearchStatus;

  @Prop({ type: String, enum: ResearchMode, default: ResearchMode.DEEP })
  mode!: ResearchMode;

  @Prop({ type: Number, default: 0 })
  progress!: number;

  @Prop({ type: String, default: '' })
  currentStep!: string;

  @Prop({ type: Number, default: 0 })
  totalTasks!: number;

  @Prop({ type: Number, default: 0 })
  completedTasks!: number;

  @Prop({ type: Number, default: 0 })
  sourcesFound!: number;

  @Prop({ type: Number, default: 0 })
  sourcesAnalyzed!: number;

  @Prop({ type: Number, default: 0 })
  relevantSources!: number;

  @Prop({ type: Number, default: 0 })
  conflictingClaims!: number;

  @Prop({ type: Date, default: null })
  startedAt!: Date | null;

  @Prop({ type: Date, default: null })
  completedAt!: Date | null;

  @Prop({ type: String, default: null })
  error!: string | null;

  @Prop({ type: String, default: null })
  reportId!: string | null;

  @Prop({ type: Object, default: null })
  plan!: ResearchPlan | null;

  @Prop({ type: Object, default: null })
  metrics!: Record<string, unknown> | null;

  @Prop({ type: Number, default: 30 })
  maxSources!: number;

  @Prop({ type: Boolean, default: true })
  includeNews!: boolean;

  @Prop({ type: Boolean, default: false })
  includeScholar!: boolean;
}

export type ResearchSessionDocument = HydratedDocument<ResearchSession>;
export const ResearchSessionSchema = SchemaFactory.createForClass(ResearchSession);

ResearchSessionSchema.index({ createdAt: -1 });
