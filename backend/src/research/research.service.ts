import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Source, SourceDocument } from '../sources/schemas/source.schema';
import { Report, ReportDocument } from '../reports/schemas/report.schema';
import { ResearchRepository } from './research.repository';
import { CreateResearchDto } from './dto/create-research.dto';
import { ResearchQueryDto } from './dto/research-query.dto';
import { SourceQueryDto } from './dto/source-query.dto';
import { ResearchStatus } from '../common/enums/research-status.enum';
import { ResearchMode } from '../common/enums/research-mode.enum';
import { ResearchEventsService } from '../events/research-events.service';
import { ResearchQueueService } from '../queue/research.queue';
import { normalizeWhitespace } from '../common/utils/text.utils';

@Injectable()
export class ResearchService {
  private readonly logger = new Logger(ResearchService.name);

  constructor(
    private readonly repository: ResearchRepository,
    private readonly eventsService: ResearchEventsService,
    private readonly queueService: ResearchQueueService,
    private readonly configService: ConfigService,
    @InjectModel(Source.name) private sourceModel: Model<SourceDocument>,
    @InjectModel(Report.name) private reportModel: Model<ReportDocument>,
  ) { }

  async createResearch(dto: CreateResearchDto): Promise<{ researchId: string; status: string }> {
    if (!dto.question || dto.question.trim().length < 10) {
      throw new BadRequestException('Research question must be at least 10 characters long');
    }

    const mode = dto.mode || ResearchMode.DEEP;
    const maxSources =
      dto.maxSources ||
      (mode === ResearchMode.QUICK
        ? this.configService.get<number>('sources.maxQuick', 10)
        : this.configService.get<number>('sources.maxDeep', 30));

    const normalizedQuestion = normalizeWhitespace(dto.question);

    const session = await this.repository.createSession({
      question: dto.question.trim(),
      normalizedQuestion,
      status: ResearchStatus.QUEUED,
      mode,
      progress: 0,
      currentStep: 'queued',
      maxSources,
      includeNews: dto.includeNews ?? true,
      includeScholar: dto.includeScholar ?? false,
    });

    const researchId = session._id.toString();
    this.logger.log(`[Research] Created researchId=${researchId} question="${dto.question}"`);

    this.eventsService.publish(
      researchId,
      'research.created',
      0,
      'Research session created',
    );


    await this.queueService.addResearchJob(researchId);

    return { researchId, status: ResearchStatus.QUEUED };
  }

  async getResearch(id: string) {
    const session = await this.repository.findSessionById(id);
    if (!session) {
      return null;
    }
    return session;
  }

  async getResearchHistory(query: ResearchQueryDto) {
    const page = query.page || 1;
    const limit =query.limit || 10;
    const { sessions, total } = await this.repository.findSessionsPaginated(
      page,
      limit,
      query.status,
      query.search,
    );
    return {
      data: sessions,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async deleteResearch(id: string): Promise<void> {
    const session = await this.repository.findSessionById(id);
    if (!session) {
      return;
    }
    await this.sourceModel.deleteMany({ researchId: id }).exec();
    await this.reportModel.deleteMany({ researchId: id }).exec();
    await this.repository.deleteSession(id);
    this.logger.log(`[Research] Deleted researchId=${id}`);
  }

  async getResearchPlan(id: string) {
    const session = await this.repository.findSessionById(id);
    if (!session) {
      return null;
    }
    const tasks = await this.repository.findTasksByResearchId(id);
    return {
      objective: session.plan?.objective || '',
      tasks: tasks.map((t) => ({
        type: t.type,
        query: t.query,
        purpose: t.purpose,
      })),
    };
  }

  async getResearchSources(id: string, query: SourceQueryDto) {
    const page = query.page || 1;
    const limit = query.limit || 20;
    const skip = (page - 1) * limit;
    const filter: Record<string, unknown> = { researchId: id };
    if (query.sourceType) {
      filter.sourceType = query.sourceType;
    }
    const [sources, total] = await Promise.all([
      this.sourceModel.find(filter).sort({ relevanceScore: -1 }).skip(skip).limit(limit).exec(),
      this.sourceModel.countDocuments(filter).exec(),
    ]);
    return {
      data: sources,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }
}
