import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ContentChunk } from '../common/interfaces/research.interface';

@Injectable()
export class ChunkingService {
  private readonly logger = new Logger(ChunkingService.name);
  private readonly chunkSize: number;
  private readonly chunkOverlap: number;

  constructor(private readonly configService: ConfigService) {
    this.chunkSize = this.configService.get<number>('rag.chunkSize', 1000);
    this.chunkOverlap = this.configService.get<number>('rag.chunkOverlap', 150);
  }

  chunkContent(
    sourceId: string,
    content: string,
    metadata: { title: string; url: string; domain: string; publishedAt: string | null },
  ): ContentChunk[] {
    if (!content || content.length === 0) return [];

    const chunks: ContentChunk[] = [];
    const step = this.chunkSize - this.chunkOverlap;

    let start = 0;
    let chunkIndex = 0;

    while (start < content.length) {
      const end = Math.min(start + this.chunkSize, content.length);
      const text = content.slice(start, end).trim();
      if (text.length > 0) {
        chunks.push({
          sourceId,
          text,
          chunkIndex,
          metadata,
        });
        chunkIndex++;
      }
      if (end >= content.length) break;
      start += step;
    }

    this.logger.debug(`[Chunking] Split into ${chunks.length} chunks (size=${this.chunkSize}, overlap=${this.chunkOverlap})`);
    return chunks;
  }
}
