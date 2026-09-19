import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import IORedis from 'ioredis';

import { ResearchProgressEvent } from '../common/interfaces/research.interface';

export type ResearchProgressEventWithId =
  ResearchProgressEvent & {
    id: string;
  };

type EventCallback = (
  event: ResearchProgressEventWithId,
) => void;

@Injectable()
export class ResearchEventsService
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(
    ResearchEventsService.name,
  );

  private readonly redisUrl: string;

  /**
   * Redis publisher.
   *
   * Used by the worker/process that calls publish().
   */
  private publisher: IORedis | null = null;

  /**
   * Redis subscriber.
   *
   * Used by API instances to receive events from Redis.
   */
  private subscriber: IORedis | null = null;

  /**
   * Local SSE subscribers.
   *
   * researchId -> connected browser callbacks
   */
  private readonly subscribers = new Map<
    string,
    Set<EventCallback>
  >();

  /**
   * Recent events kept locally for reconnect/replay.
   */
  private readonly recentEvents = new Map<
    string,
    ResearchProgressEventWithId[]
  >();

  /**
   * Sequence counters.
   *
   * IMPORTANT:
   * With multiple workers/API instances, these counters are
   * process-local. Redis should ideally be used for sequence
   * generation too if strict global ordering is required.
   */
  private readonly seqCounters = new Map<
    string,
    number
  >();

  private readonly maxRecentEvents = 100;

  private readonly channelPrefix =
    'research:events:';

  constructor(
    private readonly configService: ConfigService,
  ) {
    this.redisUrl =
      this.configService.get<string>(
        'redis.url',
        'redis://localhost:6379',
      );
  }

  async onModuleInit(): Promise<void> {
    try {
      this.publisher = new IORedis(
        this.redisUrl,
        {
          maxRetriesPerRequest: null,
          enableReadyCheck: false,
        },
      );

      this.subscriber = new IORedis(
        this.redisUrl,
        {
          maxRetriesPerRequest: null,
          enableReadyCheck: false,
        },
      );

      this.subscriber.on(
        'error',
        (error) => {
          this.logger.error(
            `[Redis Subscriber] ${error.message}`,
          );
        },
      );

      this.publisher.on(
        'error',
        (error) => {
          this.logger.error(
            `[Redis Publisher] ${error.message}`,
          );
        },
      );

      /**
       * Subscribe to all research event channels.
       *
       * Example:
       *
       * research:events:abc123
       * research:events:xyz789
       */
      await this.subscriber.psubscribe(
        `${this.channelPrefix}*`,
      );

      this.subscriber.on(
        'pmessage',
        (
          pattern,
          channel,
          message,
        ) => {
          void this.handleRedisMessage(
            pattern,
            channel,
            message,
          );
        },
      );

      this.logger.log(
        '[Redis] Research event Pub/Sub initialized',
      );
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Unknown error';

      this.logger.error(
        `[Redis] Failed to initialize Pub/Sub: ${message}`,
      );
    }
  }


  
  async publish(
    researchId: string,
    event: string,
    progress: number,
    message: string,
  ): Promise<void> {
    if (!this.publisher) {
      this.logger.error(
        '[Redis] Publisher is not initialized',
      );
      return;
    }

    const seq =
      (this.seqCounters.get(researchId) ?? 0) + 1;

    this.seqCounters.set(
      researchId,
      seq,
    );

    const progressEvent: ResearchProgressEventWithId =
      {
        id: `${researchId}-${seq}`,
        seq,
        researchId,
        event,
        progress,
        message,
        timestamp: new Date(),
      };

    const channel =
      `${this.channelPrefix}${researchId}`;

    try {
      await this.publisher.publish(
        channel,
        JSON.stringify(progressEvent),
      );

      this.logger.debug(
        `[Redis] Published ${event} researchId=${researchId}`,
      );
    } catch (error) {
      this.logger.error(
        `[Redis] Failed to publish event: ${event}`,
        error,
      );
    }
  }


  private async handleRedisMessage(
    _pattern: string,
    channel: string,
    rawMessage: string,
  ): Promise<void> {
    try {
      const event =
        JSON.parse(
          rawMessage,
        ) as ResearchProgressEventWithId;

      const researchId =
        event.researchId;


      const recent =
        this.recentEvents.get(
          researchId,
        ) ?? [];


      if (
        recent.some(
          (item) =>
            item.id === event.id,
        )
      ) {
        return;
      }

      recent.push(event);

      if (
        recent.length >
        this.maxRecentEvents
      ) {
        recent.shift();
      }

      this.recentEvents.set(
        researchId,
        recent,
      );

      const callbacks =
        this.subscribers.get(
          researchId,
        );

      if (!callbacks) {
        return;
      }

      callbacks.forEach(
        (callback) => {
          try {
            callback(event);
          } catch (error) {
            this.logger.error(
              `[SSE] Subscriber callback failed for ${researchId}`,
              error,
            );
          }
        },
      );

      this.logger.debug(
        `[Redis] Delivered ${event.event} from ${channel}`,
      );
    } catch (error) {
      this.logger.error(
        '[Redis] Failed to process Pub/Sub message',
        error,
      );
    }
  }

  subscribe(
    researchId: string,
    callback: EventCallback,
  ): () => void {
    let callbacks =
      this.subscribers.get(
        researchId,
      );

    if (!callbacks) {
      callbacks = new Set<EventCallback>();

      this.subscribers.set(
        researchId,
        callbacks,
      );
    }

    callbacks.add(callback);

    this.logger.debug(
      `[SSE] Client subscribed researchId=${researchId}`,
    );

 
    return () => {
      const current =
        this.subscribers.get(
          researchId,
        );

      if (!current) {
        return;
      }

      current.delete(callback);

      if (current.size === 0) {
        this.subscribers.delete(
          researchId,
        );
      }

      this.logger.debug(
        `[SSE] Client unsubscribed researchId=${researchId}`,
      );
    };
  }

  getRecentEvents(
    researchId: string,
  ): ResearchProgressEventWithId[] {
    return [
      ...(this.recentEvents.get(
        researchId,
      ) ?? []),
    ];
  }


  getEventsSince(
    researchId: string,
    lastEventId: string,
  ): ResearchProgressEventWithId[] {
    const recent =
      this.recentEvents.get(
        researchId,
      ) ?? [];

    const index =
      recent.findIndex(
        (event) =>
          event.id === lastEventId,
      );


    if (index === -1) {
      return [...recent];
    }

    return recent.slice(index + 1);
  }


  clearEvents(
    researchId: string,
  ): void {
    this.recentEvents.delete(
      researchId,
    );

    this.subscribers.delete(
      researchId,
    );

    this.seqCounters.delete(
      researchId,
    );
  }

  async onModuleDestroy(): Promise<void> {
    try {
      if (this.subscriber) {
        await this.subscriber.punsubscribe(
          `${this.channelPrefix}*`,
        );

        await this.subscriber.quit();
        this.subscriber = null;
      }

      if (this.publisher) {
        await this.publisher.quit();
        this.publisher = null;
      }

      this.logger.log(
        '[Redis] Research event Pub/Sub connections closed',
      );
    } catch (error) {
      this.logger.error(
        '[Redis] Error closing Pub/Sub connections',
        error,
      );
    }
  }
}
