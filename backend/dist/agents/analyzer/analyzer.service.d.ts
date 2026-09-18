import { AnalyzerAgent, SourceInfo } from './analyzer.agent';
import { AnalysisResult } from '../../common/interfaces/research.interface';
import { PineconeQueryResult } from '../../rag/pinecone.service';
export declare class AnalyzerService {
    private readonly analyzerAgent;
    private readonly logger;
    constructor(analyzerAgent: AnalyzerAgent);
    analyze(question: string, evidence: PineconeQueryResult[], sources: SourceInfo[]): Promise<AnalysisResult>;
}
