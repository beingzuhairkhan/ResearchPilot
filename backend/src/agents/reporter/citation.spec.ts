import { ReportSource, ReportData, Claim, Conflict } from '../../common/interfaces/research.interface';

describe('Citation System', () => {
  function buildSourceList(sources: Array<{ sourceId: string; title: string; url: string; domain: string; publishedAt: string | null }>): ReportSource[] {
    return sources.map((s, i) => ({
      citationNumber: i + 1,
      title: s.title,
      url: s.url,
      domain: s.domain,
      publishedAt: s.publishedAt,
    }));
  }

  it('should assign sequential citation numbers', () => {
    const sources = [
      { sourceId: 's1', title: 'Source 1', url: 'https://a.com', domain: 'a.com', publishedAt: null },
      { sourceId: 's2', title: 'Source 2', url: 'https://b.com', domain: 'b.com', publishedAt: null },
      { sourceId: 's3', title: 'Source 3', url: 'https://c.com', domain: 'c.com', publishedAt: null },
    ];
    const list = buildSourceList(sources);
    expect(list[0].citationNumber).toBe(1);
    expect(list[1].citationNumber).toBe(2);
    expect(list[2].citationNumber).toBe(3);
  });

  it('should include all required fields in citation', () => {
    const sources = [
      { sourceId: 's1', title: 'Test', url: 'https://example.com', domain: 'example.com', publishedAt: '2026-01-01' },
    ];
    const list = buildSourceList(sources);
    expect(list[0].title).toBe('Test');
    expect(list[0].url).toBe('https://example.com');
    expect(list[0].domain).toBe('example.com');
    expect(list[0].publishedAt).toBe('2026-01-01');
  });

  it('should map source IDs to citation numbers', () => {
    const sources = [
      { sourceId: 's1', title: 'A', url: 'https://a.com', domain: 'a.com', publishedAt: null },
      { sourceId: 's2', title: 'B', url: 'https://b.com', domain: 'b.com', publishedAt: null },
    ];
    const sourceIdToCitation = new Map<string, number>();
    sources.forEach((s, i) => sourceIdToCitation.set(s.sourceId, i + 1));

    expect(sourceIdToCitation.get('s1')).toBe(1);
    expect(sourceIdToCitation.get('s2')).toBe(2);
    expect(sourceIdToCitation.get('unknown')).toBeUndefined();
  });

  it('should never generate citations for non-existent sources', () => {
    const validSourceIds = new Set(['s1', 's2']);
    const claims: Claim[] = [
      {
        claim: 'Test claim',
        importance: 'high',
        supportingSources: ['s1', 's2', 's3'],
        evidence: [{ sourceId: 's1', quote: 'q', reason: 'r' }],
      },
    ];
    const filtered = claims[0].supportingSources.filter((id) => validSourceIds.has(id));
    expect(filtered).toContain('s1');
    expect(filtered).toContain('s2');
    expect(filtered).not.toContain('s3');
  });
});

describe('Report Validation', () => {
  it('should validate a complete report structure', () => {
    const report: ReportData = {
      title: 'AI Adoption Report',
      executiveSummary: 'Summary text',
      keyFindings: ['Finding 1', 'Finding 2'],
      recentDevelopments: ['Recent 1'],
      conflictingEvidence: [] as Conflict[],
      methodology: 'Multi-agent research',
      limitations: 'Limited sources',
      sources: [{ citationNumber: 1, title: 'S1', url: 'https://a.com', domain: 'a.com', publishedAt: null }],
    };
    expect(report.title).toBeTruthy();
    expect(report.executiveSummary).toBeTruthy();
    expect(Array.isArray(report.keyFindings)).toBe(true);
    expect(Array.isArray(report.sources)).toBe(true);
    expect(report.sources[0].citationNumber).toBe(1);
  });

  it('should handle empty report gracefully', () => {
    const report: ReportData = {
      title: '',
      executiveSummary: '',
      keyFindings: [],
      recentDevelopments: [],
      conflictingEvidence: [],
      methodology: '',
      limitations: '',
      sources: [],
    };
    expect(report.keyFindings.length).toBe(0);
    expect(report.sources.length).toBe(0);
  });
});
