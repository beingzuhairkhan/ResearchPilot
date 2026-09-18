import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { SERPAPI_BASE_URL } from '../common/constants';
import { SearchType } from '../common/enums/source-type.enum';
import { NormalizedSearchResult } from '../common/interfaces/research.interface';
import {
  SerpApiResponse,
  SerpApiResult,
  SerpApiNewsResult,
  SerpApiScholarResult,
  SerpApiSearchOptions,
} from './interfaces/serpapi-result.interface';
import { getDomain } from '../common/utils/url.utils';
import { SerpApiException } from '../common/exceptions/custom.exceptions';

@Injectable()
export class SerpApiService {
  private readonly logger = new Logger(SerpApiService.name);
  private readonly apiKey: string;
  private readonly httpClient: AxiosInstance;
  private readonly isMockMode: boolean;

  constructor(private readonly configService: ConfigService) {
    this.apiKey = this.configService.get<string>('serpapi.apiKey', '');
    this.isMockMode = this.configService.get<boolean>('mockExternalServices', false);
    this.httpClient = axios.create({
      baseURL: SERPAPI_BASE_URL,
      timeout: 30000,
    });
  }

  async searchWeb(query: string, options?: SerpApiSearchOptions): Promise<NormalizedSearchResult[]> {
    if (this.isMockMode) {
      return this.mockSearch(query, SearchType.WEB, options?.num || 10);
    }
    const params = this.buildParams(query, 'google', options);
    const response = await this.executeSearch(params);
    const results = response.organic_results || [];
    return results.map((r, i) => this.normalizeWebResult(r, query, i + 1));
  }

  async searchNews(query: string, options?: SerpApiSearchOptions): Promise<NormalizedSearchResult[]> {
    if (this.isMockMode) {
      return this.mockSearch(query, SearchType.NEWS, options?.num || 10);
    }
    const params = this.buildParams(query, 'google_news', options);
    const response = await this.executeSearch(params);
    const results = response.news_results || [];
    return results.map((r, i) => this.normalizeNewsResult(r, query, i + 1));
  }

  async searchScholar(query: string, options?: SerpApiSearchOptions): Promise<NormalizedSearchResult[]> {
    if (this.isMockMode) {
      return this.mockSearch(query, SearchType.SCHOLAR, options?.num || 10);
    }
    const params = this.buildParams(query, 'google_scholar', options);
    const response = await this.executeSearch(params);
    const results = response.organic_results_scholar || response.organic_results || [];
    return results.map((r, i) => this.normalizeScholarResult(r, query, i + 1));
  }

  async search(
    query: string,
    searchType: SearchType,
    options?: SerpApiSearchOptions,
  ): Promise<NormalizedSearchResult[]> {
    switch (searchType) {
      case SearchType.WEB:
        return this.searchWeb(query, options);
      case SearchType.NEWS:
        return this.searchNews(query, options);
      case SearchType.SCHOLAR:
        return this.searchScholar(query, options);
      default:
        return this.searchWeb(query, options);
    }
  }

  private buildParams(query: string, engine: string, options?: SerpApiSearchOptions) {
    return {
      engine,
      q: query,
      api_key: this.apiKey,
      num: options?.num || 10,
      start: options?.start || 0,
      gl: options?.gl || 'in',
      hl: options?.hl || 'en',
    };
  }

  private async executeSearch(params: Record<string, unknown>): Promise<SerpApiResponse> {
    try {
      const response: AxiosResponse<SerpApiResponse> = await this.httpClient.get('', { params });
      if (response.data.error) {
        this.logger.error(`[SerpApi] API error: ${response.data.error}`);
        throw new SerpApiException(response.data.error);
      }
      this.logger.log(
        `[SerpApi] Search completed engine=${params.engine} query="${params.q}" results=${
          response.data.organic_results?.length ||
          response.data.news_results?.length ||
          0
        }`,
      );
      return response.data;
    } catch (error) {
      if (error instanceof SerpApiException) throw error;
      const message = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`[SerpApi] Request failed: ${message}`);
      throw new SerpApiException(message);
    }
  }

  private normalizeWebResult(
    result: SerpApiResult,
    query: string,
    position: number,
  ): NormalizedSearchResult {
    return {
      title: result.title || '',
      url: result.link || '',
      snippet: result.snippet || '',
      source: result.source || getDomain(result.link || ''),
      publishedAt: result.date || null,
      searchType: SearchType.WEB,
      query,
      position,
    };
  }

  private normalizeNewsResult(
    result: SerpApiNewsResult,
    query: string,
    position: number,
  ): NormalizedSearchResult {
    return {
      title: result.title || '',
      url: result.link || '',
      snippet: result.snippet || '',
      source: result.source || getDomain(result.link || ''),
      publishedAt: result.date || null,
      searchType: SearchType.NEWS,
      query,
      position,
    };
  }

  private normalizeScholarResult(
    result: SerpApiScholarResult,
    query: string,
    position: number,
  ): NormalizedSearchResult {
    return {
      title: result.title || '',
      url: result.link || '',
      snippet: result.snippet || '',
      source: result.publication_info?.summary || '',
      publishedAt: result.year ? `${result.year}-01-01` : null,
      searchType: SearchType.SCHOLAR,
      query,
      position,
    };
  }

  isConfigured(): boolean {
    return this.isMockMode || this.apiKey.length > 0;
  }

  private mockSearch(
    query: string,
    searchType: SearchType,
    num: number,
  ): NormalizedSearchResult[] {
    this.logger.warn(`[SerpApi] MOCK mode — returning mock results for query="${query}"`);
    const results: NormalizedSearchResult[] = [];
    for (let i = 0; i < Math.min(num, 5); i++) {
      results.push({
        title: `[Mock] Research result ${i + 1} for "${query}"`,
        url: `https://example.com/mock-${searchType}-${i + 1}`,
        snippet: `This is a mock search result for development purposes. Query: ${query}`,
        source: 'example.com',
        publishedAt: new Date().toISOString(),
        searchType,
        query,
        position: i + 1,
      });
    }
    return results;
  }
}
