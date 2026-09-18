import { Injectable, Logger, Inject } from '@nestjs/common';
import { LlmProvider } from '../../llm/interfaces/llm-provider.interface';
import {
  ReportData,
  ReportSource,
  Claim,
  Conflict,
  ResearchPlan,
} from '../../common/interfaces/research.interface';

export interface ReportInput {
  question: string;
  plan: ResearchPlan;
  claims: Claim[];
  comparison: { agreements: string[]; conflicts: Conflict[] };
  sources: Array<{
    sourceId: string;
    title: string;
    url: string;
    domain: string;
    publishedAt: string | null;
  }>;
  metrics: Record<string, unknown>;
}

@Injectable()
export class ReporterAgent {
  private readonly logger = new Logger(ReporterAgent.name);

  constructor(@Inject('LLM_PROVIDER') private readonly llmProvider: LlmProvider) {}

  async generateReport(input: ReportInput): Promise<ReportData> {
    this.logger.log(`[Report] Generating report with ${input.claims.length} claims, ${input.sources.length} sources`);

    const sourcesList = input.sources
      .map((s, i) => `[${i + 1}] sourceId=${s.sourceId} title="${s.title}" url=${s.url} domain=${s.domain}`)
      .join('\n');

    const claimsContext = JSON.stringify(
      input.claims.map((c) => ({
        claim: c.claim,
        importance: c.importance,
        supportingSources: c.supportingSources,
      })),
      null,
      2,
    );

    const conflictsContext = JSON.stringify(input.comparison.conflicts, null, 2);
    const agreementsContext = input.comparison.agreements.join('\n');

    const systemPrompt = `You are a research report generator. Generate an evidence-backed research report.
Return ONLY valid JSON:
{
  "title": "report title",
  "executiveSummary": "2-3 paragraph summary",
  "keyFindings": ["finding 1", "finding 2"],
  "recentDevelopments": ["recent development 1"],
  "methodology": "description of research methodology",
  "limitations": "limitations of this research"
}
Rules:
- Do NOT invent facts, URLs, or citations
- Base all findings on the provided claims and sources
- Reference sources by their number [1], [2], etc.
- If evidence is insufficient, state that clearly in limitations
- Distinguish facts from interpretations
- Include conflicting evidence in the findings`;

    const userPrompt = `Research question: "${input.question}"

Research objective: ${input.plan.objective}

Sources (use these numbers for citations):
${sourcesList}

Claims extracted:
${claimsContext}

Agreements:
${agreementsContext}

Conflicts:
${conflictsContext}

Metrics: ${JSON.stringify(input.metrics)}`;

    const response = await this.llmProvider.complete({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.3,
      jsonMode: true,
      maxTokens: 4000,
    });

    const report = this.parseReport(response.content);
    report.sources = this.buildSourceList(input.sources);
    report.conflictingEvidence = input.comparison.conflicts;
    return report;
  }

  private buildSourceList(
    sources: Array<{ sourceId: string; title: string; url: string; domain: string; publishedAt: string | null }>,
  ): ReportSource[] {
    return sources.map((s, i) => ({
      citationNumber: i + 1,
      title: s.title,
      url: s.url,
      domain: s.domain,
      publishedAt: s.publishedAt,
    }));
  }

  private parseReport(content: string): ReportData {
    try {
      const parsed = JSON.parse(content);
      return {
        title: String(parsed.title || 'Research Report'),
        executiveSummary: String(parsed.executiveSummary || ''),
        keyFindings: (parsed.keyFindings || []).map((f: unknown) => String(f)),
        recentDevelopments: (parsed.recentDevelopments || []).map((d: unknown) => String(d)),
        conflictingEvidence: [],
        methodology: String(parsed.methodology || ''),
        limitations: String(parsed.limitations || ''),
        sources: [],
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Parse error';
      this.logger.error(`[Report] Failed to parse: ${message}`);
      return {
        title: 'Research Report',
        executiveSummary: 'Report generation encountered an error. Please review the collected sources.',
        keyFindings: [],
        recentDevelopments: [],
        conflictingEvidence: [],
        methodology: 'Multi-agent research with SerpApi and RAG',
        limitations: 'Report generation failed to parse LLM output.',
        sources: [],
      };
    }
  }
}
