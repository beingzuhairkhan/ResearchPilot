import { Injectable, Logger } from '@nestjs/common';
import { ResearcherAgent, ResearcherTaskResult } from './researcher.agent';

@Injectable()
export class ResearcherService {
  private readonly logger = new Logger(ResearcherService.name);

  constructor(private readonly researcherAgent: ResearcherAgent) {}

  async executeTasks(
    tasks: Array<{ type: string; query: string; purpose: string }>,
    maxResults: number,
    includeScholar: boolean,
  ): Promise<ResearcherTaskResult[]> {
    return this.researcherAgent.executeAllTasks(tasks, maxResults, includeScholar);
  }
}
