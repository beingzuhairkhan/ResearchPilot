import { LlmProvider } from '../../llm/interfaces/llm-provider.interface';
import { AnalysisResult } from '../../common/interfaces/research.interface';
import { PineconeQueryResult } from '../../rag/pinecone.service';
export interface SourceInfo {
    sourceId: string;
    title: string;
    url: string;
    domain: string;
    snippet: string;
    content: string;
}
export declare class AnalyzerAgent {
    private readonly llmProvider;
    private readonly logger;
    constructor(llmProvider: LlmProvider);
    analyze(question: string, evidence: PineconeQueryResult[], sources: SourceInfo[]): Promise<AnalysisResult>;
    private formatEvidence;
    private formatSources;
    private parseAnalysis;
}
