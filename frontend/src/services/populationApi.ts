import { apiClient } from './api';
import { PopulationExposure } from '../types/cyclone';

export const populationApi = {
  getPopulationExposure: async (cycloneId: string = 'cyclone_dana'): Promise<PopulationExposure> => {
    const res = await apiClient.get<PopulationExposure>('/population', {
      params: { cyclone_id: cycloneId }
    });
    return res.data;
  }
};

export default populationApi;
