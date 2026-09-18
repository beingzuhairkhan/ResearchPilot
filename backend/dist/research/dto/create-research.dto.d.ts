import { ResearchMode } from '../../common/enums/research-mode.enum';
export declare class CreateResearchDto {
    question: string;
    mode?: ResearchMode;
    maxSources?: number;
    includeNews?: boolean;
    includeScholar?: boolean;
}
