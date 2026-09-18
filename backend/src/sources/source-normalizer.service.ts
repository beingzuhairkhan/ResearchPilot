import { Injectable } from '@nestjs/common';
import { NormalizedSearchResult } from '../common/interfaces/research.interface';
import { normalizeUrl, getDomain } from '../common/utils/url.utils';
import { normalizeWhitespace } from '../common/utils/text.utils';

@Injectable()
export class SourceNormalizerService {
  normalizeResult(result: NormalizedSearchResult): NormalizedSearchResult {
    return {
      ...result,
      title: normalizeWhitespace(result.title),
      url: normalizeUrl(result.url),
      snippet: normalizeWhitespace(result.snippet),
      source: result.source || getDomain(result.url),
    };
  }

  normalizeUrl(rawUrl: string): string {
    return normalizeUrl(rawUrl);
  }
}
