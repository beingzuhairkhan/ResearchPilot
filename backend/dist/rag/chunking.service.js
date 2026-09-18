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
var ChunkingService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChunkingService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
let ChunkingService = ChunkingService_1 = class ChunkingService {
    constructor(configService) {
        this.configService = configService;
        this.logger = new common_1.Logger(ChunkingService_1.name);
        this.chunkSize = this.configService.get('rag.chunkSize', 1000);
        this.chunkOverlap = this.configService.get('rag.chunkOverlap', 150);
    }
    chunkContent(sourceId, content, metadata) {
        if (!content || content.length === 0)
            return [];
        const chunks = [];
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
            if (end >= content.length)
                break;
            start += step;
        }
        this.logger.debug(`[Chunking] Split into ${chunks.length} chunks (size=${this.chunkSize}, overlap=${this.chunkOverlap})`);
        return chunks;
    }
};
exports.ChunkingService = ChunkingService;
exports.ChunkingService = ChunkingService = ChunkingService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], ChunkingService);
//# sourceMappingURL=chunking.service.js.map