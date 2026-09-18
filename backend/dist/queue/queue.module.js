"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.QueueModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const research_processor_1 = require("./research.processor");
const research_queue_module_1 = require("./research-queue.module");
const events_module_1 = require("../events/events.module");
const agents_module_1 = require("../agents/agents.module");
const research_module_1 = require("../research/research.module");
const sources_module_1 = require("../sources/sources.module");
const rag_module_1 = require("../rag/rag.module");
const serpapi_module_1 = require("../serpapi/serpapi.module");
const llm_module_1 = require("../llm/llm.module");
const reports_module_1 = require("../reports/reports.module");
let QueueModule = class QueueModule {
};
exports.QueueModule = QueueModule;
exports.QueueModule = QueueModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule,
            research_queue_module_1.ResearchQueueModule,
            events_module_1.EventsModule,
            agents_module_1.AgentsModule,
            research_module_1.ResearchModule,
            sources_module_1.SourcesModule,
            rag_module_1.RagModule,
            serpapi_module_1.SerpApiModule,
            llm_module_1.LlmModule,
            reports_module_1.ReportsModule,
        ],
        providers: [research_processor_1.ResearchProcessorService],
        exports: [research_processor_1.ResearchProcessorService],
    })
], QueueModule);
//# sourceMappingURL=queue.module.js.map