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
var ComparisonAgent_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ComparisonAgent = void 0;
const common_1 = require("@nestjs/common");
let ComparisonAgent = ComparisonAgent_1 = class ComparisonAgent {
    constructor(llmProvider) {
        this.llmProvider = llmProvider;
        this.logger = new common_1.Logger(ComparisonAgent_1.name);
    }
    async compare(claims, question) {
        this.logger.log(`[Comparison] Comparing ${claims.length} claims`);
        const claimsContext = JSON.stringify(claims.map((c) => ({
            claim: c.claim,
            importance: c.importance,
            supportingSources: c.supportingSources,
        })), null, 2);
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
    parseComparison(content) {
        try {
            const parsed = JSON.parse(content);
            const agreements = (parsed.agreements || []).map((a) => String(a));
            const conflicts = (parsed.conflicts || [])
                .filter((c) => c.topic && c.claimA && c.claimB)
                .map((c) => ({
                topic: String(c.topic),
                claimA: String(c.claimA),
                sourceA: String(c.sourceA || ''),
                claimB: String(c.claimB),
                sourceB: String(c.sourceB || ''),
                possibleReason: String(c.possibleReason || ''),
            }));
            this.logger.log(`[Comparison] Found ${agreements.length} agreements, ${conflicts.length} conflicts`);
            return { agreements, conflicts };
        }
        catch (error) {
            const message = error instanceof Error ? error.message : 'Parse error';
            this.logger.error(`[Comparison] Failed to parse: ${message}`);
            return { agreements: [], conflicts: [] };
        }
    }
};
exports.ComparisonAgent = ComparisonAgent;
exports.ComparisonAgent = ComparisonAgent = ComparisonAgent_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)('LLM_PROVIDER')),
    __metadata("design:paramtypes", [Object])
], ComparisonAgent);
//# sourceMappingURL=comparison.agent.js.map