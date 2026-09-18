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
var PlannerService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PlannerService = void 0;
const common_1 = require("@nestjs/common");
const planner_agent_1 = require("./planner.agent");
let PlannerService = PlannerService_1 = class PlannerService {
    constructor(plannerAgent) {
        this.plannerAgent = plannerAgent;
        this.logger = new common_1.Logger(PlannerService_1.name);
    }
    async plan(question, mode, includeNews, includeScholar) {
        return this.plannerAgent.createPlan(question, mode, includeNews, includeScholar);
    }
};
exports.PlannerService = PlannerService;
exports.PlannerService = PlannerService = PlannerService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [planner_agent_1.PlannerAgent])
], PlannerService);
//# sourceMappingURL=planner.service.js.map