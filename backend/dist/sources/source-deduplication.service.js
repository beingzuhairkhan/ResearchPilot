"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var SourceDeduplicationService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SourceDeduplicationService = void 0;
const common_1 = require("@nestjs/common");
const url_utils_1 = require("../common/utils/url.utils");
let SourceDeduplicationService = SourceDeduplicationService_1 = class SourceDeduplicationService {
    constructor() {
        this.logger = new common_1.Logger(SourceDeduplicationService_1.name);
    }
    async deduplicate(researchId, sourceModel) {
        const allSources = await sourceModel.find({ researchId }).exec();
        const toDelete = [];
        const seen = new Map();
        for (const source of allSources) {
            const key = source.canonicalUrl || (0, url_utils_1.getCanonicalUrl)(source.url);
            if (seen.has(key)) {
                const existingId = seen.get(key);
                const existing = allSources.find((s) => s._id.toString() === existingId);
                if (existing && (0, url_utils_1.isSimilarTitle)(source.title, existing.title)) {
                    toDelete.push(source._id.toString());
                    this.logger.debug(`[Dedup] Removing duplicate: ${source.url}`);
                }
            }
            else {
                seen.set(key, source._id.toString());
            }
        }
        if (toDelete.length > 0) {
            await sourceModel.deleteMany({ _id: { $in: toDelete } }).exec();
            this.logger.log(`[Dedup] Removed ${toDelete.length} duplicates for researchId=${researchId}`);
        }
        return sourceModel.find({ researchId }).exec();
    }
};
exports.SourceDeduplicationService = SourceDeduplicationService;
exports.SourceDeduplicationService = SourceDeduplicationService = SourceDeduplicationService_1 = __decorate([
    (0, common_1.Injectable)()
], SourceDeduplicationService);
//# sourceMappingURL=source-deduplication.service.js.map