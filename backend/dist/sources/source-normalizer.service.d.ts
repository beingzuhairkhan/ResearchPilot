import { NormalizedSearchResult } from '../common/interfaces/research.interface';
export declare class SourceNormalizerService {
    normalizeResult(result: NormalizedSearchResult): NormalizedSearchResult;
    normalizeUrl(rawUrl: string): string;
}
