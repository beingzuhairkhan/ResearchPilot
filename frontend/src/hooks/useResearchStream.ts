import { useEffect, useRef, useState, useCallback } from 'react';
import { connectToResearchStream, type StreamConnection } from '@/services/eventStream';
import { researchApi } from '@/services/researchApi';
import { mockApi } from '@/services/mockApi';
import type { SSEEvent, AgentActivity, ResearchSession, TimelineStep } from '@/types/research';

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

const eventToTimelineMap: Record<string, number> = {
  'research.created': 0,
  'research.planning': 1,
  'research.plan_created': 1,
  'research.search_started': 2,
  'research.search_completed': 2,
  'research.sources_collected': 3,
  'research.deduplication_completed': 4,
  'research.processing_started': 5,
  'research.indexing_started': 6,
  'research.rag_completed': 7,
  'research.analysis_started': 8,
  'research.comparison_completed': 9,
  'research.report_started': 10,
};

const eventToAgentMap: Record<string, { agent: AgentActivity['agent']; label: string; detail: string }> = {
  'research.plan_created': { agent: 'planner', label: 'Planner Agent', detail: 'Created research plan with multiple tasks' },
  'research.search_completed': { agent: 'research', label: 'Research Agent', detail: 'Executed web searches across multiple sources' },
  'research.sources_collected': { agent: 'collector', label: 'Source Collector', detail: 'Collected and parsed source documents' },
  'research.rag_completed': { agent: 'rag', label: 'RAG Engine', detail: 'Indexed content and retrieved relevant evidence' },
  'research.analysis_started': { agent: 'evidence', label: 'Evidence Analyzer', detail: 'Extracted and verified claims from sources' },
  'research.comparison_completed': { agent: 'comparison', label: 'Comparison Agent', detail: 'Compared evidence across sources' },
  'research.report_started': { agent: 'report', label: 'Report Generator', detail: 'Generating citation-backed report' },
};

function uid() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

export function useResearchStream(researchId: string | undefined) {
  const [events, setEvents] = useState<SSEEvent[]>([]);
  const [timeline, setTimeline] = useState<TimelineStep[]>(defaultTimeline);
  const [activities, setActivities] = useState<AgentActivity[]>([]);
  const [completed, setCompleted] = useState(false);
  const [failed, setFailed] = useState(false);
  const [connected, setConnected] = useState(false);
  const [progress, setProgress] = useState(0);
  const connectionRef = useRef<StreamConnection | null>(null);
  const currentStepRef = useRef(0);

  const handleEvent = useCallback((event: SSEEvent) => {
    setEvents((prev) => [...prev, event]);

    if (event.type === 'status_update') {
      const data = event.data as { progress?: number; status?: string };
      if (typeof data.progress === 'number') {
        setProgress(data.progress);
      }
      return;
    }

    if (event.type === 'research.completed') {
      setCompleted(true);
      setProgress(100);
      setTimeline((prev) => prev.map((step) => ({ ...step, status: 'completed' as const })));
      return;
    }

    if (event.type === 'research.failed') {
      setFailed(true);
      return;
    }

    const timelineIdx = eventToTimelineMap[event.type];
    if (timelineIdx !== undefined) {
      setTimeline((prev) => {
        const next = [...prev];
        for (let i = 0; i < timelineIdx; i++) {
          if (next[i].status === 'pending') next[i].status = 'completed';
        }
        if (next[timelineIdx]) {
          next[timelineIdx] = { ...next[timelineIdx], status: 'active' };
        }
        return next;
      });

      if (timelineIdx > currentStepRef.current) {
        currentStepRef.current = timelineIdx;
      }

      const agentInfo = eventToAgentMap[event.type];
      if (agentInfo) {
        const data = event.data as { detail?: string; sourcesFound?: number; chunks?: number; claims?: number; conflicts?: number };
        const detail =
          data.detail ||
          (agentInfo.agent === 'collector' && data.sourcesFound ? `Collected ${data.sourcesFound} sources` : agentInfo.detail);
        setActivities((prev) => {
          if (prev.some((a) => a.agent === agentInfo.agent)) return prev;
          return [
            ...prev,
            {
              id: uid(),
              agent: agentInfo.agent,
              label: agentInfo.label,
              detail,
              timestamp: event.timestamp,
              status: 'completed',
            },
          ];
        });
      }
    }

    const progressMap: Record<string, number> = {
      'research.created': 5,
      'research.planning': 10,
      'research.plan_created': 15,
      'research.search_started': 25,
      'research.search_completed': 40,
      'research.sources_collected': 48,
      'research.deduplication_completed': 52,
      'research.processing_started': 58,
      'research.indexing_started': 65,
      'research.rag_completed': 72,
      'research.analysis_started': 78,
      'research.comparison_completed': 85,
      'research.report_started': 90,
    };
    if (progressMap[event.type] !== undefined) {
      setProgress(progressMap[event.type]);
    }
  }, []);

  useEffect(() => {
    if (!researchId) return;

    setEvents([]);
    setTimeline(defaultTimeline);
    setActivities([]);
    setCompleted(false);
    setFailed(false);
    setConnected(false);
    setProgress(0);
    currentStepRef.current = 0;

    if (mockApi.isEnabled) {
      const pollInterval = setInterval(() => {
        const acts = mockApi.getMockActivities(researchId);
        if (acts.length > activities.length) {
          setActivities([...acts]);
        }
      }, 500);
      return () => clearInterval(pollInterval);
    }

    const connection = connectToResearchStream(researchId, {
      onEvent: handleEvent,
      onError: () => setConnected(false),
      onClose: () => setConnected(false),
    });
    connectionRef.current = connection;
    setConnected(true);

    return () => {
      connection.close();
      connectionRef.current = null;
    };
  }, [researchId, handleEvent, activities.length]);

  return { events, timeline, activities, completed, failed, connected, progress };
}
