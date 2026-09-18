import { LlmProvider } from '../../llm/interfaces/llm-provider.interface';
import { ReportData, Claim, Conflict, ResearchPlan } from '../../common/interfaces/research.interface';
export interface ReportInput {
    question: string;
    plan: ResearchPlan;
    claims: Claim[];
    comparison: {
        agreements: string[];
        conflicts: Conflict[];
    };
    sources: Array<{
        sourceId: string;
        title: string;
        url: string;
        domain: string;
        publishedAt: string | null;
    }>;
    metrics: Record<string, unknown>;
}
export declare class ReporterAgent {
    private readonly llmProvider;
    private readonly logger;
    constructor(llmProvider: LlmProvider);
    generateReport(input: ReportInput): Promise<ReportData>;
    private buildSourceList;
    private parseReport;
}
