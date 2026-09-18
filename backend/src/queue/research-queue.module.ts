import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull'; 
import { ResearchQueueService } from './research.queue';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'research', 
    }),
  ],
  providers: [ResearchQueueService],
  exports: [ResearchQueueService],
})
export class ResearchQueueModule {}