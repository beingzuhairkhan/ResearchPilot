import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';
import {
  LlmMessage,
  LlmCompletionRequest,
  LlmCompletionResponse,
  LlmProvider,
} from './interfaces/llm-provider.interface';
import { LlmException } from '../common/exceptions/custom.exceptions';

@Injectable()
export class OpenAiLlmProvider implements LlmProvider {
  private readonly logger = new Logger(OpenAiLlmProvider.name);
  private readonly client: OpenAI;
  private readonly model: string;

  constructor(private readonly configService: ConfigService) {
    const apiKey = configService.get<string>('llm.apiKey', '');

    this.model = configService.get<string>(
      'llm.model',
      'llama-3.3-70b-versatile',
    );

    this.client = new OpenAI({
      apiKey,
      baseURL: 'https://api.groq.com/openai/v1',
    });
  }

  async complete(request: LlmCompletionRequest): Promise<LlmCompletionResponse> {
    try {
      const response = await this.client.chat.completions.create({
        model: this.model,
        messages: request.messages as OpenAI.Chat.ChatCompletionMessageParam[],
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
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown LLM error';
      this.logger.error(`[LLM] Request failed: ${message}`);
      throw new LlmException(message);
    }
  }
}

@Injectable()
export class MockLlmProvider implements LlmProvider {
  private readonly logger = new Logger(MockLlmProvider.name);

  async complete(request: LlmCompletionRequest): Promise<LlmCompletionResponse> {
    this.logger.warn('[LLM] MOCK mode — returning mock completion');
    const lastMessage = request.messages[request.messages.length - 1];
    const mockContent = this.generateMockResponse(lastMessage?.content || '');
    return {
      content: mockContent,
      usage: { promptTokens: 100, completionTokens: 200, totalTokens: 300 },
    };
  }

  private generateMockResponse(prompt: string): string {
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
}
