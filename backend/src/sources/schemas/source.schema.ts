import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { SourceType, ContentStatus } from '../../common/enums/source-type.enum';

@Schema({ timestamps: true, collection: 'sources' })
export class Source {
  @Prop({ required: true, index: true })
  researchId!: string;

  @Prop({ required: true })
  title!: string;

  @Prop({ required: true })
  url!: string;

  @Prop({ required: true, index: true })
  canonicalUrl!: string;

  @Prop({ required: true, index: true })
  domain!: string;

  @Prop({ type: String, default: '' })
  snippet!: string;

  @Prop({ type: String, default: '' })
  content!: string;

  @Prop({ type: String, enum: SourceType, default: SourceType.WEB })
  sourceType!: SourceType;

  @Prop({ type: String, default: null })
  author!: string | null;

  @Prop({ type: Date, default: null, index: true })
  publishedAt!: Date | null;

  @Prop({ type: Date, default: Date.now })
  discoveredAt!: Date;

  @Prop({ type: String, default: '' })
  searchQuery!: string;

  @Prop({ type: Number, default: 0 })
  relevanceScore!: number;

  @Prop({ type: String, enum: ContentStatus, default: ContentStatus.PENDING })
  contentStatus!: ContentStatus;

  @Prop({ required: true, index: true })
  hash!: string;
}

export type SourceDocument = HydratedDocument<Source>;
export const SourceSchema = SchemaFactory.createForClass(Source);

SourceSchema.index({ researchId: 1, canonicalUrl: 1 });
SourceSchema.index({ researchId: 1, hash: 1 });
