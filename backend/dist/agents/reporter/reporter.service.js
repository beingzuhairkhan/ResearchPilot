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
var ReporterService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReporterService = void 0;
const common_1 = require("@nestjs/common");
const reporter_agent_1 = require("./reporter.agent");
let ReporterService = ReporterService_1 = class ReporterService {
    constructor(reporterAgent) {
        this.reporterAgent = reporterAgent;
        this.logger = new common_1.Logger(ReporterService_1.name);
    }
    async generateReport(input) {
        return this.reporterAgent.generateReport(input);
    }
};
exports.ReporterService = ReporterService;
exports.ReporterService = ReporterService = ReporterService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [reporter_agent_1.ReporterAgent])
], ReporterService);
//# sourceMappingURL=reporter.service.js.map