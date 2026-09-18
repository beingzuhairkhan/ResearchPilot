import { Injectable, Logger } from '@nestjs/common';
import { ComparisonAgent } from './comparison.agent';
import { ComparisonResult, Claim } from '../../common/interfaces/research.interface';

@Injectable()
export class ComparisonService {
  private readonly logger = new Logger(ComparisonService.name);

  constructor(private readonly comparisonAgent: ComparisonAgent) {}

  async compare(claims: Claim[], question: string): Promise<ComparisonResult> {
    return this.comparisonAgent.compare(claims, question);
  }
}
