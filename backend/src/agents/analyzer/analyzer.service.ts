import { Injectable, Logger } from '@nestjs/common';
import { AnalyzerAgent, SourceInfo } from './analyzer.agent';
import { AnalysisResult } from '../../common/interfaces/research.interface';
import { PineconeQueryResult } from '../../rag/pinecone.service';

@Injectable()
export class AnalyzerService {
  private readonly logger = new Logger(AnalyzerService.name);

  constructor(private readonly analyzerAgent: AnalyzerAgent) {}

  async analyze(
    question: string,
    evidence: PineconeQueryResult[],
    sources: SourceInfo[],
  ): Promise<AnalysisResult> {
    return this.analyzerAgent.analyze(question, evidence, sources);
  }
}
