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
var ResearchRepository_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResearchRepository = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const research_session_schema_1 = require("./schemas/research-session.schema");
const research_task_schema_1 = require("./schemas/research-task.schema");
const research_status_enum_1 = require("../common/enums/research-status.enum");
let ResearchRepository = ResearchRepository_1 = class ResearchRepository {
    constructor(sessionModel, taskModel) {
        this.sessionModel = sessionModel;
        this.taskModel = taskModel;
        this.logger = new common_1.Logger(ResearchRepository_1.name);
    }
    async createSession(data) {
        const session = new this.sessionModel(data);
        return session.save();
    }
    async findSessionById(id) {
        return this.sessionModel.findById(id).exec();
    }
    async updateSession(researchId, updates) {
        return this.sessionModel.findByIdAndUpdate(researchId, { $set: updates }, { new: true }).exec();
    }
    async deleteSession(id) {
        await this.sessionModel.findByIdAndDelete(id).exec();
        await this.taskModel.deleteMany({ researchId: id }).exec();
    }
    async findSessionsPaginated(page, limit, status, search) {
        const filter = {};
        if (status)
            filter.status = status;
        if (search) {
            filter.$or = [
                { question: { $regex: search, $options: 'i' } },
                { normalizedQuestion: { $regex: search, $options: 'i' } },
            ];
        }
        const skip = (page - 1) * limit;
        const [sessions, total] = await Promise.all([
            this.sessionModel.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).exec(),
            this.sessionModel.countDocuments(filter).exec(),
        ]);
        return { sessions, total };
    }
    async updateStatus(id, status, progress, currentStep) {
        const updates = { status };
        if (progress !== undefined)
            updates.progress = progress;
        if (currentStep !== undefined)
            updates.currentStep = currentStep;
        if (status === research_status_enum_1.ResearchStatus.COMPLETED) {
            updates.completedAt = new Date();
        }
        return this.sessionModel.findByIdAndUpdate(id, updates, { new: true }).exec();
    }
    async setStartedAt(id) {
        await this.sessionModel.findByIdAndUpdate(id, { startedAt: new Date() }).exec();
    }
    async setCompleted(id, reportId) {
        await this.sessionModel
            .findByIdAndUpdate(id, {
            status: research_status_enum_1.ResearchStatus.COMPLETED,
            progress: 100,
            completedAt: new Date(),
            reportId,
        })
            .exec();
    }
    async setFailed(id, error) {
        await this.sessionModel
            .findByIdAndUpdate(id, {
            status: research_status_enum_1.ResearchStatus.FAILED,
            error,
            completedAt: new Date(),
        })
            .exec();
    }
    async savePlan(id, plan) {
        await this.sessionModel
            .findByIdAndUpdate(id, {
            plan,
            totalTasks: plan.tasks.length,
        })
            .exec();
    }
    async createTasks(researchId, tasks) {
        const docs = tasks.map((t) => ({
            researchId,
            type: t.type,
            query: t.query,
            purpose: t.purpose,
            status: 'pending',
        }));
        await this.taskModel.insertMany(docs);
        return this.taskModel.find({ researchId }).exec();
    }
    async findTasksByResearchId(researchId) {
        return this.taskModel.find({ researchId }).exec();
    }
    async updateTaskStatus(taskId, status, resultsCount, error) {
        const updates = { status };
        if (resultsCount !== undefined)
            updates.resultsCount = resultsCount;
        if (error !== undefined)
            updates.error = error;
        await this.taskModel.findByIdAndUpdate(taskId, updates).exec();
    }
    async updateMetrics(id, metrics) {
        await this.sessionModel.findByIdAndUpdate(id, { metrics }).exec();
    }
    async incrementCompletedTasks(id) {
        await this.sessionModel.findByIdAndUpdate(id, { $inc: { completedTasks: 1 } }).exec();
    }
};
exports.ResearchRepository = ResearchRepository;
exports.ResearchRepository = ResearchRepository = ResearchRepository_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(research_session_schema_1.ResearchSession.name)),
    __param(1, (0, mongoose_1.InjectModel)(research_task_schema_1.ResearchTask.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model])
], ResearchRepository);
//# sourceMappingURL=research.repository.js.map