import { HydratedDocument } from 'mongoose';
import { ResearchStatus } from '../../common/enums/research-status.enum';
import { ResearchMode } from '../../common/enums/research-mode.enum';
import { ResearchPlan } from '../../common/interfaces/research.interface';
export declare class ResearchSession {
    question: string;
    normalizedQuestion: string;
    status: ResearchStatus;
    mode: ResearchMode;
    progress: number;
    currentStep: string;
    totalTasks: number;
    completedTasks: number;
    sourcesFound: number;
    sourcesAnalyzed: number;
    relevantSources: number;
    conflictingClaims: number;
    startedAt: Date | null;
    completedAt: Date | null;
    error: string | null;
    reportId: string | null;
    plan: ResearchPlan | null;
    metrics: Record<string, unknown> | null;
    maxSources: number;
    includeNews: boolean;
    includeScholar: boolean;
}
export type ResearchSessionDocument = HydratedDocument<ResearchSession>;
export declare const ResearchSessionSchema: import("mongoose").Schema<ResearchSession, import("mongoose").Model<ResearchSession, any, any, any, import("mongoose").Document<unknown, any, ResearchSession, any, {}> & ResearchSession & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, ResearchSession, import("mongoose").Document<unknown, {}, import("mongoose").FlatRecord<ResearchSession>, {}, import("mongoose").DefaultSchemaOptions> & import("mongoose").FlatRecord<ResearchSession> & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}>;
