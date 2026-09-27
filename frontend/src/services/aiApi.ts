import { apiClient } from './api';
import { AIResponse, EmergencyPriorityResponse } from '../types/cyclone';

export const aiApi = {
  explainRisk: async (cycloneId: string, assetId?: string, district?: string): Promise<AIResponse> => {
    const res = await apiClient.post<AIResponse>('/ai/explain-risk', {
      cyclone_id: cycloneId,
      asset_id: assetId,
      district
    });
    return res.data;
  },

  explainLandfall: async (cycloneId: string): Promise<AIResponse> => {
    const res = await apiClient.post<AIResponse>('/ai/explain-landfall', {
      cyclone_id: cycloneId
    });
    return res.data;
  },

  analyzeSatellite: async (cycloneId: string): Promise<AIResponse> => {
    const res = await apiClient.post<AIResponse>('/ai/analyze-satellite', {
      cyclone_id: cycloneId
    });
    return res.data;
  },

  generateEmergencyPlan: async (cycloneId: string): Promise<EmergencyPriorityResponse> => {
    const res = await apiClient.post<EmergencyPriorityResponse>('/ai/generate-emergency-plan', {
      cyclone_id: cycloneId
    });
    return res.data;
  },

  generateReport: async (cycloneId: string): Promise<AIResponse> => {
    const res = await apiClient.post<AIResponse>('/ai/generate-report', {
      cyclone_id: cycloneId,
      include_satellite: true,
      include_gis_zones: true
    });
    return res.data;
  }
};
