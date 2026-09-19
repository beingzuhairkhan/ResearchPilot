import { ConfigService } from '@nestjs/config';
import { Model } from 'mongoose';
import { Source, SourceDocument } from '../sources/schemas/source.schema';
import { ReportDocument } from '../reports/schemas/report.schema';
import { ResearchRepository } from './research.repository';
import { CreateResearchDto } from './dto/create-research.dto';
import { ResearchQueryDto } from './dto/research-query.dto';
import { SourceQueryDto } from './dto/source-query.dto';
import { ResearchEventsService } from '../events/research-events.service';
import { ResearchQueueService } from '../queue/research.queue';
export declare class ResearchService {
    private readonly repository;
    private readonly eventsService;
    private readonly queueService;
    private readonly configService;
    private sourceModel;
    private reportModel;
    private readonly logger;
    constructor(repository: ResearchRepository, eventsService: ResearchEventsService, queueService: ResearchQueueService, configService: ConfigService, sourceModel: Model<SourceDocument>, reportModel: Model<ReportDocument>);
    createResearch(dto: CreateResearchDto): Promise<{
        researchId: string;
        status: string;
    }>;
    getResearch(id: string): Promise<(import("mongoose").Document<unknown, {}, import("./schemas/research-session.schema").ResearchSession, {}, {}> & import("./schemas/research-session.schema").ResearchSession & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }) | null>;
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
    }>;
    deleteResearch(id: string): Promise<void>;
    getResearchPlan(id: string): Promise<{
        objective: string;
        tasks: {
            type: string;
            query: string;
            purpose: string;
        }[];
    } | null>;
    getResearchSources(id: string, query: SourceQueryDto): Promise<{
        data: (import("mongoose").Document<unknown, {}, import("mongoose").Document<unknown, {}, Source, {}, {}> & Source & {
            _id: import("mongoose").Types.ObjectId;
        } & {
            __v: number;
        }, {}, {}> & import("mongoose").Document<unknown, {}, Source, {}, {}> & Source & {
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
    }>;
}
