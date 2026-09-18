import { ConfigService } from '@nestjs/config';
export interface ExtractedContent {
    title: string;
    content: string;
    author: string | null;
    publishedAt: string | null;
    canonicalUrl: string;
}
export declare class SourceExtractorService {
    private readonly configService;
    private readonly logger;
    private readonly httpClient;
    private readonly timeout;
    private readonly isMockMode;
    constructor(configService: ConfigService);
    extract(url: string): Promise<ExtractedContent | null>;
    private extractTitle;
    private extractMetaTag;
    private extractCanonicalUrl;
    private mockExtract;
}
