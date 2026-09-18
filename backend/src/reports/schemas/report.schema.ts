import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

@Schema({ timestamps: true, collection: 'reports' })
export class Report {
  @Prop({ required: true, index: true })
  researchId!: string;

  @Prop({ required: true })
  title!: string;

  @Prop({ required: true })
  executiveSummary!: string;

  @Prop({ type: [String], default: [] })
  keyFindings!: string[];

  @Prop({ type: [Object], default: [] })
  recentDevelopments!: Array<{
    text: string;
    citations: string[];
  }>;

  @Prop({ type: [Object], default: [] })
  conflictingEvidence!: Array<{
    topic: string;
    claimA: string;
    sourceA: string;
    claimB: string;
    sourceB: string;
    possibleReason: string;
  }>;

  @Prop({ type: String, default: '' })
  methodology!: string;

  @Prop({ type: String, default: '' })
  limitations!: string;

  @Prop({ type: [Object], default: [] })
  sources!: Array<{
    citationNumber: number;
    title: string;
    url: string;
    domain: string;
    publishedAt: string | null;
  }>;

  @Prop({ type: Object, default: null })
  metrics!: Record<string, unknown> | null;

  @Prop({ type: [Object], default: [] })
  claims!: Array<{
    claim: string;
    importance: string;
    supportingSources: string[];
    evidence: Array<{ sourceId: string; quote: string; reason: string }>;
  }>;
}

export type ReportDocument = HydratedDocument<Report>;
export const ReportSchema = SchemaFactory.createForClass(Report);

ReportSchema.index({ researchId: 1 });
