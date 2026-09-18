"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.HealthModule = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const research_session_schema_1 = require("../research/schemas/research-session.schema");
const health_controller_1 = require("./health.controller");
const health_service_1 = require("./health.service");
const serpapi_module_1 = require("../serpapi/serpapi.module");
const rag_module_1 = require("../rag/rag.module");
const queue_module_1 = require("../queue/queue.module");
const research_queue_module_1 = require("../queue/research-queue.module");
let HealthModule = class HealthModule {
};
exports.HealthModule = HealthModule;
exports.HealthModule = HealthModule = __decorate([
    (0, common_1.Module)({
        imports: [
            mongoose_1.MongooseModule.forFeature([{ name: 'ResearchSession', schema: research_session_schema_1.ResearchSessionSchema }]),
            serpapi_module_1.SerpApiModule,
            rag_module_1.RagModule,
            queue_module_1.QueueModule,
            research_queue_module_1.ResearchQueueModule
        ],
        controllers: [health_controller_1.HealthController],
        providers: [health_service_1.HealthService],
        exports: [health_service_1.HealthService],
    })
], HealthModule);
//# sourceMappingURL=health.module.js.map