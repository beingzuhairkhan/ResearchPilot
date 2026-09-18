"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.QUEUE_NAME = exports.REDIS_CONNECTION = exports.SERPAPI_BASE_URL = exports.STAGE_PROGRESS = exports.RESEARCH_STAGES = void 0;
exports.RESEARCH_STAGES = [
    'queued',
    'planning',
    'searching',
    'collecting',
    'processing',
    'indexing',
    'analyzing',
    'comparing',
    'generating_report',
    'completed',
];
exports.STAGE_PROGRESS = {
    queued: 0,
    planning: 5,
    searching: 15,
    collecting: 30,
    processing: 45,
    indexing: 55,
    analyzing: 65,
    comparing: 75,
    generating_report: 85,
    completed: 100,
};
exports.SERPAPI_BASE_URL = 'https://serpapi.com/search';
exports.REDIS_CONNECTION = {
    maxRetriesPerRequest: null,
    enableReadyCheck: false,
};
exports.QUEUE_NAME = 'research';
//# sourceMappingURL=index.js.map