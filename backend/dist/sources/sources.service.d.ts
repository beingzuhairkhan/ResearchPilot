import { Model } from 'mongoose';
import { SourceDocument } from './schemas/source.schema';
import { NormalizedSearchResult } from '../common/interfaces/research.interface';
import { SourceType, ContentStatus } from '../common/enums/source-type.enum';
import { SourceDeduplicationService } from './source-deduplication.service';
import { SourceNormalizerService } from './source-normalizer.service';
export interface CreateSourceInput {
    researchId: string;
    result: NormalizedSearchResult;
    sourceType: SourceType;
}
export declare class SourcesService {
    private sourceModel;
    private readonly deduplicationService;
    private readonly normalizerService;
    private readonly logger;
    constructor(sourceModel: Model<SourceDocument>, deduplicationService: SourceDeduplicationService, normalizerService: SourceNormalizerService);
    collectSources(researchId: string, results: NormalizedSearchResult[], maxSources: number, sourceTypeOverride?: SourceType, onProgress?: (count: number) => void): Promise<SourceDocument[]>;
    getSourcesByResearchId(researchId: string): Promise<SourceDocument[]>;
    private toDate;
    updateSourceContent(sourceId: string, content: string, contentStatus: ContentStatus, canonicalUrl?: string, author?: string, publishedAt?: unknown): Promise<void>;
    updateRelevanceScore(sourceId: string, score: number): Promise<void>;
    deleteByResearchId(researchId: string): Promise<void>;
    countByResearchId(researchId: string): Promise<number>;
    countUniqueDomains(researchId: string): Promise<number>;
    countRecentSources(researchId: string, monthsThreshold?: number): Promise<number>;
    countAnalyzedSources(researchId: string): Promise<number>;
    private inferSourceType;
    deduplicateSources(researchId: string): Promise<SourceDocument[]>;
}
