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
var AnalyzerService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnalyzerService = void 0;
const common_1 = require("@nestjs/common");
const analyzer_agent_1 = require("./analyzer.agent");
let AnalyzerService = AnalyzerService_1 = class AnalyzerService {
    constructor(analyzerAgent) {
        this.analyzerAgent = analyzerAgent;
        this.logger = new common_1.Logger(AnalyzerService_1.name);
    }
    async analyze(question, evidence, sources) {
        return this.analyzerAgent.analyze(question, evidence, sources);
    }
};
exports.AnalyzerService = AnalyzerService;
exports.AnalyzerService = AnalyzerService = AnalyzerService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [analyzer_agent_1.AnalyzerAgent])
], AnalyzerService);
//# sourceMappingURL=analyzer.service.js.map