import { ComparisonAgent } from './comparison.agent';
import { ComparisonResult, Claim } from '../../common/interfaces/research.interface';
export declare class ComparisonService {
    private readonly comparisonAgent;
    private readonly logger;
    constructor(comparisonAgent: ComparisonAgent);
    compare(claims: Claim[], question: string): Promise<ComparisonResult>;
}
