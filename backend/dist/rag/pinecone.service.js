"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var PineconeService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PineconeService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const custom_exceptions_1 = require("../common/exceptions/custom.exceptions");
let PineconeService = PineconeService_1 = class PineconeService {
    constructor(configService) {
        this.configService = configService;
        this.logger = new common_1.Logger(PineconeService_1.name);
        this.index = null;
        this.apiKey = configService.get('pinecone.apiKey', '');
        this.indexName = configService.get('pinecone.index', 'researchpilot');
        this.namespace = configService.get('pinecone.namespace', 'researchpilot');
        this.isMockMode = configService.get('mockExternalServices', false);
    }
    async getIndex() {
        if (this.index)
            return this.index;
        if (this.isMockMode || !this.apiKey) {
            this.index = null;
            return null;
        }
        try {
            const { Pinecone } = await Promise.resolve().then(() => __importStar(require('@pinecone-database/pinecone')));
            const pinecone = new Pinecone({ apiKey: this.apiKey });
            this.index = pinecone.index(this.indexName).namespace(this.namespace);
            return this.index;
        }
        catch (error) {
            const message = error instanceof Error ? error.message : 'Pinecone init failed';
            this.logger.error(`[Pinecone] Init failed: ${message}`);
            throw new custom_exceptions_1.PineconeException(message);
        }
    }
    sanitizeMetadata(metadata) {
        const sanitized = {};
        for (const [key, value] of Object.entries(metadata || {})) {
            if (value === null || value === undefined) {
                continue;
            }
            if (typeof value === 'string' ||
                typeof value === 'number' ||
                typeof value === 'boolean') {
                sanitized[key] = value;
            }
            else if (Array.isArray(value)) {
                sanitized[key] = value
                    .filter((item) => item !== null && item !== undefined)
                    .map((item) => String(item));
            }
            else if (typeof value === 'object') {
                if (value instanceof Date) {
                    sanitized[key] = value.toISOString();
                }
                else {
                    sanitized[key] = JSON.stringify(value);
                }
            }
        }
        return sanitized;
    }
    async upsertVectors(vectors) {
        if (this.isMockMode || !this.apiKey) {
            this.logger.warn(`[Pinecone] MOCK mode — would upsert ${vectors.length} vectors`);
            return;
        }
        try {
            const index = await this.getIndex();
            if (!index)
                return;
            const records = vectors.map((v) => ({
                id: v.id,
                values: v.values,
                metadata: this.sanitizeMetadata(v.metadata),
            }));
            await index.upsert(records);
            this.logger.log(`[Pinecone] Upserted ${vectors.length} vectors`);
        }
        catch (error) {
            const message = error instanceof Error ? error.message : 'Pinecone upsert failed';
            this.logger.error(`[Pinecone] Upsert failed: ${message}`);
            throw new custom_exceptions_1.PineconeException(message);
        }
    }
    async queryVectors(queryVector, researchId, topK = 10) {
        if (this.isMockMode || !this.apiKey) {
            this.logger.warn(`[Pinecone] MOCK mode — returning mock query results`);
            return [];
        }
        try {
            const index = await this.getIndex();
            if (!index)
                return [];
            const response = await index.query({
                vector: queryVector,
                topK,
                filter: { researchId: { $eq: researchId } },
                includeMetadata: true,
            });
            return (response.matches || []).map((m) => ({
                id: m.id,
                score: m.score,
                metadata: m.metadata || {},
            }));
        }
        catch (error) {
            const message = error instanceof Error ? error.message : 'Pinecone query failed';
            this.logger.error(`[Pinecone] Query failed: ${message}`);
            throw new custom_exceptions_1.PineconeException(message);
        }
    }
    async deleteResearchVectors(researchId) {
        if (this.isMockMode || !this.apiKey) {
            this.logger.warn(`[Pinecone] MOCK mode — would delete vectors for ${researchId}`);
            return;
        }
        try {
            const index = await this.getIndex();
            if (!index)
                return;
            await index.deleteMany({ filter: { researchId: { $eq: researchId } } });
            this.logger.log(`[Pinecone] Deleted vectors for researchId=${researchId}`);
        }
        catch (error) {
            const message = error instanceof Error ? error.message : 'Pinecone delete failed';
            this.logger.error(`[Pinecone] Delete failed: ${message}`);
            throw new custom_exceptions_1.PineconeException(message);
        }
    }
    isConfigured() {
        return this.isMockMode || this.apiKey.length > 0;
    }
};
exports.PineconeService = PineconeService;
exports.PineconeService = PineconeService = PineconeService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], PineconeService);
//# sourceMappingURL=pinecone.service.js.map