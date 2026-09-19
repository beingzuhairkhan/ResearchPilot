export enum ResearchEventType {
  CREATED = 'research.created',

  PLANNING = 'research.planning',
  PLAN_CREATED = 'research.plan_created',

  SEARCH_STARTED = 'research.search_started',
  SEARCH_COMPLETED = 'research.search_completed',

  SOURCES_COLLECTED = 'research.sources_collected',
  DEDUPLICATION_COMPLETED = 'research.deduplication_completed',

  PROCESSING_STARTED = 'research.processing_started',
  PROCESSING_COMPLETED = 'research.processing_completed',

  INDEXING_STARTED = 'research.indexing_started',
  INDEXING_COMPLETED = 'research.indexing_completed',

  RAG_COMPLETED = 'research.rag_completed',

  ANALYSIS_STARTED = 'research.analysis_started',
  ANALYSIS_COMPLETED = 'research.analysis_completed',

  COMPARISON_COMPLETED = 'research.comparison_completed',

  REPORT_STARTED = 'research.report_started',
  REPORT_COMPLETED = 'research.report_completed',

  COMPLETED = 'research.completed',
  FAILED = 'research.failed',
}
