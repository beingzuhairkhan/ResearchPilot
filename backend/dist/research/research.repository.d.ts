import { Model } from 'mongoose';
import { ResearchSession, ResearchSessionDocument } from './schemas/research-session.schema';
import { ResearchTaskDocument } from './schemas/research-task.schema';
import { ResearchStatus } from '../common/enums/research-status.enum';
import { ResearchPlan } from '../common/interfaces/research.interface';
export declare class ResearchRepository {
    private sessionModel;
    private taskModel;
    private readonly logger;
    constructor(sessionModel: Model<ResearchSessionDocument>, taskModel: Model<ResearchTaskDocument>);
    createSession(data: Partial<ResearchSession>): Promise<ResearchSessionDocument>;
    findSessionById(id: string): Promise<ResearchSessionDocument | null>;
    updateSession(id: string, updates: Partial<ResearchSession>): Promise<ResearchSessionDocument | null>;
    deleteSession(id: string): Promise<void>;
    findSessionsPaginated(page: number, limit: number, status?: ResearchStatus, search?: string): Promise<{
        sessions: ResearchSessionDocument[];
        total: number;
    }>;
    updateStatus(id: string, status: ResearchStatus, progress?: number, currentStep?: string): Promise<ResearchSessionDocument | null>;
    setStartedAt(id: string): Promise<void>;
    setCompleted(id: string, reportId: string): Promise<void>;
    setFailed(id: string, error: string): Promise<void>;
    savePlan(id: string, plan: ResearchPlan): Promise<void>;
    createTasks(researchId: string, tasks: ResearchPlan['tasks']): Promise<ResearchTaskDocument[]>;
    findTasksByResearchId(researchId: string): Promise<ResearchTaskDocument[]>;
    updateTaskStatus(taskId: string, status: string, resultsCount?: number, error?: string): Promise<void>;
    updateMetrics(id: string, metrics: Record<string, unknown>): Promise<void>;
    incrementCompletedTasks(id: string): Promise<void>;
}
