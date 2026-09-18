"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const core_1 = require("@nestjs/core");
const throttler_1 = require("@nestjs/throttler");
const core_2 = require("@nestjs/core");
const configuration_1 = __importDefault(require("./config/configuration"));
const database_module_1 = require("./database/database.module");
const research_module_1 = require("./research/research.module");
const serpapi_module_1 = require("./serpapi/serpapi.module");
const agents_module_1 = require("./agents/agents.module");
const sources_module_1 = require("./sources/sources.module");
const rag_module_1 = require("./rag/rag.module");
const llm_module_1 = require("./llm/llm.module");
const queue_module_1 = require("./queue/queue.module");
const reports_module_1 = require("./reports/reports.module");
const events_module_1 = require("./events/events.module");
const health_module_1 = require("./health/health.module");
const all_exceptions_filter_1 = require("./common/exceptions/all-exceptions.filter");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({
                isGlobal: true,
                load: [configuration_1.default],
            }),
            throttler_1.ThrottlerModule.forRoot([
                { ttl: 60000, limit: 30 },
            ]),
            database_module_1.DatabaseModule,
            research_module_1.ResearchModule,
            serpapi_module_1.SerpApiModule,
            agents_module_1.AgentsModule,
            sources_module_1.SourcesModule,
            rag_module_1.RagModule,
            llm_module_1.LlmModule,
            queue_module_1.QueueModule,
            reports_module_1.ReportsModule,
            events_module_1.EventsModule,
            health_module_1.HealthModule,
        ],
        providers: [
            {
                provide: core_1.APP_FILTER,
                useClass: all_exceptions_filter_1.AllExceptionsFilter,
            },
            {
                provide: core_2.APP_GUARD,
                useClass: throttler_1.ThrottlerGuard,
            },
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map