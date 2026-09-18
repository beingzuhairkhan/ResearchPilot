import { IsString, IsOptional, IsEnum, IsInt, Min, Max, IsBoolean } from 'class-validator';
import { ResearchMode } from '../../common/enums/research-mode.enum';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateResearchDto {
  @ApiProperty({ example: 'Research the current adoption of Generative AI in Indian IT companies' })
  @IsString()
  question!: string;

  @ApiPropertyOptional({ enum: ResearchMode, default: ResearchMode.DEEP })
  @IsOptional()
  @IsEnum(ResearchMode)
  mode?: ResearchMode;

  @ApiPropertyOptional({ default: 30, minimum: 1, maximum: 50 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(50)
  maxSources?: number;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  includeNews?: boolean;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  includeScholar?: boolean;
}
