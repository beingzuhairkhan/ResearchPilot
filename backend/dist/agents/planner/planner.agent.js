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
var PlannerAgent_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PlannerAgent = void 0;
const common_1 = require("@nestjs/common");
const research_mode_enum_1 = require("../../common/enums/research-mode.enum");
let PlannerAgent = PlannerAgent_1 = class PlannerAgent {
    constructor(llmProvider) {
        this.llmProvider = llmProvider;
        this.logger = new common_1.Logger(PlannerAgent_1.name);
    }
    async createPlan(question, mode, includeNews, includeScholar) {
        this.logger.log(`[Planner] Creating plan for question="${question}" mode=${mode}`);
        const recencyHint = this.detectRecency(question);
        const maxTasks = mode === research_mode_enum_1.ResearchMode.QUICK ? 3 : 6;
        const systemPrompt = `You are a research planning agent. Your job is to break a research question into diverse search tasks.
Return ONLY valid JSON with this structure:
{
  "objective": "string describing the research objective",
  "tasks": [
    { "type": "web" | "news" | "scholar", "query": "search query string", "purpose": "why this query" }
  ]
}
Rules:
- Generate at most ${maxTasks} tasks
- ${includeNews ? 'Include at least one news search' : 'Do not include news searches'}
- ${includeScholar ? 'Include at least one scholar search' : 'Do not include scholar searches'}
- ${recencyHint ? 'This question requires recent/current information — include the year 2026 in queries' : ''}
- Avoid duplicate queries
- Make queries diverse: general industry, company-specific, news, research`;
        const userPrompt = `Research question: "${question}"`;
        const response = await this.llmProvider.complete({
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: userPrompt },
            ],
            temperature: 0.3,
            jsonMode: true,
            maxTokens: 2000,
        });
        const plan = this.parsePlan(response.content);
        this.logger.log(`[Planner] Created ${plan.tasks.length} tasks`);
        return plan;
    }
    detectRecency(question) {
        const recencyTerms = ['latest', 'current', 'today', 'this year', 'recent', '2025', '2026', 'now'];
        const lower = question.toLowerCase();
        return recencyTerms.some((term) => lower.includes(term));
    }
    parsePlan(content) {
        try {
            const parsed = JSON.parse(content);
            if (!parsed.objective || !Array.isArray(parsed.tasks)) {
                throw new Error('Invalid plan structure');
            }
            const tasks = parsed.tasks
                .filter((t) => t.query && t.type && t.purpose)
                .map((t) => ({
                type: String(t.type),
                query: String(t.query),
                purpose: String(t.purpose),
            }));
            return { objective: String(parsed.objective), tasks };
        }
        catch (error) {
            const message = error instanceof Error ? error.message : 'Parse error';
            this.logger.error(`[Planner] Failed to parse plan: ${message}`);
            return this.fallbackPlan();
        }
    }
    fallbackPlan() {
        return {
            objective: 'Research the given question using web sources',
            tasks: [
                { type: 'web', query: 'AI adoption India 2026', purpose: 'General industry evidence' },
                { type: 'news', query: 'Indian IT companies AI 2026', purpose: 'Recent developments' },
            ],
        };
    }
};
exports.PlannerAgent = PlannerAgent;
exports.PlannerAgent = PlannerAgent = PlannerAgent_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)('LLM_PROVIDER')),
    __metadata("design:paramtypes", [Object])
], PlannerAgent);
//# sourceMappingURL=planner.agent.js.map