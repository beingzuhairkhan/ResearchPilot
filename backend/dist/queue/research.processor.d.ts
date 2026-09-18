import { ResearchOrchestratorService } from '../agents/orchestrator/research-orchestrator.service';
export declare class ResearchProcessorService {
    private readonly orchestrator;
    private readonly logger;
    constructor(orchestrator: ResearchOrchestratorService);
    process(researchId: string): Promise<void>;
}
