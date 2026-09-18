import { Injectable, Logger } from '@nestjs/common';
import { Model } from 'mongoose';
import { SourceDocument } from './schemas/source.schema';
import {
  getCanonicalUrl,
  generateUrlHash,
  isSimilarTitle,
} from '../common/utils/url.utils';

@Injectable()
export class SourceDeduplicationService {
  private readonly logger = new Logger(SourceDeduplicationService.name);

  async deduplicate(
    researchId: string,
    sourceModel: Model<SourceDocument>,
  ): Promise<SourceDocument[]> {
    const allSources = await sourceModel.find({ researchId }).exec();
    const toDelete: string[] = [];
    const seen = new Map<string, string>();

    for (const source of allSources) {
      const key = source.canonicalUrl || getCanonicalUrl(source.url);
      if (seen.has(key)) {
        const existingId = seen.get(key)!;
        const existing = allSources.find((s) => s._id.toString() === existingId);
        if (existing && isSimilarTitle(source.title, existing.title)) {
          toDelete.push(source._id.toString());
          this.logger.debug(`[Dedup] Removing duplicate: ${source.url}`);
        }
      } else {
        seen.set(key, source._id.toString());
      }
    }

    if (toDelete.length > 0) {
      await sourceModel.deleteMany({ _id: { $in: toDelete } }).exec();
      this.logger.log(
        `[Dedup] Removed ${toDelete.length} duplicates for researchId=${researchId}`,
      );
    }

    return sourceModel.find({ researchId }).exec();
  }
}
