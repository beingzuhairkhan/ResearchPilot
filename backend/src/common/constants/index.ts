export enum ResearchStatus {
  QUEUED = 'queued',
  CREATED = 'created',
  PLANNING = 'planning',
  SEARCHING = 'searching',
  COLLECTING = 'collecting',
  PROCESSING = 'processing',
  INDEXING = 'indexing',
  RAG_RETRIEVAL = 'rag_retrieval',
  ANALYZING = 'analyzing',
  COMPARING = 'comparing',
  GENERATING_REPORT = 'generating_report',
  COMPLETED = 'completed',
  FAILED = 'failed',
}


export const STAGE_PROGRESS: Record<ResearchStatus, number> = {
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


export const SERPAPI_BASE_URL = 'https://serpapi.com/search';

export const REDIS_CONNECTION = {
  maxRetriesPerRequest: null,
  enableReadyCheck: false,
};

export const QUEUE_NAME = 'research';
