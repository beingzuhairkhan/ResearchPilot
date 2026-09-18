import { Response } from 'express';
import { ResearchService } from './research.service';
import { CreateResearchDto } from './dto/create-research.dto';
import { ResearchQueryDto } from './dto/research-query.dto';
import { SourceQueryDto } from './dto/source-query.dto';
import { ResearchEventsService } from '../events/research-events.service';
export declare class ResearchController {
    private readonly researchService;
    private readonly eventsService;
    private readonly logger;
    constructor(researchService: ResearchService, eventsService: ResearchEventsService);
    createResearch(dto: CreateResearchDto): Promise<{
        success: boolean;
        data: {
            researchId: string;
            status: string;
        };
    }>;
    getResearchHistory(query: ResearchQueryDto): Promise<{
        data: (import("mongoose").Document<unknown, {}, import("./schemas/research-session.schema").ResearchSession, {}, {}> & import("./schemas/research-session.schema").ResearchSession & {
            _id: import("mongoose").Types.ObjectId;
        } & {
            __v: number;
        })[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
        success: boolean;
    }>;
    getResearch(id: string): Promise<{
        success: boolean;
        data: import("mongoose").Document<unknown, {}, import("./schemas/research-session.schema").ResearchSession, {}, {}> & import("./schemas/research-session.schema").ResearchSession & {
            _id: import("mongoose").Types.ObjectId;
        } & {
            __v: number;
        };
    }>;
    deleteResearch(id: string): Promise<{
        success: boolean;
        message: string;
    }>;
    getResearchPlan(id: string): Promise<{
        success: boolean;
        data: {
            objective: string;
            tasks: {
                type: string;
                query: string;
                purpose: string;
                status: import("../common/enums/research-task-status.enum").ResearchTaskStatus;
            }[];
        };
    }>;
    getResearchSources(id: string, query: SourceQueryDto): Promise<{
        data: (import("mongoose").Document<unknown, {}, import("mongoose").Document<unknown, {}, import("../sources/schemas/source.schema").Source, {}, {}> & import("../sources/schemas/source.schema").Source & {
            _id: import("mongoose").Types.ObjectId;
        } & {
            __v: number;
        }, {}, {}> & import("mongoose").Document<unknown, {}, import("../sources/schemas/source.schema").Source, {}, {}> & import("../sources/schemas/source.schema").Source & {
            _id: import("mongoose").Types.ObjectId;
        } & {
            __v: number;
        } & Required<{
            _id: import("mongoose").Types.ObjectId;
        }>)[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
        success: boolean;
    }>;
    streamResearch(id: string, res: Response): Promise<void>;
}
