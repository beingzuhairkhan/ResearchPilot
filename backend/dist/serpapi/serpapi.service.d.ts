import { ConfigService } from '@nestjs/config';
import { SearchType } from '../common/enums/source-type.enum';
import { NormalizedSearchResult } from '../common/interfaces/research.interface';
import { SerpApiSearchOptions } from './interfaces/serpapi-result.interface';
export declare class SerpApiService {
    private readonly configService;
    private readonly logger;
    private readonly apiKey;
    private readonly httpClient;
    private readonly isMockMode;
    constructor(configService: ConfigService);
    searchWeb(query: string, options?: SerpApiSearchOptions): Promise<NormalizedSearchResult[]>;
    searchNews(query: string, options?: SerpApiSearchOptions): Promise<NormalizedSearchResult[]>;
    searchScholar(query: string, options?: SerpApiSearchOptions): Promise<NormalizedSearchResult[]>;
    search(query: string, searchType: SearchType, options?: SerpApiSearchOptions): Promise<NormalizedSearchResult[]>;
    private buildParams;
    private executeSearch;
    private normalizeWebResult;
    private normalizeNewsResult;
    private normalizeScholarResult;
    isConfigured(): boolean;
    private mockSearch;
}
