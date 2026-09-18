import { Injectable, Logger, Inject } from '@nestjs/common';
import { LlmProvider } from '../../llm/interfaces/llm-provider.interface';
import { AnalysisResult, Claim, Evidence } from '../../common/interfaces/research.interface';
import { PineconeQueryResult } from '../../rag/pinecone.service';

export interface SourceInfo {
  sourceId: string;
  title: string;
  url: string;
  domain: string;
  snippet: string;
  content: string;
}

@Injectable()
export class AnalyzerAgent {
  private readonly logger = new Logger(AnalyzerAgent.name);

  constructor(@Inject('LLM_PROVIDER') private readonly llmProvider: LlmProvider) {}

  async analyze(
    question: string,
    evidence: PineconeQueryResult[],
    sources: SourceInfo[],
  ): Promise<AnalysisResult> {
    this.logger.log(`[Analyzer] Analyzing ${evidence.length} evidence chunks from ${sources.length} sources`);

    const evidenceContext = this.formatEvidence(evidence, sources);
    const sourcesContext = this.formatSources(sources);

    const systemPrompt = `You are an evidence analysis agent. Extract claims from the provided evidence.
Return ONLY valid JSON:
{
  "claims": [
    {
      "claim": "factual statement",
      "importance": "high" | "medium" | "low",
      "supportingSources": ["sourceId1", "sourceId2"],
      "evidence": [
        { "sourceId": "...", "quote": "exact quote from source", "reason": "why this supports the claim" }
      ]
    }
  ]
}
Rules:
- Only extract claims that are directly supported by the evidence
- Never invent sources, quotes, or citations
- Every sourceId must be from the provided sources list
- Identify the importance of each claim
- If evidence is insufficient, note that in the claim`;

    const userPrompt = `Research question: "${question}"

Available sources (use ONLY these sourceIds):
${sourcesContext}

Retrieved evidence:
${evidenceContext}`;

    const response = await this.llmProvider.complete({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.2,
      jsonMode: true,
      maxTokens: 4000,
    });

    return this.parseAnalysis(response.content, sources);
  }

  private formatEvidence(evidence: PineconeQueryResult[], sources: SourceInfo[]): string {
    if (evidence.length === 0) {
      return 'No RAG evidence retrieved. Analyze based on source content only.';
    }
    return evidence
      .map((e, i) => {
        const meta = e.metadata;
        return `[${i + 1}] sourceId=${meta.sourceId || 'unknown'} title=${meta.title || ''} domain=${meta.domain || ''}`;
      })
      .join('\n');
  }

  private formatSources(sources: SourceInfo[]): string {
    return sources
      .map((s) => `sourceId=${s.sourceId} | title=${s.title} | domain=${s.domain} | snippet=${s.snippet}`)
      .join('\n');
  }

  private parseAnalysis(content: string, sources: SourceInfo[]): AnalysisResult {
    try {
      const parsed = JSON.parse(content);
      const validSourceIds = new Set(sources.map((s) => s.sourceId));

      const claims: Claim[] = (parsed.claims || [])
        .filter((c: Record<string, unknown>) => c.claim)
        .map((c: Record<string, unknown>) => ({
          claim: String(c.claim),
          importance: (['high', 'medium', 'low'].includes(c.importance as string)
            ? c.importance
            : 'medium') as 'high' | 'medium' | 'low',
          supportingSources: (c.supportingSources as string[] || []).filter((id) =>
            validSourceIds.has(id),
          ),
          evidence: ((c.evidence as Array<Record<string, string>>) || [])
            .filter((e) => e.sourceId && validSourceIds.has(e.sourceId))
            .map((e) => ({
              sourceId: String(e.sourceId),
              quote: String(e.quote || ''),
              reason: String(e.reason || ''),
            })) as Evidence[],
        }));

      this.logger.log(`[Analyzer] Extracted ${claims.length} claims`);
      return { claims };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Parse error';
      this.logger.error(`[Analyzer] Failed to parse: ${message}`);
      return { claims: [] };
    }
  }
}
