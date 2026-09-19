import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, FilterQuery } from 'mongoose';
import { ResearchSession, ResearchSessionDocument } from './schemas/research-session.schema';
import { ResearchTask, ResearchTaskDocument } from './schemas/research-task.schema';
import { ResearchStatus } from '../common/enums/research-status.enum';
import { ResearchPlan } from '../common/interfaces/research.interface';

@Injectable()
export class ResearchRepository {
  private readonly logger = new Logger(ResearchRepository.name);

  constructor(
    @InjectModel(ResearchSession.name) private sessionModel: Model<ResearchSessionDocument>,
    @InjectModel(ResearchTask.name) private taskModel: Model<ResearchTaskDocument>,
  ) { }

  async createSession(data: Partial<ResearchSession>): Promise<ResearchSessionDocument> {
    const session = new this.sessionModel(data);
    return session.save();
  }

  async findSessionById(id: string): Promise<ResearchSessionDocument | null> {
    return this.sessionModel.findById(id).exec();
  }
  async updateSession(
    researchId: string,
    updates: Partial<ResearchSession>,
  ): Promise<ResearchSession | null> {
    return this.sessionModel.findByIdAndUpdate(
      researchId,
      { $set: updates },
      { new: true },
    ).exec();
  }

  async deleteSession(id: string): Promise<void> {
    await this.sessionModel.findByIdAndDelete(id).exec();
    await this.taskModel.deleteMany({ researchId: id }).exec();
  }

  async findSessionsPaginated(
    page: number,
    limit: number,
    status?: ResearchStatus,
    search?: string,
  ): Promise<{ sessions: ResearchSessionDocument[]; total: number }> {
    const filter: FilterQuery<ResearchSession> = {};
    if (status) filter.status = status;
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

  async updateStatus(
    id: string,
    status: ResearchStatus,
    progress?: number,
    currentStep?: string,
  ): Promise<ResearchSessionDocument | null> {
    const updates: Partial<ResearchSession> = { status };
    if (progress !== undefined) updates.progress = progress;
    if (currentStep !== undefined) updates.currentStep = currentStep;
    if (status === ResearchStatus.COMPLETED) {
      updates.completedAt = new Date();
    }
    return this.sessionModel.findByIdAndUpdate(id, updates, { new: true }).exec();
  }

  async setStartedAt(id: string): Promise<void> {
    await this.sessionModel.findByIdAndUpdate(id, { startedAt: new Date() }).exec();
  }

  async setCompleted(id: string, reportId: string): Promise<void> {
    await this.sessionModel
      .findByIdAndUpdate(id, {
        status: ResearchStatus.COMPLETED,
        progress: 100,
        completedAt: new Date(),
        reportId,
      })
      .exec();
  }

  async setFailed(id: string, error: string): Promise<void> {
    await this.sessionModel
      .findByIdAndUpdate(id, {
        status: ResearchStatus.FAILED,
        error,
        completedAt: new Date(),
      })
      .exec();
  }

  async savePlan(id: string, plan: ResearchPlan): Promise<void> {
    await this.sessionModel
      .findByIdAndUpdate(id, {
        plan,
        totalTasks: plan.tasks.length,
      })
      .exec();
  }

  async createTasks(
    researchId: string,
    tasks: ResearchPlan['tasks'],
  ): Promise<ResearchTaskDocument[]> {
    const docs = tasks.map((t) => ({
      researchId,
      type: t.type,
      query: t.query,
      purpose: t.purpose,
      status: 'pending' as const,
    }));
    await this.taskModel.insertMany(docs);
    return this.taskModel.find({ researchId }).exec();
  }

  async findTasksByResearchId(researchId: string): Promise<ResearchTaskDocument[]> {
    return this.taskModel.find({ researchId }).exec();
  }

  async updateTaskStatus(
    taskId: string,
    status: string,
    resultsCount?: number,
    error?: string,
  ): Promise<void> {
    const updates: Record<string, unknown> = { status };
    if (resultsCount !== undefined) updates.resultsCount = resultsCount;
    if (error !== undefined) updates.error = error;
    await this.taskModel.findByIdAndUpdate(taskId, updates).exec();
  }

  async updateMetrics(id: string, metrics: Record<string, unknown>): Promise<void> {
    await this.sessionModel.findByIdAndUpdate(id, { metrics }).exec();
  }

  async incrementCompletedTasks(id: string): Promise<void> {
    await this.sessionModel.findByIdAndUpdate(id, { $inc: { completedTasks: 1 } }).exec();
  }
}
