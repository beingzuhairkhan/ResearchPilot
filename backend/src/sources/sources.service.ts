import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Source, SourceDocument } from './schemas/source.schema';
import { NormalizedSearchResult } from '../common/interfaces/research.interface';
import { SourceType, ContentStatus } from '../common/enums/source-type.enum';
import {
  getCanonicalUrl,
  getDomain,
  generateContentHash,
  generateUrlHash,
  isSimilarTitle,
} from '../common/utils/url.utils';
import { SourceDeduplicationService } from './source-deduplication.service';
import { SourceNormalizerService } from './source-normalizer.service';

export interface CreateSourceInput {
  researchId: string;
  result: NormalizedSearchResult;
  sourceType: SourceType;
}

@Injectable()
export class SourcesService {
  private readonly logger = new Logger(SourcesService.name);

  constructor(
    @InjectModel(Source.name) private sourceModel: Model<SourceDocument>,
    private readonly deduplicationService: SourceDeduplicationService,
    private readonly normalizerService: SourceNormalizerService,
  ) {}

  async collectSources(
    researchId: string,
    results: NormalizedSearchResult[],
    maxSources: number,
  sourceTypeOverride?: SourceType,
  onProgress?: (count: number) => void,
  ): Promise<SourceDocument[]> {
    const collected: SourceDocument[] = [];
    const seenHashes = new Set<string>();

    for (const result of results) {
      if (collected.length >= maxSources) break;

      const normalized = this.normalizerService.normalizeResult(result);
      const sourceType = sourceTypeOverride || this.inferSourceType(result);
      const canonicalUrl = getCanonicalUrl(normalized.url);
      const hash = generateUrlHash(normalized.url);

      if (seenHashes.has(hash)) continue;
      seenHashes.add(hash);

      const existing = await this.sourceModel.findOne({
        researchId,
        $or: [{ canonicalUrl }, { hash }],
      });

      if (existing) {
        this.logger.debug(`[Sources] Skipping duplicate: ${normalized.url}`);
        continue;
      }

      const source = new this.sourceModel({
        researchId,
        title: normalized.title,
        url: normalized.url,
        canonicalUrl,
        domain: getDomain(normalized.url),
        snippet: normalized.snippet,
        content: '',
        sourceType,
        author: null,
        publishedAt: normalized.publishedAt ? new Date(normalized.publishedAt) : null,
        discoveredAt: new Date(),
        searchQuery: normalized.query,
        relevanceScore: 0,
        contentStatus: ContentStatus.PENDING,
        hash: generateContentHash(normalized.title + normalized.url),
      });

      await source.save();
      collected.push(source);

      if (onProgress) onProgress(collected.length);
    }

    this.logger.log(`[Sources] Collected ${collected.length} sources for researchId=${researchId}`);
    return collected;
  }

  async getSourcesByResearchId(researchId: string): Promise<SourceDocument[]> {
    return this.sourceModel.find({ researchId }).sort({ relevanceScore: -1 }).exec();
  }

  async updateSourceContent(
    sourceId: string,
    content: string,
    contentStatus: ContentStatus,
  canonicalUrl?: string,
    author?: string,
    publishedAt?: Date,
  ): Promise<void> {
    const updates: Record<string, unknown> = { content, contentStatus };
    if (canonicalUrl) updates.canonicalUrl = canonicalUrl;
    if (author !== undefined) updates.author = author;
    if (publishedAt) updates.publishedAt = publishedAt;
    if (content) updates.hash = generateContentHash(content);
    await this.sourceModel.findByIdAndUpdate(sourceId, updates).exec();
  }

  async updateRelevanceScore(sourceId: string, score: number): Promise<void> {
    await this.sourceModel.findByIdAndUpdate(sourceId, { relevanceScore: score }).exec();
  }

  async deleteByResearchId(researchId: string): Promise<void> {
    await this.sourceModel.deleteMany({ researchId }).exec();
  }

  async countByResearchId(researchId: string): Promise<number> {
    return this.sourceModel.countDocuments({ researchId }).exec();
  }

  async countUniqueDomains(researchId: string): Promise<number> {
    const result = await this.sourceModel.distinct('domain', { researchId }).exec();
    return result.length;
  }

  async countRecentSources(researchId: string, monthsThreshold = 6): Promise<number> {
    const threshold = new Date();
    threshold.setMonth(threshold.getMonth() - monthsThreshold);
    return this.sourceModel
      .countDocuments({ researchId, publishedAt: { $gte: threshold } })
      .exec();
  }

  async countAnalyzedSources(researchId: string): Promise<number> {
    return this.sourceModel
      .countDocuments({ researchId, contentStatus: ContentStatus.EXTRACTED })
      .exec();
  }

  private inferSourceType(result: NormalizedSearchResult): SourceType {
    switch (result.searchType) {
      case 'web':
        return SourceType.WEB;
      case 'news':
        return SourceType.NEWS;
      case 'scholar':
        return SourceType.SCHOLAR;
      default:
        return SourceType.OTHER;
    }
  }

  async deduplicateSources(researchId: string): Promise<SourceDocument[]> {
    return this.deduplicationService.deduplicate(researchId, this.sourceModel);
  }
}
