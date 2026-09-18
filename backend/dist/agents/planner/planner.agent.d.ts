import { LlmProvider } from '../../llm/interfaces/llm-provider.interface';
import { ResearchPlan } from '../../common/interfaces/research.interface';
import { ResearchMode } from '../../common/enums/research-mode.enum';
export declare class PlannerAgent {
    private readonly llmProvider;
    private readonly logger;
    constructor(llmProvider: LlmProvider);
    createPlan(question: string, mode: ResearchMode, includeNews: boolean, includeScholar: boolean): Promise<ResearchPlan>;
    private detectRecency;
    private parsePlan;
    private fallbackPlan;
}
