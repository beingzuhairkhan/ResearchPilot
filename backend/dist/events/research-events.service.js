"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var ResearchEventsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResearchEventsService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const ioredis_1 = __importDefault(require("ioredis"));
let ResearchEventsService = ResearchEventsService_1 = class ResearchEventsService {
    constructor(configService) {
        this.configService = configService;
        this.logger = new common_1.Logger(ResearchEventsService_1.name);
        this.publisher = null;
        this.subscriber = null;
        this.subscribers = new Map();
        this.recentEvents = new Map();
        this.seqCounters = new Map();
        this.maxRecentEvents = 100;
        this.channelPrefix = 'research:events:';
        this.redisUrl =
            this.configService.get('redis.url', 'redis://localhost:6379');
    }
    async onModuleInit() {
        try {
            this.publisher = new ioredis_1.default(this.redisUrl, {
                maxRetriesPerRequest: null,
                enableReadyCheck: false,
            });
            this.subscriber = new ioredis_1.default(this.redisUrl, {
                maxRetriesPerRequest: null,
                enableReadyCheck: false,
            });
            this.subscriber.on('error', (error) => {
                this.logger.error(`[Redis Subscriber] ${error.message}`);
            });
            this.publisher.on('error', (error) => {
                this.logger.error(`[Redis Publisher] ${error.message}`);
            });
            await this.subscriber.psubscribe(`${this.channelPrefix}*`);
            this.subscriber.on('pmessage', (pattern, channel, message) => {
                void this.handleRedisMessage(pattern, channel, message);
            });
            this.logger.log('[Redis] Research event Pub/Sub initialized');
        }
        catch (error) {
            const message = error instanceof Error
                ? error.message
                : 'Unknown error';
            this.logger.error(`[Redis] Failed to initialize Pub/Sub: ${message}`);
        }
    }
    async publish(researchId, event, progress, message) {
        if (!this.publisher) {
            this.logger.error('[Redis] Publisher is not initialized');
            return;
        }
        const seq = (this.seqCounters.get(researchId) ?? 0) + 1;
        this.seqCounters.set(researchId, seq);
        const progressEvent = {
            id: `${researchId}-${seq}`,
            seq,
            researchId,
            event,
            progress,
            message,
            timestamp: new Date(),
        };
        const channel = `${this.channelPrefix}${researchId}`;
        try {
            await this.publisher.publish(channel, JSON.stringify(progressEvent));
            this.logger.debug(`[Redis] Published ${event} researchId=${researchId}`);
        }
        catch (error) {
            this.logger.error(`[Redis] Failed to publish event: ${event}`, error);
        }
    }
    async handleRedisMessage(_pattern, channel, rawMessage) {
        try {
            const event = JSON.parse(rawMessage);
            const researchId = event.researchId;
            const recent = this.recentEvents.get(researchId) ?? [];
            if (recent.some((item) => item.id === event.id)) {
                return;
            }
            recent.push(event);
            if (recent.length >
                this.maxRecentEvents) {
                recent.shift();
            }
            this.recentEvents.set(researchId, recent);
            const callbacks = this.subscribers.get(researchId);
            if (!callbacks) {
                return;
            }
            callbacks.forEach((callback) => {
                try {
                    callback(event);
                }
                catch (error) {
                    this.logger.error(`[SSE] Subscriber callback failed for ${researchId}`, error);
                }
            });
            this.logger.debug(`[Redis] Delivered ${event.event} from ${channel}`);
        }
        catch (error) {
            this.logger.error('[Redis] Failed to process Pub/Sub message', error);
        }
    }
    subscribe(researchId, callback) {
        let callbacks = this.subscribers.get(researchId);
        if (!callbacks) {
            callbacks = new Set();
            this.subscribers.set(researchId, callbacks);
        }
        callbacks.add(callback);
        this.logger.debug(`[SSE] Client subscribed researchId=${researchId}`);
        return () => {
            const current = this.subscribers.get(researchId);
            if (!current) {
                return;
            }
            current.delete(callback);
            if (current.size === 0) {
                this.subscribers.delete(researchId);
            }
            this.logger.debug(`[SSE] Client unsubscribed researchId=${researchId}`);
        };
    }
    getRecentEvents(researchId) {
        return [
            ...(this.recentEvents.get(researchId) ?? []),
        ];
    }
    getEventsSince(researchId, lastEventId) {
        const recent = this.recentEvents.get(researchId) ?? [];
        const index = recent.findIndex((event) => event.id === lastEventId);
        if (index === -1) {
            return [...recent];
        }
        return recent.slice(index + 1);
    }
    clearEvents(researchId) {
        this.recentEvents.delete(researchId);
        this.subscribers.delete(researchId);
        this.seqCounters.delete(researchId);
    }
    async onModuleDestroy() {
        try {
            if (this.subscriber) {
                await this.subscriber.punsubscribe(`${this.channelPrefix}*`);
                await this.subscriber.quit();
                this.subscriber = null;
            }
            if (this.publisher) {
                await this.publisher.quit();
                this.publisher = null;
            }
            this.logger.log('[Redis] Research event Pub/Sub connections closed');
        }
        catch (error) {
            this.logger.error('[Redis] Error closing Pub/Sub connections', error);
        }
    }
};
exports.ResearchEventsService = ResearchEventsService;
exports.ResearchEventsService = ResearchEventsService = ResearchEventsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], ResearchEventsService);
//# sourceMappingURL=research-events.service.js.map