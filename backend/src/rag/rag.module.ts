import { Module } from '@nestjs/common';
import { ChunkingService } from './chunking.service';
import { EmbeddingService } from './embedding.service';
import { PineconeService } from './pinecone.service';
import { RetrievalService } from './retrieval.service';
import { RagService } from './rag.service';

@Module({
  providers: [ChunkingService, EmbeddingService, PineconeService, RetrievalService, RagService],
  exports: [ChunkingService, EmbeddingService, PineconeService, RetrievalService, RagService],
})
export class RagModule {}
