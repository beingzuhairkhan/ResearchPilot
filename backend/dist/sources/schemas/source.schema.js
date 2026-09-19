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
Object.defineProperty(exports, "__esModule", { value: true });
exports.SourceSchema = exports.Source = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const source_type_enum_1 = require("../../common/enums/source-type.enum");
const safeDate = (value) => {
    if (value === null || value === undefined || value === '')
        return null;
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? null : date;
};
let Source = class Source {
};
exports.Source = Source;
__decorate([
    (0, mongoose_1.Prop)({ required: true, index: true }),
    __metadata("design:type", String)
], Source.prototype, "researchId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], Source.prototype, "title", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], Source.prototype, "url", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, index: true }),
    __metadata("design:type", String)
], Source.prototype, "canonicalUrl", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, index: true }),
    __metadata("design:type", String)
], Source.prototype, "domain", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String, default: '' }),
    __metadata("design:type", String)
], Source.prototype, "snippet", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String, default: '' }),
    __metadata("design:type", String)
], Source.prototype, "content", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String, enum: source_type_enum_1.SourceType, default: source_type_enum_1.SourceType.WEB }),
    __metadata("design:type", String)
], Source.prototype, "sourceType", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String, default: null }),
    __metadata("design:type", Object)
], Source.prototype, "author", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Date, default: null, index: true, set: safeDate }),
    __metadata("design:type", Object)
], Source.prototype, "publishedAt", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Date, default: Date.now }),
    __metadata("design:type", Date)
], Source.prototype, "discoveredAt", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String, default: '' }),
    __metadata("design:type", String)
], Source.prototype, "searchQuery", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Number, default: 0 }),
    __metadata("design:type", Number)
], Source.prototype, "relevanceScore", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String, enum: source_type_enum_1.ContentStatus, default: source_type_enum_1.ContentStatus.PENDING }),
    __metadata("design:type", String)
], Source.prototype, "contentStatus", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, index: true }),
    __metadata("design:type", String)
], Source.prototype, "hash", void 0);
exports.Source = Source = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true, collection: 'sources' })
], Source);
exports.SourceSchema = mongoose_1.SchemaFactory.createForClass(Source);
exports.SourceSchema.index({ researchId: 1, canonicalUrl: 1 });
exports.SourceSchema.index({ researchId: 1, hash: 1 });
//# sourceMappingURL=source.schema.js.map