import { Injectable, Logger } from '@nestjs/common';
import { ContentChunk } from '../common/interfaces/research.interface';
import { EmbeddingService } from './embedding.service';
import { PineconeService, PineconeVector, PineconeQueryResult } from './pinecone.service';
import { ChunkingService } from './chunking.service';

@Injectable()
export class RetrievalService {
  private readonly logger = new Logger(RetrievalService.name);

  constructor(
    private readonly embeddingService: EmbeddingService,
    private readonly pineconeService: PineconeService,
    private readonly chunkingService: ChunkingService,
  ) {}

  async indexSourceContent(
    researchId: string,
    sourceId: string,
    content: string,
    metadata: { title: string; url: string; domain: string; publishedAt: string | null },
  ): Promise<number> {
    const chunks = this.chunkingService.chunkContent(sourceId, content, metadata);
    if (chunks.length === 0) return 0;

    const batchSize = 100;
    let totalIndexed = 0;

    for (let i = 0; i < chunks.length; i += batchSize) {
      const batch = chunks.slice(i, i + batchSize);
      const texts = batch.map((c) => c.text);
      const embeddings = await this.embeddingService.embedTexts(texts);

      const vectors: PineconeVector[] = batch.map((chunk, j) => ({
        id: `${researchId}_${sourceId}_${chunk.chunkIndex}`,
        values: embeddings[j],
        metadata: {
          researchId,
          sourceId,
          title: chunk.metadata.title,
          url: chunk.metadata.url,
          domain: chunk.metadata.domain,
          publishedAt: chunk.metadata.publishedAt,
          chunkIndex: chunk.chunkIndex,
        },
      }));

      await this.pineconeService.upsertVectors(vectors);
      totalIndexed += vectors.length;
    }

    this.logger.log(`[RAG] Indexed ${totalIndexed} chunks for sourceId=${sourceId}`);
    return totalIndexed;
  }

  async retrieveEvidence(
    researchId: string,
    query: string,
    topK = 10,
  ): Promise<PineconeQueryResult[]> {
    const queryEmbedding = await this.embeddingService.embedText(query);
    const results = await this.pineconeService.queryVectors(queryEmbedding, researchId, topK);
    this.logger.log(`[RAG] Retrieved ${results.length} evidence chunks for researchId=${researchId}`);
    return results;
  }
}
