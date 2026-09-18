import { EmbeddingService } from './embedding.service';
import { PineconeService, PineconeQueryResult } from './pinecone.service';
import { ChunkingService } from './chunking.service';
export declare class RetrievalService {
    private readonly embeddingService;
    private readonly pineconeService;
    private readonly chunkingService;
    private readonly logger;
    constructor(embeddingService: EmbeddingService, pineconeService: PineconeService, chunkingService: ChunkingService);
    indexSourceContent(researchId: string, sourceId: string, content: string, metadata: {
        title: string;
        url: string;
        domain: string;
        publishedAt: string | null;
    }): Promise<number>;
    retrieveEvidence(researchId: string, query: string, topK?: number): Promise<PineconeQueryResult[]>;
}
