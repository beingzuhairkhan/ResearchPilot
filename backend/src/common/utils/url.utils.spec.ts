import {
  normalizeUrl,
  getCanonicalUrl,
  getDomain,
  generateContentHash,
  generateUrlHash,
  isSimilarTitle,
  isRecentDate,
} from './url.utils';

describe('URL Utils', () => {
  describe('normalizeUrl', () => {
    it('should remove tracking parameters', () => {
      const url = 'https://example.com/article?utm_source=google&utm_medium=cpc&id=123';
      const result = normalizeUrl(url);
      expect(result).not.toContain('utm_source');
      expect(result).not.toContain('utm_medium');
      expect(result).toContain('id=123');
    });

    it('should remove hash fragments', () => {
      const url = 'https://example.com/page#section';
      const result = normalizeUrl(url);
      expect(result).not.toContain('#section');
    });

    it('should remove trailing slash', () => {
      const url = 'https://example.com/page/';
      const result = normalizeUrl(url);
      expect(result).toBe('https://example.com/page');
    });

    it('should lowercase the URL', () => {
      const url = 'https://Example.COM/Page';
      const result = normalizeUrl(url);
      expect(result).toBe('https://example.com/page');
    });

    it('should remove all UTM parameters', () => {
      const utmParams = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content'];
      for (const param of utmParams) {
        const url = `https://example.com/page?${param}=value`;
        const result = normalizeUrl(url);
        expect(result).not.toContain(param);
      }
    });

    it('should handle invalid URLs gracefully', () => {
      const result = normalizeUrl('not-a-url');
      expect(result).toBe('not-a-url');
    });
  });

  describe('getCanonicalUrl', () => {
    it('should remove www prefix', () => {
      const result = getCanonicalUrl('https://www.example.com/page');
      expect(result).toBe('example.com/page');
    });

    it('should remove tracking params', () => {
      const result = getCanonicalUrl('https://example.com/page?utm_source=x');
      expect(result).toBe('example.com/page');
    });
  });

  describe('getDomain', () => {
    it('should extract domain without www', () => {
      expect(getDomain('https://www.example.com/page')).toBe('example.com');
    });

    it('should return empty string for invalid URL', () => {
      expect(getDomain('not-a-url')).toBe('');
    });
  });

  describe('generateContentHash', () => {
    it('should generate consistent hash for same content', () => {
      const hash1 = generateContentHash('test content');
      const hash2 = generateContentHash('test content');
      expect(hash1).toBe(hash2);
    });

    it('should generate different hash for different content', () => {
      const hash1 = generateContentHash('content A');
      const hash2 = generateContentHash('content B');
      expect(hash1).not.toBe(hash2);
    });
  });

  describe('isSimilarTitle', () => {
    it('should detect identical titles', () => {
      expect(isSimilarTitle('AI Adoption in India', 'AI Adoption in India')).toBe(true);
    });

    it('should detect similar titles', () => {
      expect(isSimilarTitle('AI Adoption in India 2026', 'AI Adoption in India 2026 Report')).toBe(true);
    });

    it('should detect different titles', () => {
      expect(isSimilarTitle('AI Adoption in India', 'Cricket Score Update')).toBe(false);
    });
  });

  describe('isRecentDate', () => {
    it('should return true for recent dates', () => {
      const recent = new Date();
      recent.setMonth(recent.getMonth() - 2);
      expect(isRecentDate(recent)).toBe(true);
    });

    it('should return false for old dates', () => {
      const old = new Date('2020-01-01');
      expect(isRecentDate(old)).toBe(false);
    });

    it('should return false for null', () => {
      expect(isRecentDate(null)).toBe(false);
    });
  });
});
