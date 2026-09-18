import type {
  ResearchSession,
  ResearchPlan,
  Source,
  Report,
  ResearchMode,
  AgentActivity,
  TimelineStep,
  SSEEvent,
  ResearchStatus,
  PaginatedResponse,
} from '@/types/research';

const USE_MOCK = import.meta.env.VITE_USE_MOCK_API === 'true';

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function uid() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

const mockSessions: Map<string, ResearchSession> = new Map();
const mockPlans: Map<string, ResearchPlan> = new Map();
const mockSources: Map<string, Source[]> = new Map();
const mockReports: Map<string, Report> = new Map();
const mockActivities: Map<string, AgentActivity[]> = new Map();

const sampleQuestions = {
  default: 'Research the current adoption of Generative AI in Indian IT companies',
};

function genSession(question: string, mode: ResearchMode): ResearchSession {
  const id = uid();
  const now = new Date().toISOString();
  return {
    id,
    question,
    status: 'queued',
    mode,
    progress: 0,
    currentStep: 'Initializing research session',
    sourcesFound: 0,
    sourcesAnalyzed: 0,
    relevantSources: 0,
    conflictingClaims: 0,
    createdAt: now,
  };
}

function genPlan(question: string): ResearchPlan {
  const tasks = [
    { type: 'Web Research', query: `${question} 2026`, purpose: 'Find current web sources on the topic' },
    { type: 'News Research', query: `${question} latest news`, purpose: 'Find recent news articles' },
    { type: 'Scholar Research', query: `${question} research paper`, purpose: 'Find academic papers on the topic' },
    { type: 'Company Research', query: `${question} company reports`, purpose: 'Find company official statements' },
    { type: 'Trend Analysis', query: `${question} trends statistics`, purpose: 'Find quantitative trends and data' },
    { type: 'Comparative Research', query: `${question} comparison`, purpose: 'Compare different perspectives' },
  ];
  return {
    objective: question,
    tasks: tasks.map((t, i) => ({
      id: uid(),
      index: i + 1,
      type: t.type,
      query: t.query,
      purpose: t.purpose,
      status: 'pending' as const,
    })),
  };
}

function genSources(count: number): Source[] {
  const domains = ['reuters.com', 'bloomberg.com', 'techcrunch.com', 'nature.com', 'ieee.org', 'mckinsey.com', 'deloitte.com', 'hindustantimes.com', 'economictimes.com', 'livemint.com', 'wired.com', 'arxiv.org', 'gartner.com', 'forbes.com', 'thehindu.com'];
  const titles = [
    'Generative AI adoption continues to accelerate across enterprises',
    'Indian IT giants invest heavily in AI research capabilities',
    'The state of enterprise AI: From experimentation to production',
    'How AI is reshaping the software development landscape',
    'Enterprise RAG systems: A comparative analysis',
    'AI coding assistants see rapid enterprise adoption',
    'The economic impact of generative AI on IT services',
    'Quantum computing: Current state and future prospects',
    'EV adoption in India: Challenges and opportunities',
    'AI transformation in Indian IT companies: A deep dive',
    'Generative AI in the enterprise: Hype vs. reality',
    'The future of work: AI and the software developer',
    'India\'s tech sector embraces generative AI',
    'Enterprise AI strategies for 2026 and beyond',
    'Measuring the impact of AI on productivity',
  ];
  const types: Source['sourceType'][] = ['web', 'news', 'scholar', 'company', 'report'];
  const relevances: Source['relevance'][] = ['high', 'high', 'medium', 'medium', 'low'];
  return Array.from({ length: count }).map((_, i) => {
    const domain = domains[i % domains.length];
    const date = new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000);
    return {
      id: uid(),
      title: titles[i % titles.length],
      url: `https://${domain}/article/${uid()}`,
      domain,
      snippet: 'This article explores the current landscape and provides insights into the trends, challenges, and opportunities in this rapidly evolving field. Key findings suggest significant growth and transformation ahead.',
      sourceType: types[i % types.length],
      publishedAt: date.toISOString(),
      relevance: relevances[i % relevances.length],
      relevanceScore: 0.6 + Math.random() * 0.4,
    };
  });
}

function genReport(question: string, sources: Source[]): Report {
  const sourceCount = Math.min(sources.length, 8);
  return {
    title: `Research Report: ${question}`,
    executiveSummary: `This report investigates ${question}. Based on analysis of ${sources.length} sources from ${new Set(sources.map((s) => s.domain)).size} unique domains, the research reveals significant developments in this area. The evidence indicates a rapidly evolving landscape with multiple converging trends. Key stakeholders are making substantial investments, and the technology is transitioning from experimental to production deployments. However, challenges remain in areas such as scalability, cost, and regulatory compliance.`,
    keyFindings: [
      {
        id: uid(),
        statement: 'Enterprise adoption of generative AI has increased significantly over the past year, with major IT companies integrating AI capabilities into their core service offerings.',
        citations: [1, 3, 5],
      },
      {
        id: uid(),
        statement: 'Indian IT companies are investing heavily in AI research and development, establishing dedicated AI centers and partnering with leading AI platform providers.',
        citations: [2, 4, 7],
      },
      {
        id: uid(),
        statement: 'Despite rapid adoption, most organizations remain in early-stage implementation, with full-scale production deployments still limited.',
        citations: [6, 8],
      },
      {
        id: uid(),
        statement: 'The demand for AI-skilled professionals has surged, creating both opportunities and challenges for the IT workforce.',
        citations: [1, 9],
      },
    ],
    recentDevelopments: [
      { id: uid(), text: 'Major Indian IT firms announced new AI-focused business units and strategic partnerships.', citations: [2] },
      { id: uid(), text: 'New government policies aim to support AI innovation and adoption across sectors.', citations: [5] },
      { id: uid(), text: 'Several enterprises reported measurable productivity gains from AI-assisted development tools.', citations: [7] },
      { id: uid(), text: 'Industry analysts revised upward their forecasts for AI market growth in India.', citations: [3] },
    ],
    conflictingEvidence: [
      {
        id: uid(),
        topic: 'Enterprise AI adoption rate',
        sourceA: { claim: 'Adoption is rapidly increasing, with most enterprises now using AI in production.', sourceRef: 1 },
        sourceB: { claim: 'Most organizations remain in experimentation phases with limited production deployment.', sourceRef: 6 },
        explanation: 'The sources may use different definitions of "adoption" — one counting any AI usage, the other counting only production-grade deployments.',
      },
      {
        id: uid(),
        topic: 'Impact on software developer jobs',
        sourceA: { claim: 'AI will significantly reduce demand for entry-level developers.', sourceRef: 4 },
        sourceB: { claim: 'AI tools are augmenting developers, increasing productivity rather than replacing jobs.', sourceRef: 8 },
        explanation: 'The sources examine different time horizons and different segments of the developer workforce.',
      },
    ],
    methodology: [
      'Created a research plan by decomposing the question into focused research tasks.',
      'Generated multiple search queries targeting web, news, scholarly, and company sources.',
      'Searched live web sources using the SerpApi integration.',
      'Collected and parsed content from all identified sources.',
      'Removed duplicate sources and filtered low-quality results.',
      'Indexed relevant content into a vector knowledge base using Pinecone.',
      'Retrieved relevant evidence using RAG (Retrieval-Augmented Generation).',
      'Compared claims across multiple sources to identify agreements and conflicts.',
      'Generated the final citation-backed report with structured findings.',
    ].join(' '),
    limitations: [
      'Some websites could not be accessed due to paywalls or access restrictions.',
      'Publication dates were unavailable for some sources.',
      'Some evidence was based on secondary reporting rather than primary research.',
      'The research reflects information available at the time of the search and may not include very recent developments.',
    ],
    sources: sources.slice(0, sourceCount).map((s, i) => ({
      index: i + 1,
      title: s.title,
      domain: s.domain,
      url: s.url,
      publishedAt: s.publishedAt,
    })),
  };
}

const sseEventMap: Array<{ type: string; delay: number; update: (s: ResearchSession) => void }> = [
  { type: 'research.created', delay: 500, update: (s) => { s.status = 'planning'; s.currentStep = 'Understanding question'; s.progress = 5; } },
  { type: 'research.planning', delay: 1500, update: (s) => { s.status = 'planning'; s.currentStep = 'Creating research plan'; s.progress = 10; } },
  { type: 'research.plan_created', delay: 2000, update: (s) => { s.status = 'researching'; s.currentStep = 'Planning complete'; s.progress = 15; } },
  { type: 'research.search_started', delay: 1000, update: (s) => { s.status = 'researching'; s.currentStep = 'Searching live web'; s.progress = 25; } },
  { type: 'research.search_completed', delay: 3000, update: (s) => { s.status = 'researching'; s.currentStep = 'Search complete'; s.progress = 40; s.sourcesFound = 27; } },
  { type: 'research.sources_collected', delay: 1500, update: (s) => { s.status = 'researching'; s.currentStep = 'Collecting sources'; s.progress = 48; s.sourcesFound = 27; } },
  { type: 'research.deduplication_completed', delay: 2000, update: (s) => { s.status = 'researching'; s.currentStep = 'Removing duplicates'; s.progress = 52; s.sourcesAnalyzed = 24; } },
  { type: 'research.processing_started', delay: 1500, update: (s) => { s.status = 'analyzing'; s.currentStep = 'Processing documents'; s.progress = 58; } },
  { type: 'research.indexing_started', delay: 2000, update: (s) => { s.status = 'analyzing'; s.currentStep = 'Building knowledge base'; s.progress = 65; } },
  { type: 'research.rag_completed', delay: 2500, update: (s) => { s.status = 'analyzing'; s.currentStep = 'Retrieving evidence'; s.progress = 72; s.relevantSources = 18; } },
  { type: 'research.analysis_started', delay: 1500, update: (s) => { s.status = 'analyzing'; s.currentStep = 'Analyzing evidence'; s.progress = 78; } },
  { type: 'research.comparison_completed', delay: 2000, update: (s) => { s.status = 'analyzing'; s.currentStep = 'Comparing sources'; s.progress = 85; s.conflictingClaims = 3; } },
  { type: 'research.report_started', delay: 1000, update: (s) => { s.status = 'analyzing'; s.currentStep = 'Generating report'; s.progress = 90; } },
  { type: 'research.completed', delay: 3000, update: (s) => { s.status = 'completed'; s.currentStep = 'Research complete'; s.progress = 100; s.completedAt = new Date().toISOString(); } },
];

const agentActivities: Array<{ agent: AgentActivity['agent']; label: string; detail: (s: ResearchSession) => string; eventIndex: number }> = [
  { agent: 'planner', label: 'Planner Agent', detail: () => 'Created 6 research tasks', eventIndex: 2 },
  { agent: 'research', label: 'Research Agent', detail: () => 'Executed 8 searches', eventIndex: 4 },
  { agent: 'collector', label: 'Source Collector', detail: (s) => `Collected ${s.sourcesFound} sources`, eventIndex: 5 },
  { agent: 'rag', label: 'RAG Engine', detail: () => 'Indexed 94 document chunks', eventIndex: 8 },
  { agent: 'evidence', label: 'Evidence Analyzer', detail: () => 'Extracted 21 claims', eventIndex: 9 },
  { agent: 'comparison', label: 'Comparison Agent', detail: (s) => `Found ${s.conflictingClaims} conflicts`, eventIndex: 11 },
  { agent: 'report', label: 'Report Generator', detail: () => 'Generated final report', eventIndex: 13 },
];

function startMockResearch(session: ResearchSession) {
  const plan = genPlan(session.question);
  const sources = genSources(27);
  mockPlans.set(session.id, plan);
  mockSources.set(session.id, sources);
  mockReports.set(session.id, genReport(session.question, sources));
  mockActivities.set(session.id, []);

  let cumulativeDelay = 0;
  sseEventMap.forEach((evt) => {
    cumulativeDelay += evt.delay;
    setTimeout(() => {
      const s = mockSessions.get(session.id);
      if (!s) return;
      evt.update(s);
      mockSessions.set(session.id, { ...s });

      const activity = agentActivities.find((a) => a.eventIndex === sseEventMap.indexOf(evt));
      if (activity) {
        const acts = mockActivities.get(session.id) ?? [];
        acts.push({
          id: uid(),
          agent: activity.agent,
          label: activity.label,
          detail: activity.detail(s),
          timestamp: new Date().toISOString(),
          status: 'completed',
        });
        mockActivities.set(session.id, acts);

        const p = mockPlans.get(session.id);
        if (p) {
          const taskIdx = acts.length - 1;
          if (taskIdx < p.tasks.length) {
            p.tasks[taskIdx].status = 'completed';
            p.tasks[taskIdx].sourcesFound = Math.floor(Math.random() * 6) + 2;
            if (taskIdx + 1 < p.tasks.length) {
              p.tasks[taskIdx + 1].status = 'in_progress';
            }
          }
        }
      }
    }, cumulativeDelay);
  });
}

export const mockApi = {
  isEnabled: USE_MOCK,

  async createResearch(question: string, mode: ResearchMode): Promise<{ researchId: string; status: string }> {
    const session = genSession(question, mode);
    mockSessions.set(session.id, session);
    startMockResearch(session);
    await delay(300);
    return { researchId: session.id, status: 'queued' };
  },

  async getResearch(id: string): Promise<ResearchSession> {
    await delay(200);
    const s = mockSessions.get(id);
    if (!s) throw new Error('Research session not found');
    return { ...s };
  },

  async getResearchPlan(id: string): Promise<ResearchPlan> {
    await delay(300);
    const p = mockPlans.get(id);
    if (!p) throw new Error('Research plan not found');
    return { ...p, tasks: p.tasks.map((t) => ({ ...t })) };
  },

  async getResearchSources(id: string): Promise<Source[]> {
    await delay(300);
    const s = mockSources.get(id);
    if (!s) return [];
    return s.map((src) => ({ ...src }));
  },

  async getResearchReport(id: string): Promise<Report> {
    await delay(400);
    const r = mockReports.get(id);
    if (!r) throw new Error('Report not found');
    return { ...r };
  },

  async getResearchHistory(page = 1, limit = 12): Promise<PaginatedResponse<ResearchSession>> {
    await delay(200);
    const all = Array.from(mockSessions.values()).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    const start = (page - 1) * limit;
    return {
      data: all.slice(start, start + limit),
      total: all.length,
      page,
      limit,
      totalPages: Math.ceil(all.length / limit) || 1,
    };
  },

  async deleteResearch(id: string): Promise<void> {
    await delay(200);
    mockSessions.delete(id);
    mockPlans.delete(id);
    mockSources.delete(id);
    mockReports.delete(id);
    mockActivities.delete(id);
  },

  getMockActivities(id: string): AgentActivity[] {
    return mockActivities.get(id) ?? [];
  },

  connectMockStream(
    id: string,
    onEvent: (event: SSEEvent) => void,
    onError: () => void,
    onClose: () => void,
  ): { close: () => void } {
    let closed = false;
    const interval = setInterval(() => {
      if (closed) return;
      const s = mockSessions.get(id);
      if (!s) {
        onError();
        clearInterval(interval);
        return;
      }
      onEvent({
        type: 'status_update',
        data: { status: s.status, progress: s.progress, currentStep: s.currentStep } as unknown as Record<string, unknown>,
        timestamp: new Date().toISOString(),
      });
      if (s.status === 'completed' || s.status === 'failed') {
        onEvent({
          type: s.status === 'completed' ? 'research.completed' : 'research.failed',
          data: { researchId: id } as unknown as Record<string, unknown>,
          timestamp: new Date().toISOString(),
        });
        clearInterval(interval);
        onClose();
      }
    }, 800);

    return {
      close: () => {
        closed = true;
        clearInterval(interval);
      },
    };
  },
};
