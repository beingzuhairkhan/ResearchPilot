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
exports.ResearchSessionSchema = exports.ResearchSession = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const research_status_enum_1 = require("../../common/enums/research-status.enum");
const research_mode_enum_1 = require("../../common/enums/research-mode.enum");
let ResearchSession = class ResearchSession {
};
exports.ResearchSession = ResearchSession;
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], ResearchSession.prototype, "question", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], ResearchSession.prototype, "normalizedQuestion", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String, enum: research_status_enum_1.ResearchStatus, default: research_status_enum_1.ResearchStatus.QUEUED, index: true }),
    __metadata("design:type", String)
], ResearchSession.prototype, "status", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String, enum: research_mode_enum_1.ResearchMode, default: research_mode_enum_1.ResearchMode.DEEP }),
    __metadata("design:type", String)
], ResearchSession.prototype, "mode", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Number, default: 0 }),
    __metadata("design:type", Number)
], ResearchSession.prototype, "progress", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String, default: '' }),
    __metadata("design:type", String)
], ResearchSession.prototype, "currentStep", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Number, default: 0 }),
    __metadata("design:type", Number)
], ResearchSession.prototype, "totalTasks", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Number, default: 0 }),
    __metadata("design:type", Number)
], ResearchSession.prototype, "completedTasks", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Number, default: 0 }),
    __metadata("design:type", Number)
], ResearchSession.prototype, "sourcesFound", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Number, default: 0 }),
    __metadata("design:type", Number)
], ResearchSession.prototype, "sourcesAnalyzed", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Number, default: 0 }),
    __metadata("design:type", Number)
], ResearchSession.prototype, "relevantSources", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Number, default: 0 }),
    __metadata("design:type", Number)
], ResearchSession.prototype, "conflictingClaims", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Date, default: null }),
    __metadata("design:type", Object)
], ResearchSession.prototype, "startedAt", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Date, default: null }),
    __metadata("design:type", Object)
], ResearchSession.prototype, "completedAt", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String, default: null }),
    __metadata("design:type", Object)
], ResearchSession.prototype, "error", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String, default: null }),
    __metadata("design:type", Object)
], ResearchSession.prototype, "reportId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Object, default: null }),
    __metadata("design:type", Object)
], ResearchSession.prototype, "plan", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Object, default: null }),
    __metadata("design:type", Object)
], ResearchSession.prototype, "metrics", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Number, default: 30 }),
    __metadata("design:type", Number)
], ResearchSession.prototype, "maxSources", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Boolean, default: true }),
    __metadata("design:type", Boolean)
], ResearchSession.prototype, "includeNews", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Boolean, default: false }),
    __metadata("design:type", Boolean)
], ResearchSession.prototype, "includeScholar", void 0);
exports.ResearchSession = ResearchSession = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true, collection: 'research_sessions' })
], ResearchSession);
exports.ResearchSessionSchema = mongoose_1.SchemaFactory.createForClass(ResearchSession);
exports.ResearchSessionSchema.index({ createdAt: -1 });
//# sourceMappingURL=research-session.schema.js.map