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
var ResearcherAgent_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResearcherAgent = void 0;
const common_1 = require("@nestjs/common");
const serpapi_service_1 = require("../../serpapi/serpapi.service");
const source_type_enum_1 = require("../../common/enums/source-type.enum");
let ResearcherAgent = ResearcherAgent_1 = class ResearcherAgent {
    constructor(serpApiService) {
        this.serpApiService = serpApiService;
        this.logger = new common_1.Logger(ResearcherAgent_1.name);
    }
    async executeTask(task, maxResults, taskIndex, includeScholar) {
        const searchType = this.resolveSearchType(task.type, includeScholar);
        this.logger.log(`[Researcher] Executing search type=${searchType} query="${task.query}"`);
        try {
            const results = await this.serpApiService.search(task.query, searchType, {
                num: Math.min(maxResults, 10),
            });
            this.logger.log(`[Researcher] Got ${results.length} results for query="${task.query}"`);
            return { taskIndex, query: task.query, searchType, results, error: null };
        }
        catch (error) {
            const message = error instanceof Error ? error.message : 'Search failed';
            this.logger.warn(`[Researcher] Search failed for query="${task.query}": ${message}`);
            return { taskIndex, query: task.query, searchType, results: [], error: message };
        }
    }
    async executeAllTasks(tasks, maxResults, includeScholar) {
        const results = [];
        for (let i = 0; i < tasks.length; i++) {
            const result = await this.executeTask(tasks[i], maxResults, i, includeScholar);
            results.push(result);
        }
        return results;
    }
    resolveSearchType(type, includeScholar) {
        const lower = type.toLowerCase();
        if (lower === 'news')
            return source_type_enum_1.SearchType.NEWS;
        if (lower === 'scholar' || lower === 'research') {
            return includeScholar ? source_type_enum_1.SearchType.SCHOLAR : source_type_enum_1.SearchType.WEB;
        }
        if (lower === 'company' || lower === 'web')
            return source_type_enum_1.SearchType.WEB;
        return source_type_enum_1.SearchType.WEB;
    }
};
exports.ResearcherAgent = ResearcherAgent;
exports.ResearcherAgent = ResearcherAgent = ResearcherAgent_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [serpapi_service_1.SerpApiService])
], ResearcherAgent);
//# sourceMappingURL=researcher.agent.js.map