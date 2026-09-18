import { HydratedDocument } from 'mongoose';
import { ResearchTaskStatus } from '../../common/enums/research-task-status.enum';
export declare class ResearchTask {
    researchId: string;
    type: string;
    query: string;
    purpose: string;
    status: ResearchTaskStatus;
    resultsCount: number;
    error: string | null;
}
export type ResearchTaskDocument = HydratedDocument<ResearchTask>;
export declare const ResearchTaskSchema: import("mongoose").Schema<ResearchTask, import("mongoose").Model<ResearchTask, any, any, any, import("mongoose").Document<unknown, any, ResearchTask, any, {}> & ResearchTask & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, ResearchTask, import("mongoose").Document<unknown, {}, import("mongoose").FlatRecord<ResearchTask>, {}, import("mongoose").DefaultSchemaOptions> & import("mongoose").FlatRecord<ResearchTask> & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}>;
