import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PineconeException } from '../common/exceptions/custom.exceptions';

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

@Injectable()
export class PineconeService {
  private readonly logger = new Logger(PineconeService.name);
  private readonly apiKey: string;
  private readonly indexName: string;
  private readonly namespace: string;
  private readonly isMockMode: boolean;
  private index: any = null;

  constructor(private readonly configService: ConfigService) {
    this.apiKey = configService.get<string>('pinecone.apiKey', '');
    this.indexName = configService.get<string>('pinecone.index', 'researchpilot');
    this.namespace = configService.get<string>('pinecone.namespace', 'researchpilot');
    this.isMockMode = configService.get<boolean>('mockExternalServices', false);
  }

  private async getIndex(): Promise<any> {
    if (this.index) return this.index;
    if (this.isMockMode || !this.apiKey) {
      this.index = null;
      return null;
    }
    try {
      const { Pinecone } = await import('@pinecone-database/pinecone');
      const pinecone = new Pinecone({ apiKey: this.apiKey });
      this.index = pinecone.index(this.indexName).namespace(this.namespace);
      return this.index;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Pinecone init failed';
      this.logger.error(`[Pinecone] Init failed: ${message}`);
      throw new PineconeException(message);
    }
  }

  /**
   * Sanitizes metadata objects by removing null or undefined values and
   * ensuring nested structures or unsupported types are handled.
   */
  private sanitizeMetadata(metadata: Record<string, unknown>): Record<string, unknown> {
    const sanitized: Record<string, unknown> = {};

    for (const [key, value] of Object.entries(metadata || {})) {
      // Strip null and undefined properties completely
      if (value === null || value === undefined) {
        continue;
      }

      // Allow strings, numbers, booleans directly
      if (
        typeof value === 'string' ||
        typeof value === 'number' ||
        typeof value === 'boolean'
      ) {
        sanitized[key] = value;
      } 
      // Ensure array values only contain strings (Pinecone requirement)
      else if (Array.isArray(value)) {
        sanitized[key] = value
          .filter((item) => item !== null && item !== undefined)
          .map((item) => String(item));
      } 
      // Convert unsupported complex objects or dates into strings
      else if (typeof value === 'object') {
        if (value instanceof Date) {
          sanitized[key] = value.toISOString();
        } else {
          sanitized[key] = JSON.stringify(value);
        }
      }
    }

    return sanitized;
  }

  async upsertVectors(vectors: PineconeVector[]): Promise<void> {
    if (this.isMockMode || !this.apiKey) {
      this.logger.warn(`[Pinecone] MOCK mode — would upsert ${vectors.length} vectors`);
      return;
    }
    try {
      const index = await this.getIndex();
      if (!index) return;
      
      const records = vectors.map((v) => ({
        id: v.id,
        values: v.values,
        metadata: this.sanitizeMetadata(v.metadata), // <--- Sanitized before sending to Pinecone
      }));
      
      await index.upsert(records);
      this.logger.log(`[Pinecone] Upserted ${vectors.length} vectors`);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Pinecone upsert failed';
      this.logger.error(`[Pinecone] Upsert failed: ${message}`);
      throw new PineconeException(message);
    }
  }

  async queryVectors(
    queryVector: number[],
    researchId: string,
    topK = 10,
  ): Promise<PineconeQueryResult[]> {
    if (this.isMockMode || !this.apiKey) {
      this.logger.warn(`[Pinecone] MOCK mode — returning mock query results`);
      return [];
    }
    try {
      const index = await this.getIndex();
      if (!index) return [];
      const response = await index.query({
        vector: queryVector,
        topK,
        filter: { researchId: { $eq: researchId } },
        includeMetadata: true,
      });
      return (response.matches || []).map((m: any) => ({
        id: m.id,
        score: m.score,
        metadata: m.metadata || {},
      }));
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Pinecone query failed';
      this.logger.error(`[Pinecone] Query failed: ${message}`);
      throw new PineconeException(message);
    }
  }

  async deleteResearchVectors(researchId: string): Promise<void> {
    if (this.isMockMode || !this.apiKey) {
      this.logger.warn(`[Pinecone] MOCK mode — would delete vectors for ${researchId}`);
      return;
    }
    try {
      const index = await this.getIndex();
      if (!index) return;
      await index.deleteMany({ filter: { researchId: { $eq: researchId } } });
      this.logger.log(`[Pinecone] Deleted vectors for researchId=${researchId}`);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Pinecone delete failed';
      this.logger.error(`[Pinecone] Delete failed: ${message}`);
      throw new PineconeException(message);
    }
  }

  isConfigured(): boolean {
    return this.isMockMode || this.apiKey.length > 0;
  }
}