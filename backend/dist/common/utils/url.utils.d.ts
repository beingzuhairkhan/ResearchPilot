export declare function normalizeUrl(rawUrl: string): string;
export declare function getCanonicalUrl(rawUrl: string): string;
export declare function getDomain(rawUrl: string): string;
export declare function generateContentHash(content: string): string;
export declare function generateUrlHash(url: string): string;
export declare function isSimilarTitle(titleA: string, titleB: string, threshold?: number): boolean;
export declare function isRecentDate(date: Date | string | null, monthsThreshold?: number): boolean;
export declare function extractDomainFromUrl(url: string): string;
