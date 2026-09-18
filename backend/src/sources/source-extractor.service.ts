// import { Injectable, Logger } from '@nestjs/common';
// import { ConfigService } from '@nestjs/config';
// import axios, { AxiosInstance } from 'axios';
// import { cleanHtml, extractSnippet } from '../common/utils/text.utils';
// import { getCanonicalUrl } from '../common/utils/url.utils';

// export interface ExtractedContent {
//   title: string;
//   content: string;
//   author: string | null;
//   publishedAt: string | null;
//   canonicalUrl: string;
// }

// @Injectable()
// export class SourceExtractorService {
//   private readonly logger = new Logger(SourceExtractorService.name);
//   private readonly httpClient: AxiosInstance;
//   private readonly timeout: number;
//   private readonly isMockMode: boolean;

//   constructor(private readonly configService: ConfigService) {
//     this.timeout = configService.get<number>('sources.fetchTimeout', 10000);
//     this.isMockMode = configService.get<boolean>('mockExternalServices', false);
//     this.httpClient = axios.create({
//       timeout: this.timeout,
//       maxRedirects: 5,
//       headers: {
//         'User-Agent':
//           'Mozilla/5.0 (compatible; ResearchPilot/1.0; +https://github.com/researchpilot)',
//       },
//     });
//   }

//   async extract(url: string): Promise<ExtractedContent | null> {
//     if (this.isMockMode) {
//       return this.mockExtract(url);
//     }

//     try {
//       const response = await this.httpClient.get(url, {
//         responseType: 'text',
//         maxContentLength: 5 * 1024 * 1024,
//       });

//       const html = response.data as string;
//       const content = cleanHtml(html);
//       const title = this.extractTitle(html);
//       const author = this.extractMetaTag(html, 'author');
//       const publishedAt = this.extractMetaTag(html, 'article:published_time') ||
//         this.extractMetaTag(html, 'datePublished');
//       const canonical = this.extractCanonicalUrl(html) || getCanonicalUrl(url);

//       if (!content || content.length < 50) {
//         this.logger.warn(`[Extractor] Empty or too-short content from ${url}`);
//         return null;
//       }

//       return {
//         title: title || extractSnippet(content, 100),
//         content: content.slice(0, 50000),
//         author: author || null,
//         publishedAt: publishedAt || null,
//         canonicalUrl: canonical,
//       };
//     } catch (error) {
//       const message = error instanceof Error ? error.message : 'Unknown error';
//       this.logger.warn(`[Extractor] Failed to extract ${url}: ${message}`);
//       return null;
//     }
//   }

//   private extractTitle(html: string): string {
//     const match = html.match(/<title[^>]*>([^<]+)<\/title>/i);
//     return match ? match[1].trim() : '';
//   }

//   private extractMetaTag(html: string, property: string): string | null {
//     const patterns = [
//       new RegExp(`<meta[^>]*property=["']${property}["'][^>]*content=["']([^"']+)["']`, 'i'),
//       new RegExp(`<meta[^>]*name=["']${property}["'][^>]*content=["']([^"']+)["']`, 'i'),
//       new RegExp(`<meta[^>]*content=["']([^"']+)["'][^>]*property=["']${property}["']`, 'i'),
//       new RegExp(`<meta[^>]*content=["']([^"']+)["'][^>]*name=["']${property}["']`, 'i'),
//     ];
//     for (const pattern of patterns) {
//       const match = html.match(pattern);
//       if (match) return match[1].trim();
//     }
//     return null;
//   }

//   private extractCanonicalUrl(html: string): string | null {
//     const match = html.match(/<link[^>]*rel=["']canonical["'][^>]*href=["']([^"']+)["']/i);
//     return match ? match[1].trim() : null;
//   }

//   private mockExtract(url: string): ExtractedContent {
//     return {
//       title: `[Mock] Page title for ${url}`,
//       content: `This is mock extracted content for development purposes. The page at ${url} contains relevant information about the research topic. Multiple paragraphs of mock content are provided to simulate real page extraction.`,
//       author: 'Mock Author',
//       publishedAt: new Date().toISOString(),
//       canonicalUrl: getCanonicalUrl(url),
//     };
//   }
// }
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosInstance } from 'axios';
import { cleanHtml, extractSnippet } from '../common/utils/text.utils';
import { getCanonicalUrl } from '../common/utils/url.utils';

export interface ExtractedContent {
  title: string;
  content: string;
  author: string | null;
  publishedAt: string | null;
  canonicalUrl: string;
}

@Injectable()
export class SourceExtractorService {
  private readonly logger = new Logger(SourceExtractorService.name);
  private readonly httpClient: AxiosInstance;
  private readonly timeout: number;
  private readonly isMockMode: boolean;

  constructor(private readonly configService: ConfigService) {
    this.timeout = configService.get<number>('sources.fetchTimeout', 10000);
    this.isMockMode = configService.get<boolean>('mockExternalServices', false);

    // Standard Real-Browser Request Headers
    this.httpClient = axios.create({
      timeout: this.timeout,
      maxRedirects: 10,
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        'Accept':
          'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'Accept-Encoding': 'gzip, deflate, br',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache',
        'Sec-Ch-Ua': '"Chromium";v="124", "Google Chrome";v="124", "Not-A.Brand";v="99"',
        'Sec-Ch-Ua-Mobile': '?0',
        'Sec-Ch-Ua-Platform': '"Windows"',
        'Sec-Fetch-Dest': 'document',
        'Sec-Fetch-Mode': 'navigate',
        'Sec-Fetch-Site': 'none',
        'Sec-Fetch-User': '?1',
        'Upgrade-Insecure-Requests': '1',
      },
    });
  }

  async extract(url: string): Promise<ExtractedContent | null> {
    if (this.isMockMode) {
      return this.mockExtract(url);
    }

    try {
      const response = await this.httpClient.get(url, {
        responseType: 'text',
        maxContentLength: 10 * 1024 * 1024,
        // Accept common HTTP status codes without throwing immediately
        validateStatus: (status) => status >= 200 && status < 300,
      });

      const html = response.data as string;
      const content = cleanHtml(html);
      const title = this.extractTitle(html);
      const author = this.extractMetaTag(html, 'author');
      const publishedAt =
        this.extractMetaTag(html, 'article:published_time') ||
        this.extractMetaTag(html, 'datePublished') ||
        this.extractMetaTag(html, 'og:updated_time');
      const canonical = this.extractCanonicalUrl(html) || getCanonicalUrl(url);

      // Early filtering for short or missing scraped content
      if (!content || content.length < 50) {
        this.logger.warn(`[Extractor] Empty or too-short content from ${url}`);
        return null;
      }

      return {
        title: title || extractSnippet(content, 100),
        content: content.slice(0, 50000),
        author: author || null,
        publishedAt: publishedAt || null,
        canonicalUrl: canonical,
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      this.logger.warn(`[Extractor] Failed to extract ${url}: ${message}`);
      return null;
    }
  }

  private extractTitle(html: string): string {
    const match = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    return match ? match[1].trim() : '';
  }

  private extractMetaTag(html: string, property: string): string | null {
    const patterns = [
      new RegExp(`<meta[^>]*property=["']${property}["'][^>]*content=["']([^"']+)["']`, 'i'),
      new RegExp(`<meta[^>]*name=["']${property}["'][^>]*content=["']([^"']+)["']`, 'i'),
      new RegExp(`<meta[^>]*content=["']([^"']+)["'][^>]*property=["']${property}["']`, 'i'),
      new RegExp(`<meta[^>]*content=["']([^"']+)["'][^>]*name=["']${property}["']`, 'i'),
    ];
    for (const pattern of patterns) {
      const match = html.match(pattern);
      if (match) return match[1].trim();
    }
    return null;
  }

  private extractCanonicalUrl(html: string): string | null {
    const match = html.match(/<link[^>]*rel=["']canonical["'][^>]*href=["']([^"']+)["']/i);
    return match ? match[1].trim() : null;
  }

  private mockExtract(url: string): ExtractedContent {
    return {
      title: `[Mock] Page title for ${url}`,
      content: `This is mock extracted content for development purposes. The page at ${url} contains relevant information about the research topic.`,
      author: 'Mock Author',
      publishedAt: new Date().toISOString(),
      canonicalUrl: getCanonicalUrl(url),
    };
  }
}