declare const _default: () => {
    nodeEnv: string;
    port: number;
    mongodb: {
        uri: string;
    };
    redis: {
        url: string;
    };
    serpapi: {
        apiKey: string;
    };
    llm: {
        apiKey: string;
        model: string;
    };
    embedding: {
        apiKey: string;
        model: string;
    };
    pinecone: {
        apiKey: string;
        index: string;
        namespace: string;
    };
    rag: {
        chunkSize: number;
        chunkOverlap: number;
    };
    sources: {
        maxQuick: number;
        maxDeep: number;
        fetchTimeout: number;
    };
    mockExternalServices: boolean;
};
export default _default;
