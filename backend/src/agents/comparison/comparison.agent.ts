import { Injectable, Logger, Inject } from '@nestjs/common';
import { LlmProvider } from '../../llm/interfaces/llm-provider.interface';
import { ComparisonResult, Conflict, Claim } from '../../common/interfaces/research.interface';

@Injectable()
export class ComparisonAgent {
  private readonly logger = new Logger(ComparisonAgent.name);

  constructor(@Inject('LLM_PROVIDER') private readonly llmProvider: LlmProvider) {}

  async compare(claims: Claim[], question: string): Promise<ComparisonResult> {
    this.logger.log(`[Comparison] Comparing ${claims.length} claims`);

    const claimsContext = JSON.stringify(
      claims.map((c) => ({
        claim: c.claim,
        importance: c.importance,
        supportingSources: c.supportingSources,
      })),
      null,
      2,
    );

    const systemPrompt = `You are a source comparison agent. Compare claims from multiple sources.
Return ONLY valid JSON:
{
  "agreements": ["points where sources agree"],
  "conflicts": [
    {
      "topic": "topic of disagreement",
      "claimA": "what source A says",
      "sourceA": "sourceId A",
      "claimB": "what source B says",
      "sourceB": "sourceId B",
      "possibleReason": "possible explanation for the difference"
    }
  ]
}
Rules:
- Only report conflicts that are genuinely present in the claims
- Do not invent sources or claims
- Explain possible reasons: different methodology, different dates, different definitions, different scope
- Do not declare a source false — report the difference`;

    const userPrompt = `Research question: "${question}"

Claims to compare:
${claimsContext}`;

    const response = await this.llmProvider.complete({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.2,
      jsonMode: true,
      maxTokens: 3000,
    });

    return this.parseComparison(response.content);
  }

  private parseComparison(content: string): ComparisonResult {
    try {
      const parsed = JSON.parse(content);
      const agreements: string[] = (parsed.agreements || []).map((a: unknown) => String(a));
      const conflicts: Conflict[] = (parsed.conflicts || [])
        .filter((c: Record<string, unknown>) => c.topic && c.claimA && c.claimB)
        .map((c: Record<string, unknown>) => ({
          topic: String(c.topic),
          claimA: String(c.claimA),
          sourceA: String(c.sourceA || ''),
          claimB: String(c.claimB),
          sourceB: String(c.sourceB || ''),
          possibleReason: String(c.possibleReason || ''),
        }));
      this.logger.log(`[Comparison] Found ${agreements.length} agreements, ${conflicts.length} conflicts`);
      return { agreements, conflicts };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Parse error';
      this.logger.error(`[Comparison] Failed to parse: ${message}`);
      return { agreements: [], conflicts: [] };
    }
  }
}
