export interface LlmMessage {
    role: 'system' | 'user' | 'assistant';
    content: string;
}
export interface LlmCompletionRequest {
    messages: LlmMessage[];
    temperature?: number;
    maxTokens?: number;
    jsonMode?: boolean;
}
export interface LlmCompletionResponse {
    content: string;
    usage: {
        promptTokens: number;
        completionTokens: number;
        totalTokens: number;
    };
}
export interface LlmProvider {
    complete(request: LlmCompletionRequest): Promise<LlmCompletionResponse>;
}
