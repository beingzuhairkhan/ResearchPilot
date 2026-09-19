export type ResearchStatus = 'queued' | 'planning' | 'researching' | 'analyzing' | 'completed' | 'failed';

export type ResearchMode = 'quick' | 'deep';

export type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'failed';

export type SourceType = 'web' | 'news' | 'scholar' | 'company' | 'report';

export type Relevance = 'high' | 'medium' | 'low';

export type AgentType =
  | 'planner'
  | 'research'
  | 'collector'
  | 'rag'
  | 'evidence'
  | 'comparison'
  | 'report';

export type TimelineStepStatus = 'completed' | 'active' | 'pending' | 'failed';

export interface ResearchSession {
  _id: string;
  question: string;
  status: ResearchStatus;
  mode: ResearchMode;
  progress: number;
  currentStep: string;
  sourcesFound: number;
  sourcesAnalyzed: number;
  relevantSources: number;
  conflictingClaims: number;
  createdAt: string;
  completedAt?: string;
}

export interface ResearchTask {
  id: string;
  index: number;
  type: string;
  query: string;
  purpose: string;
  status: TaskStatus;
  sourcesFound?: number;
}

export interface ResearchPlan {
  objective: string;
  tasks: ResearchTask[];
}

export interface Source {
  id: string;
  title: string;
  url: string;
  domain: string;
  snippet?: string;
  sourceType: SourceType;
  publishedAt?: string;
  relevanceScore?: number;
  relevance?: Relevance;
}

export interface Finding {
  id: string;
  statement: string;
  citations: number[];
}

export interface Development {
  id: string;
  text: string;
  citations: number[];
}

export interface Conflict {
  id: string;
  topic: string;
  sourceA: {
    claim: string;
    sourceRef: number;
  };
  sourceB: {
    claim: string;
    sourceRef: number;
  };
  explanation?: string;
}

export interface CitationSource {
  index: number;
  title: string;
  domain: string;
  url: string;
  publishedAt?: string;
}

export interface Report {
  title: string;
  executiveSummary: string;
  keyFindings: Finding[];
  recentDevelopments: Development[];
  conflictingEvidence: Conflict[];
  methodology?: string;
  limitations?: string[];
  sources: CitationSource[];
}

export interface AgentActivity {
  id: string;
  agent: AgentType;
  label: string;
  detail: string;
  timestamp: string;
  status: TimelineStepStatus;
}

export interface TimelineStep {
  id: string;
  label: string;
  status: TimelineStepStatus;
}

export interface SSEEvent {
  type: string;
  data: Record<string, unknown>;
  timestamp: string;
}

export interface Toast {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  message: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
