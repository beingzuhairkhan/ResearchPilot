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
var SourceExtractorService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SourceExtractorService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const axios_1 = __importDefault(require("axios"));
const text_utils_1 = require("../common/utils/text.utils");
const url_utils_1 = require("../common/utils/url.utils");
let SourceExtractorService = SourceExtractorService_1 = class SourceExtractorService {
    constructor(configService) {
        this.configService = configService;
        this.logger = new common_1.Logger(SourceExtractorService_1.name);
        this.timeout = configService.get('sources.fetchTimeout', 10000);
        this.isMockMode = configService.get('mockExternalServices', false);
        this.httpClient = axios_1.default.create({
            timeout: this.timeout,
            maxRedirects: 10,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
                'Accept-Language': 'en-US,en;q=0.9',
                'Accept-Encoding': 'gzip, deflate, br',
                'Cache-Control': 'no-cache',
                'Pragma': 'no-cache',
                'Sec-Ch-Ua': '"Chromium";v="124", "Google Chrome";v="124", "Not-A.Brand";v="99"',
                'Sec-Ch-Ua-Mobile': '?0',
                'Sec-Ch-Ua-Platform': '"Windows"',
                'Sec-Fetch-Dest': 'document',
                'Sec-Fetch-Mode': 'navigate',
                'Sec-Fetch-Site': 'none',
                'Sec-Fetch-User': '?1',
                'Upgrade-Insecure-Requests': '1',
            },
        });
    }
    async extract(url) {
        if (this.isMockMode) {
            return this.mockExtract(url);
        }
        try {
            const response = await this.httpClient.get(url, {
                responseType: 'text',
                maxContentLength: 10 * 1024 * 1024,
                validateStatus: (status) => status >= 200 && status < 300,
            });
            const html = response.data;
            const content = (0, text_utils_1.cleanHtml)(html);
            const title = this.extractTitle(html);
            const author = this.extractMetaTag(html, 'author');
            const publishedAt = this.extractMetaTag(html, 'article:published_time') ||
                this.extractMetaTag(html, 'datePublished') ||
                this.extractMetaTag(html, 'og:updated_time');
            const canonical = this.extractCanonicalUrl(html) || (0, url_utils_1.getCanonicalUrl)(url);
            if (!content || content.length < 50) {
                this.logger.warn(`[Extractor] Empty or too-short content from ${url}`);
                return null;
            }
            return {
                title: title || (0, text_utils_1.extractSnippet)(content, 100),
                content: content.slice(0, 50000),
                author: author || null,
                publishedAt: publishedAt || null,
                canonicalUrl: canonical,
            };
        }
        catch (error) {
            const message = error instanceof Error ? error.message : 'Unknown error';
            this.logger.warn(`[Extractor] Failed to extract ${url}: ${message}`);
            return null;
        }
    }
    extractTitle(html) {
        const match = html.match(/<title[^>]*>([^<]+)<\/title>/i);
        return match ? match[1].trim() : '';
    }
    extractMetaTag(html, property) {
        const patterns = [
            new RegExp(`<meta[^>]*property=["']${property}["'][^>]*content=["']([^"']+)["']`, 'i'),
            new RegExp(`<meta[^>]*name=["']${property}["'][^>]*content=["']([^"']+)["']`, 'i'),
            new RegExp(`<meta[^>]*content=["']([^"']+)["'][^>]*property=["']${property}["']`, 'i'),
            new RegExp(`<meta[^>]*content=["']([^"']+)["'][^>]*name=["']${property}["']`, 'i'),
        ];
        for (const pattern of patterns) {
            const match = html.match(pattern);
            if (match)
                return match[1].trim();
        }
        return null;
    }
    extractCanonicalUrl(html) {
        const match = html.match(/<link[^>]*rel=["']canonical["'][^>]*href=["']([^"']+)["']/i);
        return match ? match[1].trim() : null;
    }
    mockExtract(url) {
        return {
            title: `[Mock] Page title for ${url}`,
            content: `This is mock extracted content for development purposes. The page at ${url} contains relevant information about the research topic.`,
            author: 'Mock Author',
            publishedAt: new Date().toISOString(),
            canonicalUrl: (0, url_utils_1.getCanonicalUrl)(url),
        };
    }
};
exports.SourceExtractorService = SourceExtractorService;
exports.SourceExtractorService = SourceExtractorService = SourceExtractorService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], SourceExtractorService);
//# sourceMappingURL=source-extractor.service.js.map