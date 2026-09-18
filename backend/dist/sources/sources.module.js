"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SourcesModule = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const source_schema_1 = require("./schemas/source.schema");
const sources_service_1 = require("./sources.service");
const source_deduplication_service_1 = require("./source-deduplication.service");
const source_normalizer_service_1 = require("./source-normalizer.service");
const source_extractor_service_1 = require("./source-extractor.service");
let SourcesModule = class SourcesModule {
};
exports.SourcesModule = SourcesModule;
exports.SourcesModule = SourcesModule = __decorate([
    (0, common_1.Module)({
        imports: [
            mongoose_1.MongooseModule.forFeature([{ name: 'Source', schema: source_schema_1.SourceSchema }]),
        ],
        providers: [
            sources_service_1.SourcesService,
            source_deduplication_service_1.SourceDeduplicationService,
            source_normalizer_service_1.SourceNormalizerService,
            source_extractor_service_1.SourceExtractorService,
        ],
        exports: [
            sources_service_1.SourcesService,
            source_deduplication_service_1.SourceDeduplicationService,
            source_normalizer_service_1.SourceNormalizerService,
            source_extractor_service_1.SourceExtractorService,
            mongoose_1.MongooseModule.forFeature([{ name: 'Source', schema: source_schema_1.SourceSchema }]),
        ],
    })
], SourcesModule);
//# sourceMappingURL=sources.module.js.map