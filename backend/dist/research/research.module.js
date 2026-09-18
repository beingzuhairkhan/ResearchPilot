"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResearchModule = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const research_controller_1 = require("./research.controller");
const research_service_1 = require("./research.service");
const research_repository_1 = require("./research.repository");
const research_session_schema_1 = require("./schemas/research-session.schema");
const research_task_schema_1 = require("./schemas/research-task.schema");
const source_schema_1 = require("../sources/schemas/source.schema");
const report_schema_1 = require("../reports/schemas/report.schema");
const events_module_1 = require("../events/events.module");
const research_queue_module_1 = require("../queue/research-queue.module");
let ResearchModule = class ResearchModule {
};
exports.ResearchModule = ResearchModule;
exports.ResearchModule = ResearchModule = __decorate([
    (0, common_1.Module)({
        imports: [
            mongoose_1.MongooseModule.forFeature([
                { name: 'ResearchSession', schema: research_session_schema_1.ResearchSessionSchema },
                { name: 'ResearchTask', schema: research_task_schema_1.ResearchTaskSchema },
                { name: 'Source', schema: source_schema_1.SourceSchema },
                { name: 'Report', schema: report_schema_1.ReportSchema },
            ]),
            events_module_1.EventsModule,
            research_queue_module_1.ResearchQueueModule,
        ],
        controllers: [research_controller_1.ResearchController],
        providers: [research_service_1.ResearchService, research_repository_1.ResearchRepository],
        exports: [research_service_1.ResearchService, research_repository_1.ResearchRepository],
    })
], ResearchModule);
//# sourceMappingURL=research.module.js.map