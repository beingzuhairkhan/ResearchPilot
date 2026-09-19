import { Injectable, Logger, Inject } from '@nestjs/common';
import { LlmProvider } from '../../llm/interfaces/llm-provider.interface';
import { ResearchPlan } from '../../common/interfaces/research.interface';
import { ResearchMode } from '../../common/enums/research-mode.enum';

@Injectable()
export class PlannerAgent {
  private readonly logger = new Logger(PlannerAgent.name);

  constructor(@Inject('LLM_PROVIDER') private readonly llmProvider: LlmProvider) {}

  async createPlan(
    question: string,
    mode: ResearchMode,
    includeNews: boolean,
    includeScholar: boolean,
  ): Promise<ResearchPlan> {
    this.logger.log(`[Planner] Creating plan for question="${question}" mode=${mode}`);

    const recencyHint = this.detectRecency(question);
    const maxTasks = mode === ResearchMode.QUICK ? 3 : 6;

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
      maxTokens: 4000,
    });

    const plan = this.parsePlan(response.content);
    this.logger.log(`[Planner] Created ${plan.tasks.length} tasks`);
    return plan;
  }

  private detectRecency(question: string): boolean {
    const recencyTerms = ['latest', 'current', 'today', 'this year', 'recent', '2025', '2026', 'now'];
    const lower = question.toLowerCase();
    return recencyTerms.some((term) => lower.includes(term));
  }

  private parsePlan(content: string): ResearchPlan {
    try {
      const parsed = JSON.parse(content);
      if (!parsed.objective || !Array.isArray(parsed.tasks)) {
        throw new Error('Invalid plan structure');
      }
      const tasks = parsed.tasks
        .filter((t: Record<string, unknown>) => t.query && t.type && t.purpose)
        .map((t: Record<string, unknown>) => ({
          type: String(t.type),
          query: String(t.query),
          purpose: String(t.purpose),
        }));
      return { objective: String(parsed.objective), tasks };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Parse error';
      this.logger.error(`[Planner] Failed to parse plan: ${message}`);
      return this.fallbackPlan();
    }
  }

  private fallbackPlan(): ResearchPlan {
    return {
      objective: 'Research the given question using web sources',
      tasks: [
        { type: 'web', query: 'AI adoption India 2026', purpose: 'General industry evidence' },
        { type: 'news', query: 'Indian IT companies AI 2026', purpose: 'Recent developments' },
      ],
    };
  }
}
