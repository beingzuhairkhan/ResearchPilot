import { useCallback, useEffect, useRef, useState } from 'react';

import {
  connectToResearchStream,
  type StreamConnection,
} from '@/services/eventStream';

import type {
  SSEEvent,
  AgentActivity,
  TimelineStep,
} from '@/types/research';

type AgentKey = AgentActivity['agent'];

const defaultTimeline: TimelineStep[] = [
  { id: 'understanding', label: 'Understanding question', status: 'pending' },
  { id: 'planning', label: 'Creating research plan', status: 'pending' },
  { id: 'searching', label: 'Searching live web', status: 'pending' },
  { id: 'collecting', label: 'Collecting sources', status: 'pending' },
  { id: 'deduplication', label: 'Removing duplicates', status: 'pending' },
  { id: 'processing', label: 'Processing documents', status: 'pending' },
  { id: 'indexing', label: 'Building knowledge base', status: 'pending' },
  { id: 'rag', label: 'Retrieving evidence', status: 'pending' },
  { id: 'analysis', label: 'Analyzing evidence', status: 'pending' },
  { id: 'comparison', label: 'Comparing sources', status: 'pending' },
  { id: 'report', label: 'Generating final report', status: 'pending' },
];

// event -> timeline step index
const eventToTimelineMap: Record<string, number> = {
  'research.created': 0,
  'research.planning': 1,
  'research.plan_created': 1,
  'research.search_started': 2,
  'research.search_completed': 2,
  'research.sources_collected': 3,
  'research.deduplication_completed': 4,
  'research.processing_started': 5,
  'research.processing_completed': 5,
  'research.indexing_started': 6,
  'research.indexing_completed': 6,
  'research.rag_completed': 7,
  'research.analysis_started': 8,
  'research.analysis_completed': 8,
  'research.comparison_completed': 9,
  'research.report_started': 10,
  'research.report_completed': 10,
};

// event -> agent card
const eventToAgentMap: Record<
  string,
  { agent: AgentKey; label: string; detail: string }
> = {
  'research.planning': {
    agent: 'planner',
    label: 'Planner Agent',
    detail: 'Creating research plan',
  },
  'research.plan_created': {
    agent: 'planner',
    label: 'Planner Agent',
    detail: 'Research plan created',
  },

  'research.search_started': {
    agent: 'research',
    label: 'Research Agent',
    detail: 'Searching the live web',
  },
  'research.search_completed': {
    agent: 'research',
    label: 'Research Agent',
    detail: 'Completed web search',
  },

  'research.sources_collected': {
    agent: 'collector',
    label: 'Source Collector',
    detail: 'Collected research sources',
  },
  'research.deduplication_completed': {
    agent: 'collector',
    label: 'Source Collector',
    detail: 'Removed duplicate sources',
  },
  'research.processing_started': {
    agent: 'collector',
    label: 'Source Collector',
    detail: 'Processing research documents',
  },
  'research.processing_completed': {
    agent: 'collector',
    label: 'Source Collector',
    detail: 'Document processing completed',
  },

  'research.indexing_started': {
    agent: 'rag',
    label: 'RAG Engine',
    detail: 'Building knowledge base',
  },
  'research.indexing_completed': {
    agent: 'rag',
    label: 'RAG Engine',
    detail: 'Knowledge base ready',
  },
  'research.rag_completed': {
    agent: 'rag',
    label: 'RAG Engine',
    detail: 'Retrieved relevant evidence',
  },

  'research.analysis_started': {
    agent: 'evidence',
    label: 'Evidence Analyzer',
    detail: 'Analyzing evidence',
  },
  'research.analysis_completed': {
    agent: 'evidence',
    label: 'Evidence Analyzer',
    detail: 'Evidence analysis completed',
  },

  'research.comparison_completed': {
    agent: 'comparison',
    label: 'Comparison Agent',
    detail: 'Compared evidence across sources',
  },

  'research.report_started': {
    agent: 'report',
    label: 'Report Generator',
    detail: 'Generating final report',
  },
  'research.report_completed': {
    agent: 'report',
    label: 'Report Generator',
    detail: 'Final report generated',
  },
};

const progressMap: Record<string, number> = {
  'research.created': 5,
  'research.planning': 10,
  'research.plan_created': 15,
  'research.search_started': 25,
  'research.search_completed': 40,
  'research.sources_collected': 48,
  'research.deduplication_completed': 52,
  'research.processing_started': 58,
  'research.processing_completed': 62,
  'research.indexing_started': 65,
  'research.indexing_completed': 68,
  'research.rag_completed': 72,
  'research.analysis_started': 78,
  'research.analysis_completed': 80,
  'research.comparison_completed': 85,
  'research.report_started': 90,
  'research.report_completed': 95,
};

// Events that mark a card / step as completed (green)
const completedEvents = new Set([
  'research.plan_created',
  'research.search_completed',
  'research.sources_collected',
  'research.deduplication_completed',
  'research.processing_completed',
  'research.indexing_completed',
  'research.rag_completed',
  'research.analysis_completed',
  'research.comparison_completed',
  'research.report_completed',
]);

// Used when the run finishes: any agent whose event was missed
// (for example plan_created lost to a Redis race) is filled in as completed.
const allAgents: { agent: AgentKey; label: string; detail: string }[] = [
  { agent: 'planner', label: 'Planner Agent', detail: 'Research plan created' },
  { agent: 'research', label: 'Research Agent', detail: 'Completed web search' },
  { agent: 'collector', label: 'Source Collector', detail: 'Sources collected' },
  { agent: 'rag', label: 'RAG Engine', detail: 'Retrieved relevant evidence' },
  { agent: 'evidence', label: 'Evidence Analyzer', detail: 'Evidence analysis completed' },
  { agent: 'comparison', label: 'Comparison Agent', detail: 'Compared evidence across sources' },
  { agent: 'report', label: 'Report Generator', detail: 'Final report generated' },
];

function createTimeline(): TimelineStep[] {
  return defaultTimeline.map((step) => ({ ...step }));
}

function uid() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function useResearchStream(researchId: string | undefined) {
  const [events, setEvents] = useState<SSEEvent[]>([]);
  const [timeline, setTimeline] = useState<TimelineStep[]>(createTimeline());
  const [activities, setActivities] = useState<AgentActivity[]>([]);
  const [completed, setCompleted] = useState(false);
  const [failed, setFailed] = useState(false);
  const [connected, setConnected] = useState(false);
  const [progress, setProgress] = useState(0);

  const connectionRef = useRef<StreamConnection | null>(null);

  const handleEvent = useCallback((event: SSEEvent) => {
    console.log('[ResearchStream]', event.type, event.data);

    setEvents((previous) => [...previous, event]);

    // ---------- Whole run finished ----------
    if (event.type === 'research.completed') {
      setCompleted(true);
      setProgress(100);

      setTimeline((previous) =>
        previous.map((step) => ({ ...step, status: 'completed' })),
      );

      // Mark every agent completed, including ones whose event never arrived
      setActivities((previous) => {
        const next = [...previous].map((item) => ({
          ...item,
          status: 'completed' as const,
        }));

        for (const agent of allAgents) {
          if (!next.some((item) => item.agent === agent.agent)) {
            next.push({
              id: uid(),
              agent: agent.agent,
              label: agent.label,
              detail: agent.detail,
              timestamp: event.timestamp,
              status: 'completed',
            });
          }
        }

        return next;
      });

      return;
    }

    // ---------- Run failed ----------
    if (event.type === 'research.failed') {
      setFailed(true);
      return;
    }

    // ---------- Timeline ----------
    const index = eventToTimelineMap[event.type];

    if (index !== undefined) {
      setTimeline((previous) => {
        const next = previous.map((step) => ({ ...step }));

        for (let i = 0; i < index; i++) {
          next[i].status = 'completed';
        }

        next[index].status = completedEvents.has(event.type)
          ? 'completed'
          : 'active';

        return next;
      });
    }

    // ---------- Agent card ----------
    const agent = eventToAgentMap[event.type];

    if (agent) {
      const data = event.data as {
        detail?: string;
        message?: string;
        sourcesFound?: number;
      };

      let detail = data.detail || data.message || agent.detail;

      if (agent.agent === 'collector' && typeof data.sourcesFound === 'number') {
        detail = `Collected ${data.sourcesFound} sources`;
      }

      const status: AgentActivity['status'] = completedEvents.has(event.type)
        ? 'completed'
        : 'active';

      setActivities((previous) => {
        const existing = previous.findIndex(
          (item) => item.agent === agent.agent,
        );

        const activity: AgentActivity = {
          id: existing >= 0 ? previous[existing].id : uid(),
          agent: agent.agent,
          label: agent.label,
          detail,
          timestamp: event.timestamp,
          status,
        };

        if (existing >= 0) {
          const next = [...previous];
          next[existing] = activity;
          return next;
        }

        return [...previous, activity];
      });
    }

    // ---------- Progress ----------
    const nextProgress = progressMap[event.type];

    if (typeof nextProgress === 'number') {
      setProgress(nextProgress);
    }
  }, []);

  useEffect(() => {
    if (!researchId) {
      return;
    }

    setEvents([]);
    setTimeline(createTimeline());
    setActivities([]);
    setCompleted(false);
    setFailed(false);
    setConnected(false);
    setProgress(0);


    const connection = connectToResearchStream(researchId, {
      onEvent: handleEvent,

      onError: (error) => {
        console.error('[ResearchStream] error:', error);
        setConnected(false);
      },

      onClose: () => {
        console.log('[ResearchStream] closed');
        setConnected(false);
      },
    });

    connectionRef.current = connection;

    setConnected(true);

    return () => {
      connection.close();
      connectionRef.current = null;
    };
  }, [researchId, handleEvent]);

  return {
    events,
    timeline,
    activities,
    completed,
    failed,
    connected,
    progress,
  };
}