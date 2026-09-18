import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { OpenAiLlmProvider, MockLlmProvider } from './llm.service';
import { LlmProvider } from './interfaces/llm-provider.interface';

@Module({
  providers: [
    {
      provide: 'LLM_PROVIDER',
      useFactory: (configService: ConfigService): LlmProvider => {
        const isMock = configService.get<boolean>('mockExternalServices', false);
        if (isMock) {
          return new MockLlmProvider();
        }
        return new OpenAiLlmProvider(configService);
      },
      inject: [ConfigService],
    },
  ],
  exports: ['LLM_PROVIDER'],
})
export class LlmModule {}
