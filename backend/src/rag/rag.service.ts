import { Injectable, Logger } from '@nestjs/common';
import { RetrievalService } from './retrieval.service';
import { PineconeQueryResult } from './pinecone.service';

@Injectable()
export class RagService {
  private readonly logger = new Logger(RagService.name);

  constructor(private readonly retrievalService: RetrievalService) {}

  async indexSource(
    researchId: string,
    sourceId: string,
    content: string,
    metadata: { title: string; url: string; domain: string; publishedAt: string | null },
  ): Promise<number> {
    return this.retrievalService.indexSourceContent(researchId, sourceId, content, metadata);
  }

  async retrieveEvidence(
    researchId: string,
    query: string,
    topK?: number,
  ): Promise<PineconeQueryResult[]> {
    return this.retrievalService.retrieveEvidence(researchId, query, topK);
  }

  formatEvidenceContext(results: PineconeQueryResult[]): string {
    if (results.length === 0) return 'No evidence retrieved.';
    const formatted = results.map((r, i) => {
      const meta = r.metadata;
      return `[${i + 1}] Source: ${meta.title || 'Unknown'} (${meta.url || ''})\nDomain: ${meta.domain || ''}\nContent: ${meta.text || ''}`;
    });
    return formatted.join('\n\n---\n\n');
  }
}
