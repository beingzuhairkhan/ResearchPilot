"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.QUEUE_NAME = exports.REDIS_CONNECTION = exports.SERPAPI_BASE_URL = exports.STAGE_PROGRESS = exports.ResearchStatus = void 0;
var ResearchStatus;
(function (ResearchStatus) {
    ResearchStatus["QUEUED"] = "queued";
    ResearchStatus["CREATED"] = "created";
    ResearchStatus["PLANNING"] = "planning";
    ResearchStatus["SEARCHING"] = "searching";
    ResearchStatus["COLLECTING"] = "collecting";
    ResearchStatus["PROCESSING"] = "processing";
    ResearchStatus["INDEXING"] = "indexing";
    ResearchStatus["RAG_RETRIEVAL"] = "rag_retrieval";
    ResearchStatus["ANALYZING"] = "analyzing";
    ResearchStatus["COMPARING"] = "comparing";
    ResearchStatus["GENERATING_REPORT"] = "generating_report";
    ResearchStatus["COMPLETED"] = "completed";
    ResearchStatus["FAILED"] = "failed";
})(ResearchStatus || (exports.ResearchStatus = ResearchStatus = {}));
exports.STAGE_PROGRESS = {
    [ResearchStatus.QUEUED]: 0,
    [ResearchStatus.CREATED]: 0,
    [ResearchStatus.PLANNING]: 10,
    [ResearchStatus.SEARCHING]: 20,
    [ResearchStatus.COLLECTING]: 30,
    [ResearchStatus.PROCESSING]: 40,
    [ResearchStatus.INDEXING]: 50,
    [ResearchStatus.RAG_RETRIEVAL]: 60,
    [ResearchStatus.ANALYZING]: 70,
    [ResearchStatus.COMPARING]: 80,
    [ResearchStatus.GENERATING_REPORT]: 90,
    [ResearchStatus.COMPLETED]: 100,
    [ResearchStatus.FAILED]: 0,
};
exports.SERPAPI_BASE_URL = 'https://serpapi.com/search';
exports.REDIS_CONNECTION = {
    maxRetriesPerRequest: null,
    enableReadyCheck: false,
};
exports.QUEUE_NAME = 'research';
//# sourceMappingURL=index.js.map