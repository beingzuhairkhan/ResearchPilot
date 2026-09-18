import { IsString, IsOptional, IsInt, Min, Max } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class SerpApiSearchDto {
  @ApiPropertyOptional()
  @IsString()
  query!: string;

  @ApiPropertyOptional({ default: 10, minimum: 1, maximum: 100 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  num?: number;

  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  @IsInt()
  start?: number;

  @ApiPropertyOptional({ default: 'in' })
  @IsOptional()
  @IsString()
  gl?: string;

  @ApiPropertyOptional({ default: 'en' })
  @IsOptional()
  @IsString()
  hl?: string;
}
