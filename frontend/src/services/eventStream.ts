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
  const maxReconnect = 5;

  const connect = () => {
    if (closed) return;
    eventSource = new EventSource(url);

    eventSource.onopen = () => {
      reconnectAttempts = 0;
    };

    eventSource.onmessage = (event) => {
      try {
        const parsed = JSON.parse(event.data);
        handlers.onEvent({
          type: parsed.type || parsed.event || 'message',
          data: parsed.data || parsed,
          timestamp: parsed.timestamp || new Date().toISOString(),
        });
      } catch {
        handlers.onEvent({
          type: 'message',
          data: { raw: event.data },
          timestamp: new Date().toISOString(),
        });
      }
    };

    eventSource.onerror = (error) => {
      handlers.onError(error);
      eventSource?.close();
      eventSource = null;

      if (!closed && reconnectAttempts < maxReconnect) {
        reconnectAttempts++;
        const delay = Math.min(1000 * 2 ** reconnectAttempts, 10000);
        reconnectTimer = setTimeout(connect, delay);
      } else {
        handlers.onClose();
      }
    };
  };

  connect();

  return {
    close: () => {
      closed = true;
      if (reconnectTimer) clearTimeout(reconnectTimer);
      eventSource?.close();
      eventSource = null;
    },
  };
}
