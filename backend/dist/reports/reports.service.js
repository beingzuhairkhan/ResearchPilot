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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var ReportsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReportsService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const report_schema_1 = require("./schemas/report.schema");
const research_repository_1 = require("../research/research.repository");
let ReportsService = ReportsService_1 = class ReportsService {
    constructor(reportModel, researchRepository) {
        this.reportModel = reportModel;
        this.researchRepository = researchRepository;
        this.logger = new common_1.Logger(ReportsService_1.name);
    }
    async getReport(researchId) {
        const session = await this.researchRepository.findSessionById(researchId);
        if (!session) {
            throw new common_1.NotFoundException('Research session not found');
        }
        const report = await this.reportModel.findOne({ researchId }).exec();
        if (!report) {
            throw new common_1.NotFoundException('Report not found or not yet generated');
        }
        return report;
    }
    async getReportMetrics(researchId) {
        const report = await this.reportModel.findOne({ researchId }).exec();
        if (!report) {
            throw new common_1.NotFoundException('Report not found');
        }
        return report.metrics;
    }
};
exports.ReportsService = ReportsService;
exports.ReportsService = ReportsService = ReportsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(report_schema_1.Report.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        research_repository_1.ResearchRepository])
], ReportsService);
//# sourceMappingURL=reports.service.js.map