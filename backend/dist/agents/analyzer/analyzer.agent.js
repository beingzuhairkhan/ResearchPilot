"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var AnalyzerAgent_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnalyzerAgent = void 0;
const common_1 = require("@nestjs/common");
let AnalyzerAgent = AnalyzerAgent_1 = class AnalyzerAgent {
    constructor(llmProvider) {
        this.llmProvider = llmProvider;
        this.logger = new common_1.Logger(AnalyzerAgent_1.name);
    }
    async analyze(question, evidence, sources) {
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
    formatEvidence(evidence, sources) {
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
    formatSources(sources) {
        return sources
            .map((s) => `sourceId=${s.sourceId} | title=${s.title} | domain=${s.domain} | snippet=${s.snippet}`)
            .join('\n');
    }
    parseAnalysis(content, sources) {
        try {
            const parsed = JSON.parse(content);
            const validSourceIds = new Set(sources.map((s) => s.sourceId));
            const claims = (parsed.claims || [])
                .filter((c) => c.claim)
                .map((c) => ({
                claim: String(c.claim),
                importance: (['high', 'medium', 'low'].includes(c.importance)
                    ? c.importance
                    : 'medium'),
                supportingSources: (c.supportingSources || []).filter((id) => validSourceIds.has(id)),
                evidence: (c.evidence || [])
                    .filter((e) => e.sourceId && validSourceIds.has(e.sourceId))
                    .map((e) => ({
                    sourceId: String(e.sourceId),
                    quote: String(e.quote || ''),
                    reason: String(e.reason || ''),
                })),
            }));
            this.logger.log(`[Analyzer] Extracted ${claims.length} claims`);
            return { claims };
        }
        catch (error) {
            const message = error instanceof Error ? error.message : 'Parse error';
            this.logger.error(`[Analyzer] Failed to parse: ${message}`);
            return { claims: [] };
        }
    }
};
exports.AnalyzerAgent = AnalyzerAgent;
exports.AnalyzerAgent = AnalyzerAgent = AnalyzerAgent_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)('LLM_PROVIDER')),
    __metadata("design:paramtypes", [Object])
], AnalyzerAgent);
//# sourceMappingURL=analyzer.agent.js.map