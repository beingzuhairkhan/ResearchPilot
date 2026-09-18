import { Injectable, Logger } from '@nestjs/common';
import { ReporterAgent, ReportInput } from './reporter.agent';
import { ReportData } from '../../common/interfaces/research.interface';

@Injectable()
export class ReporterService {
  private readonly logger = new Logger(ReporterService.name);

  constructor(private readonly reporterAgent: ReporterAgent) {}

  async generateReport(input: ReportInput): Promise<ReportData> {
    return this.reporterAgent.generateReport(input);
  }
}
