import { PlannerAgent } from './planner.agent';
import { ResearchPlan } from '../../common/interfaces/research.interface';
import { ResearchMode } from '../../common/enums/research-mode.enum';
export declare class PlannerService {
    private readonly plannerAgent;
    private readonly logger;
    constructor(plannerAgent: PlannerAgent);
    plan(question: string, mode: ResearchMode, includeNews: boolean, includeScholar: boolean): Promise<ResearchPlan>;
}
