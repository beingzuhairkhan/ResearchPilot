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
    console.log('[SSE] MOCK MODE ENABLED');

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
    console.group(`[SSE] EVENT: ${eventName}`);

    console.log('Event name:', eventName);
    console.log('Raw event:', event);
    console.log('Raw event.data:', event.data);
    console.log(
      'Raw event.data type:',
      typeof event.data,
    );

    let parsed: any;

    try {
      parsed = JSON.parse(event.data);

      console.log(
        'Parsed JSON:',
        parsed,
      );

      console.log(
        'Parsed JSON pretty:',
        JSON.stringify(
          parsed,
          null,
          2,
        ),
      );
    } catch (error) {
      console.error(
        'JSON parse failed:',
        error,
      );

      console.log(
        'Using raw data:',
        event.data,
      );

      parsed = {
        raw: event.data,
      };
    }

    console.log(
      'Complete backend payload:',
      parsed,
    );

    const type =
      parsed?.event ||
      parsed?.type ||
      eventName;

    const data =
      parsed?.data !== undefined
        ? parsed.data
        : parsed;

    console.log(
      'Resolved type:',
      type,
    );

    console.log(
      'Resolved data:',
      data,
    );

    console.log(
      'Resolved data pretty:',
      JSON.stringify(
        data,
        null,
        2,
      ),
    );

    console.groupEnd();

    handlers.onEvent({
      type,
      data,
      timestamp:
        parsed?.timestamp ||
        new Date().toISOString(),
    });
  };

  const connect = () => {
    if (closed) {
      return;
    }

    console.log(
      '====================================',
    );

    console.log(
      '[SSE] CONNECTING',
    );

    console.log(
      '[SSE] URL:',
      url,
    );

    console.log(
      '[SSE] Research ID:',
      researchId,
    );

    console.log(
      '====================================',
    );

    eventSource =
      new EventSource(url);

    eventSource.onopen = () => {
      console.log(
        '[SSE] CONNECTION OPENED',
      );

      console.log(
        '[SSE] readyState:',
        eventSource?.readyState,
      );

      reconnectAttempts = 0;
    };

    eventSource.onmessage = (
      event,
    ) => {
      console.log(
        '[SSE] DEFAULT MESSAGE EVENT',
      );

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
      console.group(
        '[SSE] CONNECTION ERROR',
      );

      console.error(
        'Error object:',
        error,
      );

      console.log(
        'readyState:',
        eventSource?.readyState,
      );

      console.log(
        'URL:',
        eventSource?.url,
      );

      console.groupEnd();

      handlers.onError(error);

      if (closed) {
        return;
      }

      eventSource?.close();
      eventSource = null;

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
          `[SSE] RECONNECTING IN ${delay}ms`,
        );

        reconnectTimer =
          setTimeout(
            connect,
            delay,
          );
      } else {
        console.error(
          '[SSE] MAX RECONNECT ATTEMPTS REACHED',
        );

        handlers.onClose();
      }
    };
  };

  connect();

  return {
    close: () => {
      console.log(
        '[SSE] MANUAL CLOSE',
      );

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

      handlers.onClose();
    },
  };
}