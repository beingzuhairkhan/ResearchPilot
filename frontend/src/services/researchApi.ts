import { api } from './api';
import { mockApi } from './mockApi';
import type {
  ResearchSession,
  ResearchPlan,
  Source,
  Report,
  ResearchMode,
  PaginatedResponse,
} from '@/types/research';

const useMock = mockApi.isEnabled;

export const researchApi = {
  async createResearch(question: string, mode: ResearchMode): Promise<{ researchId: string; status: string }> {
    if (useMock) return mockApi.createResearch(question, mode);
    const { data } = await api.post('/research', { question, mode });
    return data;
  },

  async getResearch(id: string): Promise<ResearchSession> {
    if (useMock) return mockApi.getResearch(id);
    const { data } = await api.get(`/research/${id}`);
    //  console.log("Data" , data.data)
    return data;
  },

  async getResearchPlan(id: string): Promise<ResearchPlan> {
    if (useMock) return mockApi.getResearchPlan(id);
    const { data } = await api.get(`/research/${id}/plan`);
    return data;
  },

  async getResearchSources(id: string): Promise<Source[]> {
    if (useMock) return mockApi.getResearchSources(id);
    const { data } = await api.get(`/research/${id}/sources`);
    return data;
  },

  async getResearchReport(id: string): Promise<Report> {
    if (useMock) return mockApi.getResearchReport(id);
    const { data } = await api.get(`/research/${id}/report`);
    return data;
  },

  async getResearchHistory(page = 1, limit = 12): Promise<PaginatedResponse<ResearchSession>> {
    if (useMock) return mockApi.getResearchHistory(page, limit);
    const { data } = await api.get('/research', { params: { page, limit } });
    return data;
  },

  async deleteResearch(id: string): Promise<void> {
    if (useMock) return mockApi.deleteResearch(id);
    await api.delete(`/research/${id}`);
  },
};
