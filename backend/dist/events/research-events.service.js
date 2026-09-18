"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var ResearchEventsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResearchEventsService = void 0;
const common_1 = require("@nestjs/common");
let ResearchEventsService = ResearchEventsService_1 = class ResearchEventsService {
    constructor() {
        this.logger = new common_1.Logger(ResearchEventsService_1.name);
        this.subscribers = new Map();
        this.recentEvents = new Map();
        this.maxRecentEvents = 100;
    }
    publish(researchId, event, progress, message, data) {
        const progressEvent = {
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
                }
                catch (err) {
                    this.logger.error(`[Event] Subscriber callback error: ${err}`);
                }
            });
        }
    }
    subscribe(researchId, callback) {
        if (!this.subscribers.has(researchId)) {
            this.subscribers.set(researchId, new Set());
        }
        this.subscribers.get(researchId).add(callback);
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
    getRecentEvents(researchId) {
        return this.recentEvents.get(researchId) || [];
    }
    clearEvents(researchId) {
        this.recentEvents.delete(researchId);
        this.subscribers.delete(researchId);
    }
};
exports.ResearchEventsService = ResearchEventsService;
exports.ResearchEventsService = ResearchEventsService = ResearchEventsService_1 = __decorate([
    (0, common_1.Injectable)()
], ResearchEventsService);
//# sourceMappingURL=research-events.service.js.map