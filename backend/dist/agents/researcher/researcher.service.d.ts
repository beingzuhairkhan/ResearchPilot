import { ResearcherAgent, ResearcherTaskResult } from './researcher.agent';
export declare class ResearcherService {
    private readonly researcherAgent;
    private readonly logger;
    constructor(researcherAgent: ResearcherAgent);
    executeTasks(tasks: Array<{
        type: string;
        query: string;
        purpose: string;
    }>, maxResults: number, includeScholar: boolean): Promise<ResearcherTaskResult[]>;
}
