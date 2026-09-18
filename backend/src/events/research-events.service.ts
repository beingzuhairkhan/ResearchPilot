import { Injectable, Logger } from '@nestjs/common';
import { ResearchProgressEvent } from '../common/interfaces/research.interface';

type EventCallback = (event: ResearchProgressEvent) => void;

@Injectable()
export class ResearchEventsService {
  private readonly logger = new Logger(ResearchEventsService.name);
  private readonly subscribers = new Map<string, Set<EventCallback>>();
  private readonly recentEvents = new Map<string, ResearchProgressEvent[]>();
  private readonly maxRecentEvents = 100;

  publish(
    researchId: string,
    event: string,
    progress: number,
    message: string,
    data?: Record<string, unknown>,
  ): void {
    const progressEvent: ResearchProgressEvent = {
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

  clearEvents(researchId: string): void {
    this.recentEvents.delete(researchId);
    this.subscribers.delete(researchId);
  }
}
