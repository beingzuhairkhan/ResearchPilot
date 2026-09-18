import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SourceSchema } from './schemas/source.schema';
import { SourcesService } from './sources.service';
import { SourceDeduplicationService } from './source-deduplication.service';
import { SourceNormalizerService } from './source-normalizer.service';
import { SourceExtractorService } from './source-extractor.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'Source', schema: SourceSchema }]),
  ],
  providers: [
    SourcesService,
    SourceDeduplicationService,
    SourceNormalizerService,
    SourceExtractorService,
  ],
  exports: [
    SourcesService,
    SourceDeduplicationService,
    SourceNormalizerService,
    SourceExtractorService,
    MongooseModule.forFeature([{ name: 'Source', schema: SourceSchema }]),
  ],
})
export class SourcesModule {}
