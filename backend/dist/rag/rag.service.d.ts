import { RetrievalService } from './retrieval.service';
import { PineconeQueryResult } from './pinecone.service';
export declare class RagService {
    private readonly retrievalService;
    private readonly logger;
    constructor(retrievalService: RetrievalService);
    indexSource(researchId: string, sourceId: string, content: string, metadata: {
        title: string;
        url: string;
        domain: string;
        publishedAt: string | null;
    }): Promise<number>;
    retrieveEvidence(researchId: string, query: string, topK?: number): Promise<PineconeQueryResult[]>;
    formatEvidenceContext(results: PineconeQueryResult[]): string;
}
