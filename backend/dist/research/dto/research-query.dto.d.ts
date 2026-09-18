import { ResearchStatus } from '../../common/enums/research-status.enum';
export declare class ResearchQueryDto {
    page?: number;
    limit?: number;
    status?: ResearchStatus;
    search?: string;
}
