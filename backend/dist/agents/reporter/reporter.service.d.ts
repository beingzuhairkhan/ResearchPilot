import { ReporterAgent, ReportInput } from './reporter.agent';
import { ReportData } from '../../common/interfaces/research.interface';
export declare class ReporterService {
    private readonly reporterAgent;
    private readonly logger;
    constructor(reporterAgent: ReporterAgent);
    generateReport(input: ReportInput): Promise<ReportData>;
}
