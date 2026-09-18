import { HydratedDocument } from 'mongoose';
export declare class Report {
    researchId: string;
    title: string;
    executiveSummary: string;
    keyFindings: string[];
    recentDevelopments: Array<{
        text: string;
        citations: string[];
    }>;
    conflictingEvidence: Array<{
        topic: string;
        claimA: string;
        sourceA: string;
        claimB: string;
        sourceB: string;
        possibleReason: string;
    }>;
    methodology: string;
    limitations: string;
    sources: Array<{
        citationNumber: number;
        title: string;
        url: string;
        domain: string;
        publishedAt: string | null;
    }>;
    metrics: Record<string, unknown> | null;
    claims: Array<{
        claim: string;
        importance: string;
        supportingSources: string[];
        evidence: Array<{
            sourceId: string;
            quote: string;
            reason: string;
        }>;
    }>;
}
export type ReportDocument = HydratedDocument<Report>;
export declare const ReportSchema: import("mongoose").Schema<Report, import("mongoose").Model<Report, any, any, any, import("mongoose").Document<unknown, any, Report, any, {}> & Report & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Report, import("mongoose").Document<unknown, {}, import("mongoose").FlatRecord<Report>, {}, import("mongoose").DefaultSchemaOptions> & import("mongoose").FlatRecord<Report> & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}>;
