import { Module } from '@nestjs/common';
import { ResearchEventsService } from './research-events.service';

@Module({
  providers: [ResearchEventsService],
  exports: [ResearchEventsService],
})
export class EventsModule {}
