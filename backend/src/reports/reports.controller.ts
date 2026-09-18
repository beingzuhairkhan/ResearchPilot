import { Controller, Get, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ReportsService } from './reports.service';

@ApiTags('reports')
@Controller('research/:id/report')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get()
  @ApiOperation({ summary: 'Get the generated research report' })
  @ApiResponse({ status: 200, description: 'Research report with citations and metrics' })
  async getReport(@Param('id') id: string) {
    const report = await this.reportsService.getReport(id);
    return { success: true, data: report };
  }
}
