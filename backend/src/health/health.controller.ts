import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { HealthService } from './health.service';

@ApiTags('health')
@Controller('health')
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Get()
  @ApiOperation({ summary: 'Check health of all services' })
  @ApiResponse({
    status: 200,
    description: 'Health status of API, MongoDB, Redis, Pinecone, SerpApi',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'string', example: 'ok' },
        services: {
          type: 'object',
          properties: {
            mongodb: { type: 'string', example: 'up' },
            redis: { type: 'string', example: 'up' },
            pinecone: { type: 'string', example: 'configured' },
            serpapi: { type: 'string', example: 'configured' },
          },
        },
      },
    },
  })
  async checkHealth() {
    return this.healthService.checkHealth();
  }
}
