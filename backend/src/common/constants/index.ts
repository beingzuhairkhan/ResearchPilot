export const RESEARCH_STAGES = [
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
] as const;

export const STAGE_PROGRESS: Record<string, number> = {
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

export const SERPAPI_BASE_URL = 'https://serpapi.com/search';

export const REDIS_CONNECTION = {
  maxRetriesPerRequest: null,
  enableReadyCheck: false,
};

export const QUEUE_NAME = 'research';
