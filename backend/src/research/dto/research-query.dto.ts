import { IsOptional, IsInt, Min, Max, IsString, IsEnum } from 'class-validator';
import { ResearchStatus } from '../../common/enums/research-status.enum';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class ResearchQueryDto {
  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  @IsInt()
  @Min(1)
  page?: number;

  @ApiPropertyOptional({ default: 10 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number;

  @ApiPropertyOptional({ enum: ResearchStatus })
  @IsOptional()
  @IsEnum(ResearchStatus)
  status?: ResearchStatus;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  search?: string;
}
