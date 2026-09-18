import { Injectable, Logger } from '@nestjs/common';
import { Inject } from '@nestjs/common';
import { ResearchOrchestratorService } from '../agents/orchestrator/research-orchestrator.service';

@Injectable()
export class ResearchProcessorService {
  private readonly logger = new Logger(ResearchProcessorService.name);

  constructor(
    @Inject(ResearchOrchestratorService)
    private readonly orchestrator: ResearchOrchestratorService,
  ) {}

  async process(researchId: string): Promise<void> {
    this.logger.log(`[Processor] Starting processing for researchId=${researchId}`);
    await this.orchestrator.runResearch(researchId);
  }
}
