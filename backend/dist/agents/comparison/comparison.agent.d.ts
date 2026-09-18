import { LlmProvider } from '../../llm/interfaces/llm-provider.interface';
import { ComparisonResult, Claim } from '../../common/interfaces/research.interface';
export declare class ComparisonAgent {
    private readonly llmProvider;
    private readonly logger;
    constructor(llmProvider: LlmProvider);
    compare(claims: Claim[], question: string): Promise<ComparisonResult>;
    private parseComparison;
}
