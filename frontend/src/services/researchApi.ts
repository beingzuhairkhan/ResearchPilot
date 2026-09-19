import { api } from './api';
import type {
  ResearchSession,
  ResearchPlan,
  Source,
  Report,
  ResearchMode,
  PaginatedResponse,
} from '@/types/research';


export const researchApi = {
  async createResearch(question: string, mode: ResearchMode): Promise<{ researchId: string; status: string }> {
  
    const { data } = await api.post('/research', { question, mode });
    return data;
  },

  async getResearch(id: string): Promise<ResearchSession> {
   
    const { data } = await api.get(`/research/${id}`);
    //  console.log("Data" , data.data)
    return data;
  },

  async getResearchPlan(id: string): Promise<ResearchPlan> {
   
    const { data } = await api.get(`/research/${id}/plan`);
    return data;
  },

  async getResearchSources(id: string): Promise<Source[]> {
  
    const { data } = await api.get(`/research/${id}/sources`);
    return data;
  },

  async getResearchReport(id: string): Promise<Report> {
    
    const { data } = await api.get(`/research/${id}/report`);
    return data;
  },

  async getResearchHistory(page = 1, limit = 12): Promise<PaginatedResponse<ResearchSession>> {
   
    const { data } = await api.get('/research', { params: { page, limit } });
    return data;
  },

  async deleteResearch(id: string): Promise<void> {
    await api.delete(`/research/${id}`);
  },
};
