import { ConfigService } from '@nestjs/config';
import { LlmCompletionRequest, LlmCompletionResponse, LlmProvider } from './interfaces/llm-provider.interface';
export declare class OpenAiLlmProvider implements LlmProvider {
    private readonly configService;
    private readonly logger;
    private readonly client;
    private readonly model;
    constructor(configService: ConfigService);
    complete(request: LlmCompletionRequest): Promise<LlmCompletionResponse>;
}
export declare class MockLlmProvider implements LlmProvider {
    private readonly logger;
    complete(request: LlmCompletionRequest): Promise<LlmCompletionResponse>;
    private generateMockResponse;
}
