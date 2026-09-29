import { apiClient } from './api';
import { RiskAssessmentResponse, LandfallRiskBreakdown } from '../types/cyclone';

export const riskApi = {
  getRiskAssessment: async (cycloneId: string = 'cyclone_dana'): Promise<RiskAssessmentResponse> => {
    const res = await apiClient.get<RiskAssessmentResponse>(`/risk/${cycloneId}`);
    return res.data;
  },

  getLandfallRisk: async (cycloneId: string = 'cyclone_dana'): Promise<LandfallRiskBreakdown> => {
    const res = await apiClient.get<LandfallRiskBreakdown>(`/risk/landfall/${cycloneId}`);
    return res.data;
  }
};

export default riskApi;
