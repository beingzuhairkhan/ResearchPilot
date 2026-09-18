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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var SerpApiService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SerpApiService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const axios_1 = __importDefault(require("axios"));
const constants_1 = require("../common/constants");
const source_type_enum_1 = require("../common/enums/source-type.enum");
const url_utils_1 = require("../common/utils/url.utils");
const custom_exceptions_1 = require("../common/exceptions/custom.exceptions");
let SerpApiService = SerpApiService_1 = class SerpApiService {
    constructor(configService) {
        this.configService = configService;
        this.logger = new common_1.Logger(SerpApiService_1.name);
        this.apiKey = this.configService.get('serpapi.apiKey', '');
        this.isMockMode = this.configService.get('mockExternalServices', false);
        this.httpClient = axios_1.default.create({
            baseURL: constants_1.SERPAPI_BASE_URL,
            timeout: 30000,
        });
    }
    async searchWeb(query, options) {
        if (this.isMockMode) {
            return this.mockSearch(query, source_type_enum_1.SearchType.WEB, options?.num || 10);
        }
        const params = this.buildParams(query, 'google', options);
        const response = await this.executeSearch(params);
        const results = response.organic_results || [];
        return results.map((r, i) => this.normalizeWebResult(r, query, i + 1));
    }
    async searchNews(query, options) {
        if (this.isMockMode) {
            return this.mockSearch(query, source_type_enum_1.SearchType.NEWS, options?.num || 10);
        }
        const params = this.buildParams(query, 'google_news', options);
        const response = await this.executeSearch(params);
        const results = response.news_results || [];
        return results.map((r, i) => this.normalizeNewsResult(r, query, i + 1));
    }
    async searchScholar(query, options) {
        if (this.isMockMode) {
            return this.mockSearch(query, source_type_enum_1.SearchType.SCHOLAR, options?.num || 10);
        }
        const params = this.buildParams(query, 'google_scholar', options);
        const response = await this.executeSearch(params);
        const results = response.organic_results_scholar || response.organic_results || [];
        return results.map((r, i) => this.normalizeScholarResult(r, query, i + 1));
    }
    async search(query, searchType, options) {
        switch (searchType) {
            case source_type_enum_1.SearchType.WEB:
                return this.searchWeb(query, options);
            case source_type_enum_1.SearchType.NEWS:
                return this.searchNews(query, options);
            case source_type_enum_1.SearchType.SCHOLAR:
                return this.searchScholar(query, options);
            default:
                return this.searchWeb(query, options);
        }
    }
    buildParams(query, engine, options) {
        return {
            engine,
            q: query,
            api_key: this.apiKey,
            num: options?.num || 10,
            start: options?.start || 0,
            gl: options?.gl || 'in',
            hl: options?.hl || 'en',
        };
    }
    async executeSearch(params) {
        try {
            const response = await this.httpClient.get('', { params });
            if (response.data.error) {
                this.logger.error(`[SerpApi] API error: ${response.data.error}`);
                throw new custom_exceptions_1.SerpApiException(response.data.error);
            }
            this.logger.log(`[SerpApi] Search completed engine=${params.engine} query="${params.q}" results=${response.data.organic_results?.length ||
                response.data.news_results?.length ||
                0}`);
            return response.data;
        }
        catch (error) {
            if (error instanceof custom_exceptions_1.SerpApiException)
                throw error;
            const message = error instanceof Error ? error.message : 'Unknown error';
            this.logger.error(`[SerpApi] Request failed: ${message}`);
            throw new custom_exceptions_1.SerpApiException(message);
        }
    }
    normalizeWebResult(result, query, position) {
        return {
            title: result.title || '',
            url: result.link || '',
            snippet: result.snippet || '',
            source: result.source || (0, url_utils_1.getDomain)(result.link || ''),
            publishedAt: result.date || null,
            searchType: source_type_enum_1.SearchType.WEB,
            query,
            position,
        };
    }
    normalizeNewsResult(result, query, position) {
        return {
            title: result.title || '',
            url: result.link || '',
            snippet: result.snippet || '',
            source: result.source || (0, url_utils_1.getDomain)(result.link || ''),
            publishedAt: result.date || null,
            searchType: source_type_enum_1.SearchType.NEWS,
            query,
            position,
        };
    }
    normalizeScholarResult(result, query, position) {
        return {
            title: result.title || '',
            url: result.link || '',
            snippet: result.snippet || '',
            source: result.publication_info?.summary || '',
            publishedAt: result.year ? `${result.year}-01-01` : null,
            searchType: source_type_enum_1.SearchType.SCHOLAR,
            query,
            position,
        };
    }
    isConfigured() {
        return this.isMockMode || this.apiKey.length > 0;
    }
    mockSearch(query, searchType, num) {
        this.logger.warn(`[SerpApi] MOCK mode — returning mock results for query="${query}"`);
        const results = [];
        for (let i = 0; i < Math.min(num, 5); i++) {
            results.push({
                title: `[Mock] Research result ${i + 1} for "${query}"`,
                url: `https://example.com/mock-${searchType}-${i + 1}`,
                snippet: `This is a mock search result for development purposes. Query: ${query}`,
                source: 'example.com',
                publishedAt: new Date().toISOString(),
                searchType,
                query,
                position: i + 1,
            });
        }
        return results;
    }
};
exports.SerpApiService = SerpApiService;
exports.SerpApiService = SerpApiService = SerpApiService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], SerpApiService);
//# sourceMappingURL=serpapi.service.js.map