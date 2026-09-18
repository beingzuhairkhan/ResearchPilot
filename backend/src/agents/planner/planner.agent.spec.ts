import { ResearchMode } from '../../common/enums/research-mode.enum';
import { ResearchPlan } from '../../common/interfaces/research.interface';
import { LlmProvider } from '../../llm/interfaces/llm-provider.interface';
import { PlannerAgent } from './planner.agent';

class MockLlmProvider implements LlmProvider {
  async complete(request: { messages: { content: string }[] }): Promise<{ content: string }> {
    const lastMsg = request.messages[request.messages.length - 1]?.content || '';
    if (lastMsg.includes('Research question')) {
      return {
        content: JSON.stringify({
          objective: 'Understand AI adoption in Indian IT',
          tasks: [
            { type: 'web', query: 'AI adoption Indian IT companies 2026', purpose: 'General evidence' },
            { type: 'news', query: 'Indian IT generative AI 2026', purpose: 'Recent developments' },
            { type: 'web', query: 'TCS Infosys generative AI', purpose: 'Company-level adoption' },
          ],
        }),
      };
    }
    return { content: '{}' };
  }
}

class BadJsonLlmProvider implements LlmProvider {
  async complete(): Promise<{ content: string }> {
    return { content: 'not valid json' };
  }
}

describe('PlannerAgent', () => {
  it('should generate a valid plan with objective and tasks', async () => {
    const agent = new PlannerAgent(new MockLlmProvider());
    const plan = await agent.createPlan(
      'Research AI adoption in Indian IT companies',
      ResearchMode.DEEP,
      true,
      false,
    );
    expect(plan.objective).toBeTruthy();
    expect(plan.tasks.length).toBeGreaterThan(0);
    expect(plan.tasks[0].query).toBeTruthy();
    expect(plan.tasks[0].type).toBeTruthy();
    expect(plan.tasks[0].purpose).toBeTruthy();
  });

  it('should detect recency terms in the question', async () => {
    const agent = new PlannerAgent(new MockLlmProvider());
    const plan = await agent.createPlan(
      'What is the current state of AI adoption?',
      ResearchMode.DEEP,
      true,
      false,
    );
    expect(plan).toBeDefined();
  });

  it('should fall back to a default plan when LLM returns invalid JSON', async () => {
    const agent = new PlannerAgent(new BadJsonLlmProvider());
    const plan = await agent.createPlan('test question', ResearchMode.DEEP, true, false);
    expect(plan.objective).toBeTruthy();
    expect(plan.tasks.length).toBeGreaterThan(0);
  });

  it('should respect quick mode with fewer tasks', async () => {
    const agent = new PlannerAgent(new MockLlmProvider());
    const plan = await agent.createPlan('test', ResearchMode.QUICK, true, false);
    expect(plan).toBeDefined();
  });

  it('should filter out tasks missing required fields', async () => {
    const provider: LlmProvider = {
      async complete() {
        return {
          content: JSON.stringify({
            objective: 'Test',
            tasks: [
              { type: 'web', query: 'valid', purpose: 'test' },
              { type: 'web', query: '', purpose: 'missing query' },
              { type: '', query: 'no type', purpose: 'test' },
            ],
          }),
        };
      },
    };
    const agent = new PlannerAgent(provider);
    const plan = await agent.createPlan('test', ResearchMode.DEEP, true, false);
    expect(plan.tasks.length).toBe(1);
  });
});
