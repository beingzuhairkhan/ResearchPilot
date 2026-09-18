export declare const RESEARCH_STAGES: readonly ["queued", "planning", "searching", "collecting", "processing", "indexing", "analyzing", "comparing", "generating_report", "completed"];
export declare const STAGE_PROGRESS: Record<string, number>;
export declare const SERPAPI_BASE_URL = "https://serpapi.com/search";
export declare const REDIS_CONNECTION: {
    maxRetriesPerRequest: null;
    enableReadyCheck: boolean;
};
export declare const QUEUE_NAME = "research";
