import { Injectable, Logger } from '@nestjs/common';
import { ResearchProgressEvent } from '../common/interfaces/research.interface';

type ResearchProgressEventWithId = ResearchProgressEvent & {
  id: string;
};

type EventCallback = (event: ResearchProgressEventWithId) => void;

@Injectable()
export class ResearchEventsService {
  private readonly logger = new Logger(ResearchEventsService.name);
  private readonly subscribers = new Map<string, Set<EventCallback>>();
  private readonly recentEvents = new Map<string, ResearchProgressEventWithId[]>();
  private readonly seqCounters = new Map<string, number>();
  private readonly maxRecentEvents = 100;

  publish(
    researchId: string,
    event: string,
    progress: number,
    message: string,
    data?: Record<string, unknown>,
  ): void {
    const seq = (this.seqCounters.get(researchId) || 0) + 1;
    this.seqCounters.set(researchId, seq);

    const progressEvent: ResearchProgressEvent = {
      id: `${researchId}-${seq}`,
      seq,
      researchId,
      event,
      progress,
      message,
      data,
      timestamp: new Date(),
    };

    this.logger.debug(`[Event] ${event} researchId=${researchId} progress=${progress}%`);

    const recent = this.recentEvents.get(researchId) || [];
    recent.push(progressEvent);
    if (recent.length > this.maxRecentEvents) {
      recent.shift();
    }
    this.recentEvents.set(researchId, recent);

    const subs = this.subscribers.get(researchId);
    if (subs) {
      subs.forEach((cb) => {
        try {
          cb(progressEvent);
        } catch (err) {
          this.logger.error(`[Event] Subscriber callback error: ${err}`);
        }
      });
    }
  }

  subscribe(researchId: string, callback: EventCallback): () => void {
    if (!this.subscribers.has(researchId)) {
      this.subscribers.set(researchId, new Set());
    }
    this.subscribers.get(researchId)!.add(callback);

    return () => {
      const subs = this.subscribers.get(researchId);
      if (subs) {
        subs.delete(callback);
        if (subs.size === 0) {
          this.subscribers.delete(researchId);
        }
      }
    };
  }

  getRecentEvents(researchId: string): ResearchProgressEvent[] {
    return this.recentEvents.get(researchId) || [];
  }

  getEventsSince(researchId: string, lastEventId: string): ResearchProgressEvent[] {
    const recent = this.recentEvents.get(researchId) || [];
    const idx = recent.findIndex((e) => e.id === lastEventId);
    if (idx === -1) {
      return recent;
    }
    return recent.slice(idx + 1);
  }

  clearEvents(researchId: string): void {
    this.recentEvents.delete(researchId);
    this.subscribers.delete(researchId);
    this.seqCounters.delete(researchId);
  }
}