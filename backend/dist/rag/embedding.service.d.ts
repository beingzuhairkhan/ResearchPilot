import { ConfigService } from '@nestjs/config';
export declare class EmbeddingService {
    private readonly configService;
    private readonly logger;
    private readonly apiKey;
    private readonly model;
    private readonly isMockMode;
    private readonly dimension;
    private readonly endpoint;
    constructor(configService: ConfigService);
    embedText(text: string, task?: 'retrieval.passage' | 'retrieval.query' | 'text-matching'): Promise<number[]>;
    embedTexts(texts: string[], task?: 'retrieval.passage' | 'retrieval.query' | 'text-matching'): Promise<number[][]>;
    getDimension(): number;
    isConfigured(): boolean;
    private callJina;
    private mockEmbed;
}
