import { ReportsService } from './reports.service';
export declare class ReportsController {
    private readonly reportsService;
    constructor(reportsService: ReportsService);
    getReport(id: string): Promise<{
        success: boolean;
        data: import("mongoose").Document<unknown, {}, import("mongoose").Document<unknown, {}, import("./schemas/report.schema").Report, {}, {}> & import("./schemas/report.schema").Report & {
            _id: import("mongoose").Types.ObjectId;
        } & {
            __v: number;
        }, {}, {}> & import("mongoose").Document<unknown, {}, import("./schemas/report.schema").Report, {}, {}> & import("./schemas/report.schema").Report & {
            _id: import("mongoose").Types.ObjectId;
        } & {
            __v: number;
        } & Required<{
            _id: import("mongoose").Types.ObjectId;
        }>;
    }>;
}
