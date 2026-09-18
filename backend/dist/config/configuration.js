"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = () => ({
    nodeEnv: process.env.NODE_ENV || 'development',
    port: parseInt(process.env.PORT || '3000', 10),
    mongodb: {
        uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/researchpilot',
    },
    redis: {
        url: process.env.REDIS_URL || 'redis://localhost:6379',
    },
    serpapi: {
        apiKey: process.env.SERPAPI_API_KEY || '',
    },
    llm: {
        apiKey: process.env.LLM_API_KEY || '',
        model: process.env.LLM_MODEL || 'gpt-4o-mini',
    },
    embedding: {
        apiKey: process.env.EMBEDDING_API_KEY || '',
        model: process.env.EMBEDDING_MODEL || 'text-embedding-3-small',
    },
    pinecone: {
        apiKey: process.env.PINECONE_API_KEY || '',
        index: process.env.PINECONE_INDEX || 'researchpilot',
        namespace: process.env.PINECONE_NAMESPACE || 'researchpilot',
    },
    rag: {
        chunkSize: parseInt(process.env.RAG_CHUNK_SIZE || '1000', 10),
        chunkOverlap: parseInt(process.env.RAG_CHUNK_OVERLAP || '150', 10),
    },
    sources: {
        maxQuick: parseInt(process.env.MAX_SOURCES_QUICK || '10', 10),
        maxDeep: parseInt(process.env.MAX_SOURCES_DEEP || '30', 10),
        fetchTimeout: parseInt(process.env.SOURCE_FETCH_TIMEOUT || '10000', 10),
    },
    mockExternalServices: process.env.MOCK_EXTERNAL_SERVICES === 'true',
});
//# sourceMappingURL=configuration.js.map