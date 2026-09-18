import { IsOptional, IsInt, Min, Max, IsEnum } from 'class-validator';
import { SourceType } from '../../common/enums/source-type.enum';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class SourceQueryDto {
  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  @IsInt()
  @Min(1)
  page?: number;

  @ApiPropertyOptional({ default: 20 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number;

  @ApiPropertyOptional({ enum: SourceType })
  @IsOptional()
  @IsEnum(SourceType)
  sourceType?: SourceType;
}
