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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var OpenAiLlmProvider_1, MockLlmProvider_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.MockLlmProvider = exports.OpenAiLlmProvider = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const openai_1 = __importDefault(require("openai"));
const custom_exceptions_1 = require("../common/exceptions/custom.exceptions");
let OpenAiLlmProvider = OpenAiLlmProvider_1 = class OpenAiLlmProvider {
    constructor(configService) {
        this.configService = configService;
        this.logger = new common_1.Logger(OpenAiLlmProvider_1.name);
        const apiKey = configService.get('llm.apiKey', '');
        this.model = configService.get('llm.model', 'llama-3.3-70b-versatile');
        this.client = new openai_1.default({
            apiKey,
            baseURL: 'https://api.groq.com/openai/v1',
        });
    }
    async complete(request) {
        try {
            const response = await this.client.chat.completions.create({
                model: this.model,
                messages: request.messages,
                temperature: request.temperature ?? 0.3,
                max_tokens: request.maxTokens ?? 4096,
                response_format: request.jsonMode ? { type: 'json_object' } : undefined,
            });
            const content = response.choices[0]?.message?.content || '';
            return {
                content,
                usage: {
                    promptTokens: response.usage?.prompt_tokens || 0,
                    completionTokens: response.usage?.completion_tokens || 0,
                    totalTokens: response.usage?.total_tokens || 0,
                },
            };
        }
        catch (error) {
            const message = error instanceof Error ? error.message : 'Unknown LLM error';
            this.logger.error(`[LLM] Request failed: ${message}`);
            throw new custom_exceptions_1.LlmException(message);
        }
    }
};
exports.OpenAiLlmProvider = OpenAiLlmProvider;
exports.OpenAiLlmProvider = OpenAiLlmProvider = OpenAiLlmProvider_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], OpenAiLlmProvider);
let MockLlmProvider = MockLlmProvider_1 = class MockLlmProvider {
    constructor() {
        this.logger = new common_1.Logger(MockLlmProvider_1.name);
    }
    async complete(request) {
        this.logger.warn('[LLM] MOCK mode — returning mock completion');
        const lastMessage = request.messages[request.messages.length - 1];
        const mockContent = this.generateMockResponse(lastMessage?.content || '');
        return {
            content: mockContent,
            usage: { promptTokens: 100, completionTokens: 200, totalTokens: 300 },
        };
    }
    generateMockResponse(prompt) {
        if (prompt.includes('plan') || prompt.includes('objective')) {
            return JSON.stringify({
                objective: 'Understand the research question and break it into search tasks',
                tasks: [
                    { type: 'web', query: 'AI adoption India 2026', purpose: 'General industry evidence' },
                    { type: 'news', query: 'Indian IT generative AI 2026', purpose: 'Recent developments' },
                    { type: 'web', query: 'TCS Infosys generative AI', purpose: 'Company-level adoption' },
                ],
            });
        }
        if (prompt.includes('claim') || prompt.includes('analyz')) {
            return JSON.stringify({
                claims: [
                    {
                        claim: 'AI adoption is increasing among Indian IT companies',
                        importance: 'high',
                        supportingSources: ['source_1', 'source_2'],
                        evidence: [
                            { sourceId: 'source_1', quote: 'Companies are investing in AI', reason: 'Direct statement' },
                        ],
                    },
                ],
            });
        }
        if (prompt.includes('compar')) {
            return JSON.stringify({
                agreements: ['AI adoption is growing'],
                conflicts: [
                    {
                        topic: 'Adoption stage',
                        claimA: 'Enterprise adoption is increasing',
                        sourceA: 'source_1',
                        claimB: 'Most companies remain in experimentation',
                        sourceB: 'source_2',
                        possibleReason: 'Different survey scopes',
                    },
                ],
            });
        }
        if (prompt.includes('report') || prompt.includes('summary')) {
            return JSON.stringify({
                title: 'Research Report',
                executiveSummary: 'Based on collected sources, the research question was investigated.',
                keyFindings: ['Finding 1', 'Finding 2'],
                recentDevelopments: [],
                conflictingEvidence: [],
                methodology: 'Multi-source research with SerpApi and RAG',
                limitations: 'Limited to available sources',
                sources: [],
            });
        }
        return JSON.stringify({ result: 'Mock LLM response' });
    }
};
exports.MockLlmProvider = MockLlmProvider;
exports.MockLlmProvider = MockLlmProvider = MockLlmProvider_1 = __decorate([
    (0, common_1.Injectable)()
], MockLlmProvider);
//# sourceMappingURL=llm.service.js.map