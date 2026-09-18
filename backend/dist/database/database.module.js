"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DatabaseModule = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const research_session_schema_1 = require("../research/schemas/research-session.schema");
const research_task_schema_1 = require("../research/schemas/research-task.schema");
const source_schema_1 = require("../sources/schemas/source.schema");
const report_schema_1 = require("../reports/schemas/report.schema");
let DatabaseModule = class DatabaseModule {
};
exports.DatabaseModule = DatabaseModule;
exports.DatabaseModule = DatabaseModule = __decorate([
    (0, common_1.Module)({
        imports: [
            mongoose_1.MongooseModule.forRootAsync({
                useFactory: () => ({
                    uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/researchpilot',
                }),
            }),
            mongoose_1.MongooseModule.forFeature([
                { name: 'ResearchSession', schema: research_session_schema_1.ResearchSessionSchema },
                { name: 'ResearchTask', schema: research_task_schema_1.ResearchTaskSchema },
                { name: 'Source', schema: source_schema_1.SourceSchema },
                { name: 'Report', schema: report_schema_1.ReportSchema },
            ]),
        ],
        exports: [mongoose_1.MongooseModule],
    })
], DatabaseModule);
//# sourceMappingURL=database.module.js.map