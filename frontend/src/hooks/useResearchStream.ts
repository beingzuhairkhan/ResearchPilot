import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';

import {
  connectToResearchStream,
  type StreamConnection,
} from '@/services/eventStream';

import { mockApi } from '@/services/mockApi';

import type {
  SSEEvent,
  AgentActivity,
  TimelineStep,
} from '@/types/research';

const defaultTimeline: TimelineStep[] = [
  {
    id: 'understanding',
    label: 'Understanding question',
    status: 'pending',
  },
  {
    id: 'planning',
    label: 'Creating research plan',
    status: 'pending',
  },
  {
    id: 'searching',
    label: 'Searching live web',
    status: 'pending',
  },
  {
    id: 'collecting',
    label: 'Collecting sources',
    status: 'pending',
  },
  {
    id: 'deduplication',
    label: 'Removing duplicates',
    status: 'pending',
  },
  {
    id: 'processing',
    label: 'Processing documents',
    status: 'pending',
  },
  {
    id: 'indexing',
    label: 'Building knowledge base',
    status: 'pending',
  },
  {
    id: 'rag',
    label: 'Retrieving evidence',
    status: 'pending',
  },
  {
    id: 'analysis',
    label: 'Analyzing evidence',
    status: 'pending',
  },
  {
    id: 'comparison',
    label: 'Comparing sources',
    status: 'pending',
  },
  {
    id: 'report',
    label: 'Generating final report',
    status: 'pending',
  },
];

const eventToTimelineMap: Record<
  string,
  number
> = {
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

const eventToAgentMap: Record<
  string,
  {
    agent: AgentActivity['agent'];
    label: string;
    detail: string;
  }
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
    agent: 'processor',
    label: 'Document Processor',
    detail: 'Processing research documents',
  },

  'research.indexing_started': {
    agent: 'rag',
    label: 'Knowledge Base Agent',
    detail: 'Building knowledge base',
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
};

const progressMap: Record<
  string,
  number
> = {
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

const completedEvents = new Set([
  'research.plan_created',
  'research.search_completed',
  'research.sources_collected',
  'research.deduplication_completed',
  'research.rag_completed',
  'research.comparison_completed',
]);

function createTimeline() {
  return defaultTimeline.map(
    (step) => ({
      ...step,
    }),
  );
}

function uid() {
  return `${Date.now()}-${Math.random()
    .toString(36)
    .slice(2, 8)}`;
}

export function useResearchStream(
  researchId: string | undefined,
) {
  const [events, setEvents] =
    useState<SSEEvent[]>([]);

  const [timeline, setTimeline] =
    useState<TimelineStep[]>(
      createTimeline(),
    );

  const [activities, setActivities] =
    useState<AgentActivity[]>([]);

  const [completed, setCompleted] =
    useState(false);

  const [failed, setFailed] =
    useState(false);

  const [connected, setConnected] =
    useState(false);

  const [progress, setProgress] =
    useState(0);

  const connectionRef =
    useRef<StreamConnection | null>(
      null,
    );

  const handleEvent =
    useCallback(
      (event: SSEEvent) => {
        console.log(
          '[ResearchStream]',
          event.type,
          event.data,
        );

        setEvents(
          (previous) => [
            ...previous,
            event,
          ],
        );

        if (
          event.type ===
          'research.completed'
        ) {
          setCompleted(true);
          setProgress(100);

          setTimeline(
            (previous) =>
              previous.map(
                (step) => ({
                  ...step,
                  status:
                    'completed',
                }),
              ),
          );

          return;
        }

        if (
          event.type ===
          'research.failed'
        ) {
          setFailed(true);
          return;
        }

        const index =
          eventToTimelineMap[
            event.type
          ];

        if (
          index === undefined
        ) {
          return;
        }

        setTimeline(
          (previous) => {
            const next =
              previous.map(
                (step) => ({
                  ...step,
                }),
              );

            for (
              let i = 0;
              i < index;
              i++
            ) {
              next[i].status =
                'completed';
            }

            next[index].status =
              completedEvents.has(
                event.type,
              )
                ? 'completed'
                : 'active';

            return next;
          },
        );

        const agent =
          eventToAgentMap[
            event.type
          ];

        if (agent) {
          const data =
            event.data as {
              detail?: string;
              message?: string;
              sourcesFound?: number;
            };

          let detail =
            data.detail ||
            data.message ||
            agent.detail;

          if (
            agent.agent ===
              'collector' &&
            typeof data.sourcesFound ===
              'number'
          ) {
            detail = `Collected ${data.sourcesFound} sources`;
          }

          setActivities(
            (previous) => {
              const existing =
                previous.findIndex(
                  (item) =>
                    item.agent ===
                    agent.agent,
                );

              const activity: AgentActivity =
                {
                  id:
                    existing >= 0
                      ? previous[
                          existing
                        ].id
                      : uid(),

                  agent:
                    agent.agent,

                  label:
                    agent.label,

                  detail,

                  timestamp:
                    event.timestamp,

                  status:
                    'completed',
                };

              if (
                existing >= 0
              ) {
                const next = [
                  ...previous,
                ];

                next[existing] =
                  activity;

                return next;
              }

              return [
                ...previous,
                activity,
              ];
            },
          );
        }

        const nextProgress =
          progressMap[
            event.type
          ];

        if (
          typeof nextProgress ===
          'number'
        ) {
          setProgress(
            nextProgress,
          );
        }
      },
      [],
    );

  useEffect(() => {
    if (!researchId) {
      return;
    }

    setEvents([]);
    setTimeline(
      createTimeline(),
    );
    setActivities([]);
    setCompleted(false);
    setFailed(false);
    setConnected(false);
    setProgress(0);

    if (mockApi.isEnabled) {
      const interval =
        setInterval(() => {
          const data =
            mockApi.getMockActivities(
              researchId,
            );

          setActivities(data);
        }, 500);

      return () => {
        clearInterval(
          interval,
        );
      };
    }

    const connection =
      connectToResearchStream(
        researchId,
        {
          onEvent:
            handleEvent,

          onError:
            (error) => {
              console.error(
                '[ResearchStream] error:',
                error,
              );

              setConnected(
                false,
              );
            },

          onClose:
            () => {
              console.log(
                '[ResearchStream] closed',
              );

              setConnected(
                false,
              );
            },
        },
      );

    connectionRef.current =
      connection;

    setConnected(true);

    return () => {
      connection.close();

      connectionRef.current =
        null;
    };
  }, [
    researchId,
    handleEvent,
  ]);

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