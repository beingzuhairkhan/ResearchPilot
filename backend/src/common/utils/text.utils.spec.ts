import { cleanHtml, extractSnippet, truncateText, normalizeWhitespace } from './text.utils';

describe('Text Utils', () => {
  describe('cleanHtml', () => {
    it('should remove script tags', () => {
      const html = '<script>alert("xss")</script><p>content</p>';
      expect(cleanHtml(html)).toBe('content');
    });

    it('should remove style tags', () => {
      const html = '<style>.x{color:red}</style><p>text</p>';
      expect(cleanHtml(html)).toBe('text');
    });

    it('should remove nav and footer', () => {
      const html = '<nav>menu</nav><p>main</p><footer>bottom</footer>';
      expect(cleanHtml(html)).toBe('main');
    });

    it('should decode HTML entities', () => {
      expect(cleanHtml('&amp;')).toBe('&');
      expect(cleanHtml('&lt;')).toBe('<');
      expect(cleanHtml('&gt;')).toBe('>');
      expect(cleanHtml('&nbsp;')).toBe(' ');
    });

    it('should normalize whitespace', () => {
      const html = '<p>hello     world</p>';
      expect(cleanHtml(html)).toBe('hello world');
    });
  });

  describe('truncateText', () => {
    it('should return text shorter than max', () => {
      expect(truncateText('short', 100)).toBe('short');
    });

    it('should truncate with ellipsis', () => {
      expect(truncateText('1234567890', 5)).toBe('12...');
    });
  });

  describe('normalizeWhitespace', () => {
    it('should collapse multiple spaces', () => {
      expect(normalizeWhitespace('a    b')).toBe('a b');
    });

    it('should trim', () => {
      expect(normalizeWhitespace('  hello  ')).toBe('hello');
    });
  });

  describe('extractSnippet', () => {
    it('should extract and truncate', () => {
      const text = 'A'.repeat(500);
      const snippet = extractSnippet(text, 50);
      expect(snippet.length).toBeLessThanOrEqual(53);
      expect(snippet.endsWith('...')).toBe(true);
    });
  });
});
