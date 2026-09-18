"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RagModule = void 0;
const common_1 = require("@nestjs/common");
const chunking_service_1 = require("./chunking.service");
const embedding_service_1 = require("./embedding.service");
const pinecone_service_1 = require("./pinecone.service");
const retrieval_service_1 = require("./retrieval.service");
const rag_service_1 = require("./rag.service");
let RagModule = class RagModule {
};
exports.RagModule = RagModule;
exports.RagModule = RagModule = __decorate([
    (0, common_1.Module)({
        providers: [chunking_service_1.ChunkingService, embedding_service_1.EmbeddingService, pinecone_service_1.PineconeService, retrieval_service_1.RetrievalService, rag_service_1.RagService],
        exports: [chunking_service_1.ChunkingService, embedding_service_1.EmbeddingService, pinecone_service_1.PineconeService, retrieval_service_1.RetrievalService, rag_service_1.RagService],
    })
], RagModule);
//# sourceMappingURL=rag.module.js.map