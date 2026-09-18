"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var RetrievalService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.RetrievalService = void 0;
const common_1 = require("@nestjs/common");
const embedding_service_1 = require("./embedding.service");
const pinecone_service_1 = require("./pinecone.service");
const chunking_service_1 = require("./chunking.service");
let RetrievalService = RetrievalService_1 = class RetrievalService {
    constructor(embeddingService, pineconeService, chunkingService) {
        this.embeddingService = embeddingService;
        this.pineconeService = pineconeService;
        this.chunkingService = chunkingService;
        this.logger = new common_1.Logger(RetrievalService_1.name);
    }
    async indexSourceContent(researchId, sourceId, content, metadata) {
        const chunks = this.chunkingService.chunkContent(sourceId, content, metadata);
        if (chunks.length === 0)
            return 0;
        const batchSize = 100;
        let totalIndexed = 0;
        for (let i = 0; i < chunks.length; i += batchSize) {
            const batch = chunks.slice(i, i + batchSize);
            const texts = batch.map((c) => c.text);
            const embeddings = await this.embeddingService.embedTexts(texts);
            const vectors = batch.map((chunk, j) => ({
                id: `${researchId}_${sourceId}_${chunk.chunkIndex}`,
                values: embeddings[j],
                metadata: {
                    researchId,
                    sourceId,
                    title: chunk.metadata.title,
                    url: chunk.metadata.url,
                    domain: chunk.metadata.domain,
                    publishedAt: chunk.metadata.publishedAt,
                    chunkIndex: chunk.chunkIndex,
                },
            }));
            await this.pineconeService.upsertVectors(vectors);
            totalIndexed += vectors.length;
        }
        this.logger.log(`[RAG] Indexed ${totalIndexed} chunks for sourceId=${sourceId}`);
        return totalIndexed;
    }
    async retrieveEvidence(researchId, query, topK = 10) {
        const queryEmbedding = await this.embeddingService.embedText(query);
        const results = await this.pineconeService.queryVectors(queryEmbedding, researchId, topK);
        this.logger.log(`[RAG] Retrieved ${results.length} evidence chunks for researchId=${researchId}`);
        return results;
    }
};
exports.RetrievalService = RetrievalService;
exports.RetrievalService = RetrievalService = RetrievalService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [embedding_service_1.EmbeddingService,
        pinecone_service_1.PineconeService,
        chunking_service_1.ChunkingService])
], RetrievalService);
//# sourceMappingURL=retrieval.service.js.map