import { ConfigService } from '@nestjs/config';
import { ContentChunk } from '../common/interfaces/research.interface';
export declare class ChunkingService {
    private readonly configService;
    private readonly logger;
    private readonly chunkSize;
    private readonly chunkOverlap;
    constructor(configService: ConfigService);
    chunkContent(sourceId: string, content: string, metadata: {
        title: string;
        url: string;
        domain: string;
        publishedAt: string | null;
    }): ContentChunk[];
}
