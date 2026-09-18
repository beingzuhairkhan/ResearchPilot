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
var SourcesService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SourcesService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const source_schema_1 = require("./schemas/source.schema");
const source_type_enum_1 = require("../common/enums/source-type.enum");
const url_utils_1 = require("../common/utils/url.utils");
const source_deduplication_service_1 = require("./source-deduplication.service");
const source_normalizer_service_1 = require("./source-normalizer.service");
let SourcesService = SourcesService_1 = class SourcesService {
    constructor(sourceModel, deduplicationService, normalizerService) {
        this.sourceModel = sourceModel;
        this.deduplicationService = deduplicationService;
        this.normalizerService = normalizerService;
        this.logger = new common_1.Logger(SourcesService_1.name);
    }
    async collectSources(researchId, results, maxSources, sourceTypeOverride, onProgress) {
        const collected = [];
        const seenHashes = new Set();
        for (const result of results) {
            if (collected.length >= maxSources)
                break;
            const normalized = this.normalizerService.normalizeResult(result);
            const sourceType = sourceTypeOverride || this.inferSourceType(result);
            const canonicalUrl = (0, url_utils_1.getCanonicalUrl)(normalized.url);
            const hash = (0, url_utils_1.generateUrlHash)(normalized.url);
            if (seenHashes.has(hash))
                continue;
            seenHashes.add(hash);
            const existing = await this.sourceModel.findOne({
                researchId,
                $or: [{ canonicalUrl }, { hash }],
            });
            if (existing) {
                this.logger.debug(`[Sources] Skipping duplicate: ${normalized.url}`);
                continue;
            }
            const source = new this.sourceModel({
                researchId,
                title: normalized.title,
                url: normalized.url,
                canonicalUrl,
                domain: (0, url_utils_1.getDomain)(normalized.url),
                snippet: normalized.snippet,
                content: '',
                sourceType,
                author: null,
                publishedAt: normalized.publishedAt ? new Date(normalized.publishedAt) : null,
                discoveredAt: new Date(),
                searchQuery: normalized.query,
                relevanceScore: 0,
                contentStatus: source_type_enum_1.ContentStatus.PENDING,
                hash: (0, url_utils_1.generateContentHash)(normalized.title + normalized.url),
            });
            await source.save();
            collected.push(source);
            if (onProgress)
                onProgress(collected.length);
        }
        this.logger.log(`[Sources] Collected ${collected.length} sources for researchId=${researchId}`);
        return collected;
    }
    async getSourcesByResearchId(researchId) {
        return this.sourceModel.find({ researchId }).sort({ relevanceScore: -1 }).exec();
    }
    async updateSourceContent(sourceId, content, contentStatus, canonicalUrl, author, publishedAt) {
        const updates = { content, contentStatus };
        if (canonicalUrl)
            updates.canonicalUrl = canonicalUrl;
        if (author !== undefined)
            updates.author = author;
        if (publishedAt)
            updates.publishedAt = publishedAt;
        if (content)
            updates.hash = (0, url_utils_1.generateContentHash)(content);
        await this.sourceModel.findByIdAndUpdate(sourceId, updates).exec();
    }
    async updateRelevanceScore(sourceId, score) {
        await this.sourceModel.findByIdAndUpdate(sourceId, { relevanceScore: score }).exec();
    }
    async deleteByResearchId(researchId) {
        await this.sourceModel.deleteMany({ researchId }).exec();
    }
    async countByResearchId(researchId) {
        return this.sourceModel.countDocuments({ researchId }).exec();
    }
    async countUniqueDomains(researchId) {
        const result = await this.sourceModel.distinct('domain', { researchId }).exec();
        return result.length;
    }
    async countRecentSources(researchId, monthsThreshold = 6) {
        const threshold = new Date();
        threshold.setMonth(threshold.getMonth() - monthsThreshold);
        return this.sourceModel
            .countDocuments({ researchId, publishedAt: { $gte: threshold } })
            .exec();
    }
    async countAnalyzedSources(researchId) {
        return this.sourceModel
            .countDocuments({ researchId, contentStatus: source_type_enum_1.ContentStatus.EXTRACTED })
            .exec();
    }
    inferSourceType(result) {
        switch (result.searchType) {
            case 'web':
                return source_type_enum_1.SourceType.WEB;
            case 'news':
                return source_type_enum_1.SourceType.NEWS;
            case 'scholar':
                return source_type_enum_1.SourceType.SCHOLAR;
            default:
                return source_type_enum_1.SourceType.OTHER;
        }
    }
    async deduplicateSources(researchId) {
        return this.deduplicationService.deduplicate(researchId, this.sourceModel);
    }
};
exports.SourcesService = SourcesService;
exports.SourcesService = SourcesService = SourcesService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(source_schema_1.Source.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        source_deduplication_service_1.SourceDeduplicationService,
        source_normalizer_service_1.SourceNormalizerService])
], SourcesService);
//# sourceMappingURL=sources.service.js.map