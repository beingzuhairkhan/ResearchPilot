import { ConfigService } from '@nestjs/config';
import { SerpApiService } from './serpapi.service';
import { SearchType } from '../common/enums/source-type.enum';
import { NormalizedSearchResult } from '../common/interfaces/research.interface';

function createMockConfig(mockMode: boolean, apiKey = 'test-key'): ConfigService {
  return {
    get: (key: string, defaultVal: unknown) => {
      if (key === 'serpapi.apiKey') return apiKey;
      if (key === 'mockExternalServices') return mockMode;
      return defaultVal;
    },
  } as unknown as ConfigService;
}

describe('SerpApiService - Normalization', () => {
  it('should normalize web results correctly', async () => {
    const service = new SerpApiService(createMockConfig(true));
    const results = await service.searchWeb('AI adoption India');
    expect(results.length).toBeGreaterThan(0);
    for (const r of results) {
      expect(r.searchType).toBe(SearchType.WEB);
      expect(r.query).toBe('AI adoption India');
      expect(r.title).toBeTruthy();
      expect(r.url).toBeTruthy();
      expect(r.position).toBeGreaterThan(0);
    }
  });

  it('should normalize news results correctly', async () => {
    const service = new SerpApiService(createMockConfig(true));
    const results = await service.searchNews('Indian IT news');
    expect(results.length).toBeGreaterThan(0);
    for (const r of results) {
      expect(r.searchType).toBe(SearchType.NEWS);
      expect(r.query).toBe('Indian IT news');
    }
  });

  it('should normalize scholar results correctly', async () => {
    const service = new SerpApiService(createMockConfig(true));
    const results = await service.searchScholar('AI research paper');
    expect(results.length).toBeGreaterThan(0);
    for (const r of results) {
      expect(r.searchType).toBe(SearchType.SCHOLAR);
      expect(r.query).toBe('AI research paper');
    }
  });

  it('should route to correct search type via search()', async () => {
    const service = new SerpApiService(createMockConfig(true));
    const webResults = await service.search('test', SearchType.WEB);
    expect(webResults[0].searchType).toBe(SearchType.WEB);
    const newsResults = await service.search('test', SearchType.NEWS);
    expect(newsResults[0].searchType).toBe(SearchType.NEWS);
    const scholarResults = await service.search('test', SearchType.SCHOLAR);
    expect(scholarResults[0].searchType).toBe(SearchType.SCHOLAR);
  });

  it('should report configured status correctly', () => {
    const mockService = new SerpApiService(createMockConfig(true));
    expect(mockService.isConfigured()).toBe(true);
    const realService = new SerpApiService(createMockConfig(false, 'real-key'));
    expect(realService.isConfigured()).toBe(true);
    const unconfigured = new SerpApiService(createMockConfig(false, ''));
    expect(unconfigured.isConfigured()).toBe(false);
  });
});
