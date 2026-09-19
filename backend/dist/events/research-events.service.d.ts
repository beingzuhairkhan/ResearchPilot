import { OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ResearchProgressEvent } from '../common/interfaces/research.interface';
export type ResearchProgressEventWithId = ResearchProgressEvent & {
    id: string;
};
type EventCallback = (event: ResearchProgressEventWithId) => void;
export declare class ResearchEventsService implements OnModuleInit, OnModuleDestroy {
    private readonly configService;
    private readonly logger;
    private readonly redisUrl;
    private publisher;
    private subscriber;
    private readonly subscribers;
    private readonly recentEvents;
    private readonly seqCounters;
    private readonly maxRecentEvents;
    private readonly channelPrefix;
    constructor(configService: ConfigService);
    onModuleInit(): Promise<void>;
    publish(researchId: string, event: string, progress: number, message: string): Promise<void>;
    private handleRedisMessage;
    subscribe(researchId: string, callback: EventCallback): () => void;
    getRecentEvents(researchId: string): ResearchProgressEventWithId[];
    getEventsSince(researchId: string, lastEventId: string): ResearchProgressEventWithId[];
    clearEvents(researchId: string): void;
    onModuleDestroy(): Promise<void>;
}
export {};
