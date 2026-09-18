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
exports.ResearchTaskSchema = exports.ResearchTask = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const research_task_status_enum_1 = require("../../common/enums/research-task-status.enum");
let ResearchTask = class ResearchTask {
};
exports.ResearchTask = ResearchTask;
__decorate([
    (0, mongoose_1.Prop)({ required: true, index: true }),
    __metadata("design:type", String)
], ResearchTask.prototype, "researchId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], ResearchTask.prototype, "type", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], ResearchTask.prototype, "query", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], ResearchTask.prototype, "purpose", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String, enum: research_task_status_enum_1.ResearchTaskStatus, default: research_task_status_enum_1.ResearchTaskStatus.PENDING, index: true }),
    __metadata("design:type", String)
], ResearchTask.prototype, "status", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Number, default: 0 }),
    __metadata("design:type", Number)
], ResearchTask.prototype, "resultsCount", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String, default: null }),
    __metadata("design:type", Object)
], ResearchTask.prototype, "error", void 0);
exports.ResearchTask = ResearchTask = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true, collection: 'research_tasks' })
], ResearchTask);
exports.ResearchTaskSchema = mongoose_1.SchemaFactory.createForClass(ResearchTask);
exports.ResearchTaskSchema.index({ researchId: 1, status: 1 });
//# sourceMappingURL=research-task.schema.js.map