import { Model } from 'mongoose';
import { Report, ReportDocument } from './schemas/report.schema';
import { ResearchRepository } from '../research/research.repository';
export declare class ReportsService {
    private reportModel;
    private readonly researchRepository;
    private readonly logger;
    constructor(reportModel: Model<ReportDocument>, researchRepository: ResearchRepository);
    getReport(researchId: string): Promise<import("mongoose").Document<unknown, {}, import("mongoose").Document<unknown, {}, Report, {}, {}> & Report & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, {}, {}> & import("mongoose").Document<unknown, {}, Report, {}, {}> & Report & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    } & Required<{
        _id: import("mongoose").Types.ObjectId;
    }>>;
    getReportMetrics(researchId: string): Promise<Record<string, unknown> | null>;
}
