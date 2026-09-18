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
var EmbeddingService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmbeddingService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const custom_exceptions_1 = require("../common/exceptions/custom.exceptions");
let EmbeddingService = EmbeddingService_1 = class EmbeddingService {
    constructor(configService) {
        this.configService = configService;
        this.logger = new common_1.Logger(EmbeddingService_1.name);
        this.dimension = 2048;
        this.endpoint = 'https://api.jina.ai/v1/embeddings';
        this.apiKey = configService.get('embedding.apiKey', '');
        this.model = configService.get('embedding.model', 'jina-embeddings-v4');
        this.isMockMode = configService.get('mockExternalServices', false);
    }
    async embedText(text, task = 'retrieval.passage') {
        if (this.isMockMode || !this.apiKey) {
            return this.mockEmbed(text);
        }
        try {
            const result = await this.callJina([{ text }], task);
            return result.data[0].embedding;
        }
        catch (error) {
            const message = error instanceof Error ? error.message : 'Unknown embedding error';
            this.logger.error(`[Embedding] Failed: ${message}`);
            throw new custom_exceptions_1.EmbeddingException(message);
        }
    }
    async embedTexts(texts, task = 'retrieval.passage') {
        if (this.isMockMode || !this.apiKey) {
            return texts.map((t) => this.mockEmbed(t));
        }
        try {
            const input = texts.map((text) => ({ text }));
            const result = await this.callJina(input, task);
            return result.data
                .sort((a, b) => a.index - b.index)
                .map((d) => d.embedding);
        }
        catch (error) {
            const message = error instanceof Error ? error.message : 'Unknown embedding error';
            this.logger.error(`[Embedding] Batch failed: ${message}`);
            throw new custom_exceptions_1.EmbeddingException(message);
        }
    }
    getDimension() {
        return this.dimension;
    }
    isConfigured() {
        return this.isMockMode || !!this.apiKey;
    }
    async callJina(input, task) {
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
        return response.json();
    }
    mockEmbed(text) {
        const seed = text.length;
        const embedding = [];
        for (let i = 0; i < this.dimension; i++) {
            const value = Math.sin(seed + i * 0.1) * 0.5;
            embedding.push(value);
        }
        return embedding;
    }
};
exports.EmbeddingService = EmbeddingService;
exports.EmbeddingService = EmbeddingService = EmbeddingService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], EmbeddingService);
//# sourceMappingURL=embedding.service.js.map