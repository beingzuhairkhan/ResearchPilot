import { ConfigService } from '@nestjs/config';
export interface PineconeVector {
    id: string;
    values: number[];
    metadata: Record<string, unknown>;
}
export interface PineconeQueryResult {
    id: string;
    score: number;
    metadata: Record<string, unknown>;
}
export declare class PineconeService {
    private readonly configService;
    private readonly logger;
    private readonly apiKey;
    private readonly indexName;
    private readonly namespace;
    private readonly isMockMode;
    private index;
    constructor(configService: ConfigService);
    private getIndex;
    private sanitizeMetadata;
    upsertVectors(vectors: PineconeVector[]): Promise<void>;
    queryVectors(queryVector: number[], researchId: string, topK?: number): Promise<PineconeQueryResult[]>;
    deleteResearchVectors(researchId: string): Promise<void>;
    isConfigured(): boolean;
}
