"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReportNotFoundException = exports.EmbeddingException = exports.PineconeException = exports.LlmException = exports.SerpApiException = exports.ResearchAlreadyExistsException = exports.ResearchNotFoundException = void 0;
const common_1 = require("@nestjs/common");
class ResearchNotFoundException extends common_1.HttpException {
    constructor(message = 'Research session not found') {
        super({ code: 'RESEARCH_NOT_FOUND', message }, common_1.HttpStatus.NOT_FOUND);
    }
}
exports.ResearchNotFoundException = ResearchNotFoundException;
class ResearchAlreadyExistsException extends common_1.HttpException {
    constructor(message = 'Research session already exists') {
        super({ code: 'RESEARCH_ALREADY_EXISTS', message }, common_1.HttpStatus.CONFLICT);
    }
}
exports.ResearchAlreadyExistsException = ResearchAlreadyExistsException;
class SerpApiException extends common_1.HttpException {
    constructor(message = 'SerpApi request failed') {
        super({ code: 'SERPAPI_ERROR', message }, common_1.HttpStatus.SERVICE_UNAVAILABLE);
    }
}
exports.SerpApiException = SerpApiException;
class LlmException extends common_1.HttpException {
    constructor(message = 'LLM request failed') {
        super({ code: 'LLM_ERROR', message }, common_1.HttpStatus.SERVICE_UNAVAILABLE);
    }
}
exports.LlmException = LlmException;
class PineconeException extends common_1.HttpException {
    constructor(message = 'Pinecone operation failed') {
        super({ code: 'PINECONE_ERROR', message }, common_1.HttpStatus.SERVICE_UNAVAILABLE);
    }
}
exports.PineconeException = PineconeException;
class EmbeddingException extends common_1.HttpException {
    constructor(message = 'Embedding generation failed') {
        super({ code: 'EMBEDDING_ERROR', message }, common_1.HttpStatus.SERVICE_UNAVAILABLE);
    }
}
exports.EmbeddingException = EmbeddingException;
class ReportNotFoundException extends common_1.HttpException {
    constructor(message = 'Report not found') {
        super({ code: 'REPORT_NOT_FOUND', message }, common_1.HttpStatus.NOT_FOUND);
    }
}
exports.ReportNotFoundException = ReportNotFoundException;
//# sourceMappingURL=custom.exceptions.js.map