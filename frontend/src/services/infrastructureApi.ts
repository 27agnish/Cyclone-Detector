import { apiClient } from './api';
import { InfrastructureSummary, InfrastructureAsset } from '../types/cyclone';

export const infrastructureApi = {
  getInfrastructure: async (cycloneId: string = 'cyclone_dana', type?: string): Promise<InfrastructureSummary> => {
    const res = await apiClient.get<InfrastructureSummary>('/infrastructure', {
      params: { cyclone_id: cycloneId, type }
    });
    return res.data;
  },

  getAssetById: async (assetId: string, cycloneId: string = 'cyclone_dana'): Promise<InfrastructureAsset> => {
    const res = await apiClient.get<InfrastructureAsset>(`/infrastructure/${assetId}`, {
      params: { cyclone_id: cycloneId }
    });
    return res.data;
  }
};
