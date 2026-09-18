import { ResearchProgressEvent } from '../common/interfaces/research.interface';
type EventCallback = (event: ResearchProgressEvent) => void;
export declare class ResearchEventsService {
    private readonly logger;
    private readonly subscribers;
    private readonly recentEvents;
    private readonly maxRecentEvents;
    publish(researchId: string, event: string, progress: number, message: string, data?: Record<string, unknown>): void;
    subscribe(researchId: string, callback: EventCallback): () => void;
    getRecentEvents(researchId: string): ResearchProgressEvent[];
    clearEvents(researchId: string): void;
}
export {};
