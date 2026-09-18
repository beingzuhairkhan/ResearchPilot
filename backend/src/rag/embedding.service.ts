import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EmbeddingException } from '../common/exceptions/custom.exceptions';

interface JinaEmbeddingResponse {
  model: string;
  data: { embedding: number[]; index: number }[];
  usage?: { total_tokens: number };
}

@Injectable()
export class EmbeddingService {
  private readonly logger = new Logger(EmbeddingService.name);
  private readonly apiKey: string;
  private readonly model: string;
  private readonly isMockMode: boolean;
  private readonly dimension = 2048;
  private readonly endpoint = 'https://api.jina.ai/v1/embeddings';

  constructor(private readonly configService: ConfigService) {
    this.apiKey = configService.get<string>('embedding.apiKey', '');
    this.model = configService.get<string>('embedding.model', 'jina-embeddings-v4');
    this.isMockMode = configService.get<boolean>('mockExternalServices', false);
  }

  async embedText(text: string, task: 'retrieval.passage' | 'retrieval.query' | 'text-matching' = 'retrieval.passage'): Promise<number[]> {
    if (this.isMockMode || !this.apiKey) {
      return this.mockEmbed(text);
    }
    try {
      const result = await this.callJina([{ text }], task);
      return result.data[0].embedding;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown embedding error';
      this.logger.error(`[Embedding] Failed: ${message}`);
      throw new EmbeddingException(message);
    }
  }

  async embedTexts(texts: string[], task: 'retrieval.passage' | 'retrieval.query' | 'text-matching' = 'retrieval.passage'): Promise<number[][]> {
    if (this.isMockMode || !this.apiKey) {
      return texts.map((t) => this.mockEmbed(t));
    }
    try {
      const input = texts.map((text) => ({ text }));
      const result = await this.callJina(input, task);
      // Jina returns results possibly out of order for batches — sort by index to be safe
      return result.data
        .sort((a, b) => a.index - b.index)
        .map((d) => d.embedding);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown embedding error';
      this.logger.error(`[Embedding] Batch failed: ${message}`);
      throw new EmbeddingException(message);
    }
  }

  getDimension(): number {
    return this.dimension;
  }

  isConfigured(): boolean {
    return this.isMockMode || !!this.apiKey;
  }

  private async callJina(
    input: { text: string }[],
    task: string,
  ): Promise<JinaEmbeddingResponse> {
    const response = await fetch(this.endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: this.model,
        task,
        input,
      }),
    });

    if (!response.ok) {
      const errorBody = await response.text().catch(() => '');
      throw new Error(`Jina API error ${response.status}: ${errorBody}`);
    }

    return response.json() as Promise<JinaEmbeddingResponse>;
  }

  private mockEmbed(text: string): number[] {
    const seed = text.length;
    const embedding: number[] = [];
    for (let i = 0; i < this.dimension; i++) {
      const value = Math.sin(seed + i * 0.1) * 0.5;
      embedding.push(value);
    }
    return embedding;
  }
}