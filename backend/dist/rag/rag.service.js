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
var RagService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.RagService = void 0;
const common_1 = require("@nestjs/common");
const retrieval_service_1 = require("./retrieval.service");
let RagService = RagService_1 = class RagService {
    constructor(retrievalService) {
        this.retrievalService = retrievalService;
        this.logger = new common_1.Logger(RagService_1.name);
    }
    async indexSource(researchId, sourceId, content, metadata) {
        return this.retrievalService.indexSourceContent(researchId, sourceId, content, metadata);
    }
    async retrieveEvidence(researchId, query, topK) {
        return this.retrievalService.retrieveEvidence(researchId, query, topK);
    }
    formatEvidenceContext(results) {
        if (results.length === 0)
            return 'No evidence retrieved.';
        const formatted = results.map((r, i) => {
            const meta = r.metadata;
            return `[${i + 1}] Source: ${meta.title || 'Unknown'} (${meta.url || ''})\nDomain: ${meta.domain || ''}\nContent: ${meta.text || ''}`;
        });
        return formatted.join('\n\n---\n\n');
    }
};
exports.RagService = RagService;
exports.RagService = RagService = RagService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [retrieval_service_1.RetrievalService])
], RagService);
//# sourceMappingURL=rag.service.js.map