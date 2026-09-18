import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Report, ReportDocument } from './schemas/report.schema';
import { ResearchRepository } from '../research/research.repository';

@Injectable()
export class ReportsService {
  private readonly logger = new Logger(ReportsService.name);

  constructor(
    @InjectModel(Report.name) private reportModel: Model<ReportDocument>,
    private readonly researchRepository: ResearchRepository,
  ) {}

  async getReport(researchId: string) {
    const session = await this.researchRepository.findSessionById(researchId);
    if (!session) {
      throw new NotFoundException('Research session not found');
    }

    const report = await this.reportModel.findOne({ researchId }).exec();
    if (!report) {
      throw new NotFoundException('Report not found or not yet generated');
    }

    return report;
  }

  async getReportMetrics(researchId: string) {
    const report = await this.reportModel.findOne({ researchId }).exec();
    if (!report) {
      throw new NotFoundException('Report not found');
    }
    return report.metrics;
  }
}
