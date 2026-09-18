export interface SerpApiResult {
    title: string;
    link: string;
    snippet: string;
    source: string;
    date: string;
    position: number;
}
export interface SerpApiNewsResult {
    title: string;
    link: string;
    snippet: string;
    source: string;
    date: string;
    position: number;
}
export interface SerpApiScholarResult {
    title: string;
    link: string;
    snippet: string;
    publication_info?: {
        summary: string;
        authors: string[];
    };
    year?: string;
    position: number;
}
export interface SerpApiResponse {
    search_metadata: {
        id: string;
        status: string;
        json_endpoint: string;
    };
    search_parameters: {
        engine: string;
        q: string;
    };
    organic_results?: SerpApiResult[];
    news_results?: SerpApiNewsResult[];
    organic_results_scholar?: SerpApiScholarResult[];
    error?: string;
}
export interface SerpApiSearchOptions {
    num?: number;
    start?: number;
    gl?: string;
    hl?: string;
    tbs?: string;
    safe?: string;
}
