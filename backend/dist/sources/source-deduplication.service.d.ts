import { Model } from 'mongoose';
import { SourceDocument } from './schemas/source.schema';
export declare class SourceDeduplicationService {
    private readonly logger;
    deduplicate(researchId: string, sourceModel: Model<SourceDocument>): Promise<SourceDocument[]>;
}
