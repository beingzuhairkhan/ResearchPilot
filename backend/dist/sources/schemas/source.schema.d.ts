import { HydratedDocument } from 'mongoose';
import { SourceType, ContentStatus } from '../../common/enums/source-type.enum';
export declare class Source {
    researchId: string;
    title: string;
    url: string;
    canonicalUrl: string;
    domain: string;
    snippet: string;
    content: string;
    sourceType: SourceType;
    author: string | null;
    publishedAt: Date | null;
    discoveredAt: Date;
    searchQuery: string;
    relevanceScore: number;
    contentStatus: ContentStatus;
    hash: string;
}
export type SourceDocument = HydratedDocument<Source>;
export declare const SourceSchema: import("mongoose").Schema<Source, import("mongoose").Model<Source, any, any, any, import("mongoose").Document<unknown, any, Source, any, {}> & Source & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Source, import("mongoose").Document<unknown, {}, import("mongoose").FlatRecord<Source>, {}, import("mongoose").DefaultSchemaOptions> & import("mongoose").FlatRecord<Source> & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}>;
