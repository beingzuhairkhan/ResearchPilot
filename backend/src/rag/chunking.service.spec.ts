import { ChunkingService } from './chunking.service';
import { ConfigService } from '@nestjs/config';

describe('ChunkingService', () => {
  let service: ChunkingService;

  beforeEach(() => {
    const mockConfig = {
      get: (key: string, defaultVal: number) => {
        if (key === 'rag.chunkSize') return 100;
        if (key === 'rag.chunkOverlap') return 20;
        return defaultVal;
      },
    } as unknown as ConfigService;
    service = new ChunkingService(mockConfig);
  });

  it('should split content into chunks', () => {
    const content = 'A'.repeat(250);
    const chunks = service.chunkContent('src1', content, {
      title: 'Test',
      url: 'https://example.com',
      domain: 'example.com',
      publishedAt: null,
    });
    expect(chunks.length).toBeGreaterThan(1);
    expect(chunks[0].sourceId).toBe('src1');
    expect(chunks[0].chunkIndex).toBe(0);
  });

  it('should return empty array for empty content', () => {
    const chunks = service.chunkContent('src1', '', {
      title: 'Test',
      url: 'https://example.com',
      domain: 'example.com',
      publishedAt: null,
    });
    expect(chunks).toEqual([]);
  });

  it('should include metadata in each chunk', () => {
    const content = 'A'.repeat(150);
    const chunks = service.chunkContent('src1', content, {
      title: 'Test Article',
      url: 'https://example.com',
      domain: 'example.com',
      publishedAt: '2026-01-01',
    });
    expect(chunks[0].metadata.title).toBe('Test Article');
    expect(chunks[0].metadata.url).toBe('https://example.com');
    expect(chunks[0].metadata.domain).toBe('example.com');
    expect(chunks[0].metadata.publishedAt).toBe('2026-01-01');
  });

  it('should respect chunk size', () => {
    const content = 'A'.repeat(300);
    const chunks = service.chunkContent('src1', content, {
      title: 'Test',
      url: 'https://example.com',
      domain: 'example.com',
      publishedAt: null,
    });
    for (const chunk of chunks) {
      expect(chunk.text.length).toBeLessThanOrEqual(100);
    }
  });

  it('should increment chunk index', () => {
    const content = 'A'.repeat(250);
    const chunks = service.chunkContent('src1', content, {
      title: 'Test',
      url: 'https://example.com',
      domain: 'example.com',
      publishedAt: null,
    });
    for (let i = 0; i < chunks.length; i++) {
      expect(chunks[i].chunkIndex).toBe(i);
    }
  });
});
