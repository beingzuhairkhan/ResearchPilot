"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AgentsModule = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const research_session_schema_1 = require("../research/schemas/research-session.schema");
const research_task_schema_1 = require("../research/schemas/research-task.schema");
const source_schema_1 = require("../sources/schemas/source.schema");
const report_schema_1 = require("../reports/schemas/report.schema");
const serpapi_module_1 = require("../serpapi/serpapi.module");
const llm_module_1 = require("../llm/llm.module");
const sources_module_1 = require("../sources/sources.module");
const rag_module_1 = require("../rag/rag.module");
const events_module_1 = require("../events/events.module");
const research_module_1 = require("../research/research.module");
const planner_agent_1 = require("./planner/planner.agent");
const planner_service_1 = require("./planner/planner.service");
const researcher_agent_1 = require("./researcher/researcher.agent");
const researcher_service_1 = require("./researcher/researcher.service");
const analyzer_agent_1 = require("./analyzer/analyzer.agent");
const analyzer_service_1 = require("./analyzer/analyzer.service");
const comparison_agent_1 = require("./comparison/comparison.agent");
const comparison_service_1 = require("./comparison/comparison.service");
const reporter_agent_1 = require("./reporter/reporter.agent");
const reporter_service_1 = require("./reporter/reporter.service");
const research_orchestrator_service_1 = require("./orchestrator/research-orchestrator.service");
let AgentsModule = class AgentsModule {
};
exports.AgentsModule = AgentsModule;
exports.AgentsModule = AgentsModule = __decorate([
    (0, common_1.Module)({
        imports: [
            mongoose_1.MongooseModule.forFeature([
                { name: 'ResearchSession', schema: research_session_schema_1.ResearchSessionSchema },
                { name: 'ResearchTask', schema: research_task_schema_1.ResearchTaskSchema },
                { name: 'Source', schema: source_schema_1.SourceSchema },
                { name: 'Report', schema: report_schema_1.ReportSchema },
            ]),
            serpapi_module_1.SerpApiModule,
            llm_module_1.LlmModule,
            sources_module_1.SourcesModule,
            rag_module_1.RagModule,
            events_module_1.EventsModule,
            (0, common_1.forwardRef)(() => research_module_1.ResearchModule),
        ],
        providers: [
            planner_agent_1.PlannerAgent,
            planner_service_1.PlannerService,
            researcher_agent_1.ResearcherAgent,
            researcher_service_1.ResearcherService,
            analyzer_agent_1.AnalyzerAgent,
            analyzer_service_1.AnalyzerService,
            comparison_agent_1.ComparisonAgent,
            comparison_service_1.ComparisonService,
            reporter_agent_1.ReporterAgent,
            reporter_service_1.ReporterService,
            research_orchestrator_service_1.ResearchOrchestratorService,
        ],
        exports: [
            planner_service_1.PlannerService,
            researcher_service_1.ResearcherService,
            analyzer_service_1.AnalyzerService,
            comparison_service_1.ComparisonService,
            reporter_service_1.ReporterService,
            research_orchestrator_service_1.ResearchOrchestratorService,
        ],
    })
], AgentsModule);
//# sourceMappingURL=agents.module.js.map