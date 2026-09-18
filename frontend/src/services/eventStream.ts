import { mockApi } from './mockApi';
import { baseURL } from './api';
import type { SSEEvent } from '@/types/research';

const useMock = mockApi.isEnabled;

export interface StreamHandlers {
  onEvent: (event: SSEEvent) => void;
  onError: (error: Event) => void;
  onClose: () => void;
}

export interface StreamConnection {
  close: () => void;
}

const researchEvents = [
  'research.created',
  'research.planning',
  'research.plan_created',
  'research.search_started',
  'research.search_completed',
  'research.sources_collected',
  'research.deduplication_completed',
  'research.processing_started',
  'research.indexing_started',
  'research.rag_completed',
  'research.analysis_started',
  'research.comparison_completed',
  'research.report_started',
  'research.completed',
  'research.failed',
];

export function connectToResearchStream(
  researchId: string,
  handlers: StreamHandlers,
): StreamConnection {
  if (useMock) {
    return mockApi.connectMockStream(
      researchId,
      handlers.onEvent,
      () => handlers.onError(new Event('error')),
      handlers.onClose,
    );
  }

  const url = `${baseURL}/research/${researchId}/stream`;

  let eventSource: EventSource | null = null;
  let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  let closed = false;
  let reconnectAttempts = 0;

  const maxReconnectAttempts = 5;

  const handleEvent = (
    eventName: string,
    event: MessageEvent,
  ) => {
    try {
      const parsed = JSON.parse(event.data);

      const type =
        parsed.event ||
        parsed.type ||
        eventName;

      const data =
        parsed.data !== undefined
          ? parsed.data
          : parsed;

      console.log('[SSE] received:', {
        type,
        data,
      });

      handlers.onEvent({
        type,
        data,
        timestamp:
          parsed.timestamp ||
          new Date().toISOString(),
      });
    } catch (error) {
      console.error(
        '[SSE] parse error:',
        error,
      );

      handlers.onEvent({
        type: eventName,
        data: {
          raw: event.data,
        },
        timestamp: new Date().toISOString(),
      });
    }
  };

  const connect = () => {
    if (closed) return;

    console.log(
      '[SSE] connecting:',
      url,
    );

    eventSource = new EventSource(url);

    eventSource.onopen = () => {
      console.log('[SSE] connected');

      reconnectAttempts = 0;
    };

    eventSource.onmessage = (
      event,
    ) => {
      handleEvent(
        'message',
        event,
      );
    };

    researchEvents.forEach(
      (eventName) => {
        eventSource?.addEventListener(
          eventName,
          (event) => {
            handleEvent(
              eventName,
              event as MessageEvent,
            );
          },
        );
      },
    );

    eventSource.onerror = (
      error,
    ) => {
      console.error(
        '[SSE] error:',
        error,
      );

      handlers.onError(error);

      eventSource?.close();
      eventSource = null;

      if (
        closed
      ) {
        return;
      }

      if (
        reconnectAttempts <
        maxReconnectAttempts
      ) {
        reconnectAttempts++;

        const delay = Math.min(
          1000 *
            2 **
              reconnectAttempts,
          10000,
        );

        console.log(
          `[SSE] reconnecting in ${delay}ms`,
        );

        reconnectTimer =
          setTimeout(
            connect,
            delay,
          );
      } else {
        handlers.onClose();
      }
    };
  };

  connect();

  return {
    close: () => {
      closed = true;

      if (
        reconnectTimer
      ) {
        clearTimeout(
          reconnectTimer,
        );

        reconnectTimer = null;
      }

      eventSource?.close();

      eventSource = null;

      console.log(
        '[SSE] closed',
      );
    },
  };
}