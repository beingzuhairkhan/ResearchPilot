import { Injectable, Logger } from '@nestjs/common';
import { SerpApiService } from '../../serpapi/serpapi.service';
import { NormalizedSearchResult } from '../../common/interfaces/research.interface';
import { SearchType } from '../../common/enums/source-type.enum';

export interface ResearcherTaskResult {
  taskIndex: number;
  query: string;
  searchType: string;
  results: NormalizedSearchResult[];
  error: string | null;
}

@Injectable()
export class ResearcherAgent {
  private readonly logger = new Logger(ResearcherAgent.name);

  constructor(private readonly serpApiService: SerpApiService) {}

  async executeTask(
    task: { type: string; query: string; purpose: string },
    maxResults: number,
  taskIndex: number,
  includeScholar: boolean,
  ): Promise<ResearcherTaskResult> {
    const searchType = this.resolveSearchType(task.type, includeScholar);
    this.logger.log(`[Researcher] Executing search type=${searchType} query="${task.query}"`);

    try {
      const results = await this.serpApiService.search(task.query, searchType, {
        num: Math.min(maxResults, 10),
      });
      this.logger.log(`[Researcher] Got ${results.length} results for query="${task.query}"`);
      return { taskIndex, query: task.query, searchType, results, error: null };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Search failed';
      this.logger.warn(`[Researcher] Search failed for query="${task.query}": ${message}`);
      return { taskIndex, query: task.query, searchType, results: [], error: message };
    }
  }

  async executeAllTasks(
    tasks: Array<{ type: string; query: string; purpose: string }>,
    maxResults: number,
    includeScholar: boolean,
  ): Promise<ResearcherTaskResult[]> {
    const results: ResearcherTaskResult[] = [];
    for (let i = 0; i < tasks.length; i++) {
      const result = await this.executeTask(tasks[i], maxResults, i, includeScholar);
      results.push(result);
    }
    return results;
  }

  private resolveSearchType(type: string, includeScholar: boolean): SearchType {
    const lower = type.toLowerCase();
    if (lower === 'news') return SearchType.NEWS;
    if (lower === 'scholar' || lower === 'research') {
      return includeScholar ? SearchType.SCHOLAR : SearchType.WEB;
    }
    if (lower === 'company' || lower === 'web') return SearchType.WEB;
    return SearchType.WEB;
  }
}
