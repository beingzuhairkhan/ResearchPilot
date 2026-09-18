import { Injectable, Logger } from '@nestjs/common';
import { PlannerAgent } from './planner.agent';
import { ResearchPlan } from '../../common/interfaces/research.interface';
import { ResearchMode } from '../../common/enums/research-mode.enum';

@Injectable()
export class PlannerService {
  private readonly logger = new Logger(PlannerService.name);

  constructor(private readonly plannerAgent: PlannerAgent) {}

  async plan(
    question: string,
    mode: ResearchMode,
    includeNews: boolean,
    includeScholar: boolean,
  ): Promise<ResearchPlan> {
    return this.plannerAgent.createPlan(question, mode, includeNews, includeScholar);
  }
}
