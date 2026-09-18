import { SearchType, SourceType } from '../enums/source-type.enum';
import { ResearchMode } from '../enums/research-mode.enum';
import { ResearchStatus } from '../enums/research-status.enum';
import { ResearchTaskStatus } from '../enums/research-task-status.enum';

export interface ResearchTask {
  type: SearchType | string;
  query: string;
  purpose: string;
  status?: ResearchTaskStatus;
}

export interface ResearchPlan {
  objective: string;
  tasks: ResearchTask[];
}

export interface NormalizedSearchResult {
  title: string;
  url: string;
  snippet: string;
  source: string;
  publishedAt: string | null;
  searchType: SearchType;
  query: string;
  position: number;
}

export interface SourceDocument {
  _id?: string;
  researchId: string;
  title: string;
  url: string;
  canonicalUrl: string;
  domain: string;
  snippet: string;
  content: string;
  sourceType: SourceType;
  author: string | null;
  publishedAt: Date | null;
  discoveredAt: Date;
  searchQuery: string;
  relevanceScore: number;
  contentStatus: string;
  hash: string;
}

export interface ContentChunk {
  sourceId: string;
  text: string;
  chunkIndex: number;
  metadata: {
    title: string;
    url: string;
    domain: string;
    publishedAt: string | null;
  };
}

export interface Evidence {
  sourceId: string;
  quote: string;
  reason: string;
}

export interface Claim {
  claim: string;
  importance: 'high' | 'medium' | 'low';
  supportingSources: string[];
  evidence: Evidence[];
}

export interface AnalysisResult {
  claims: Claim[];
}

export interface Conflict {
  topic: string;
  claimA: string;
  sourceA: string;
  claimB: string;
  sourceB: string;
  possibleReason: string;
}

export interface ComparisonResult {
  agreements: string[];
  conflicts: Conflict[];
}

export interface ReportData {
  title: string;
  executiveSummary: string;
  keyFindings: string[];
  recentDevelopments: string[];
  conflictingEvidence: Conflict[];
  methodology: string;
  limitations: string;
  sources: ReportSource[];
}

export interface ReportSource {
  citationNumber: number;
  title: string;
  url: string;
  domain: string;
  publishedAt: string | null;
}

export interface ResearchMetrics {
  sourcesFound: number;
  sourcesAnalyzed: number;
  relevantSources: number;
  uniqueDomains: number;
  recentSources: number;
  primarySources: number;
  conflictingClaims: number;
  searchQueriesExecuted: number;
}

export interface ResearchSessionData {
  _id: string;
  question: string;
  normalizedQuestion: string;
  status: ResearchStatus;
  mode: ResearchMode;
  progress: number;
  currentStep: string;
  totalTasks: number;
  completedTasks: number;
  sourcesFound: number;
  sourcesAnalyzed: number;
  relevantSources: number;
  conflictingClaims: number;
  createdAt: Date;
  startedAt: Date | null;
  completedAt: Date | null;
  error: string | null;
  reportId: string | null;
  plan?: ResearchPlan;
  metrics?: ResearchMetrics;
}

export interface ResearchProgressEvent {
  researchId: string;
  event: string;
  progress: number;
  message: string;
  data?: Record<string, unknown>;
  timestamp: Date;
}
