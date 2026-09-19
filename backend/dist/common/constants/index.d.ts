export declare enum ResearchStatus {
    QUEUED = "queued",
    CREATED = "created",
    PLANNING = "planning",
    SEARCHING = "searching",
    COLLECTING = "collecting",
    PROCESSING = "processing",
    INDEXING = "indexing",
    RAG_RETRIEVAL = "rag_retrieval",
    ANALYZING = "analyzing",
    COMPARING = "comparing",
    GENERATING_REPORT = "generating_report",
    COMPLETED = "completed",
    FAILED = "failed"
}
export declare const STAGE_PROGRESS: Record<ResearchStatus, number>;
export declare const SERPAPI_BASE_URL = "https://serpapi.com/search";
export declare const REDIS_CONNECTION: {
    maxRetriesPerRequest: null;
    enableReadyCheck: boolean;
};
export declare const QUEUE_NAME = "research";
