import { SerpApiService } from '../../serpapi/serpapi.service';
import { NormalizedSearchResult } from '../../common/interfaces/research.interface';
export interface ResearcherTaskResult {
    taskIndex: number;
    query: string;
    searchType: string;
    results: NormalizedSearchResult[];
    error: string | null;
}
export declare class ResearcherAgent {
    private readonly serpApiService;
    private readonly logger;
    constructor(serpApiService: SerpApiService);
    executeTask(task: {
        type: string;
        query: string;
        purpose: string;
    }, maxResults: number, taskIndex: number, includeScholar: boolean): Promise<ResearcherTaskResult>;
    executeAllTasks(tasks: Array<{
        type: string;
        query: string;
        purpose: string;
    }>, maxResults: number, includeScholar: boolean): Promise<ResearcherTaskResult[]>;
    private resolveSearchType;
}
