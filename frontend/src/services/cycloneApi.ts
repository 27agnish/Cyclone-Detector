import { apiClient } from './api';
import { CycloneSummary, CycloneDetail, ForecastCone, LandfallInfo, LandfallZone, PopulationExposure } from '../types/cyclone';

export const cycloneApi = {
  getActiveCyclones: async (): Promise<CycloneSummary[]> => {
    const res = await apiClient.get<CycloneSummary[]>('/cyclones/active');
    return res.data;
  },

  getAllCyclones: async (): Promise<CycloneSummary[]> => {
    const res = await apiClient.get<CycloneSummary[]>('/cyclones');
    return res.data;
  },

  detectCyclones: async (forceRefresh: boolean = false) => {
    const res = await apiClient.get('/cyclones/detect', { params: { force_refresh: forceRefresh } });
    return res.data;
  },

  refreshCycloneData: async () => {
    const res = await apiClient.post('/cyclones/refresh');
    return res.data;
  },

  getCycloneById: async (id: string): Promise<CycloneDetail> => {
    const res = await apiClient.get<CycloneDetail>(`/cyclones/${id}`);
    return res.data;
  },

  getTrack: async (id: string) => {
    const res = await apiClient.get(`/cyclones/${id}/track`);
    return res.data;
  },

  getForecast: async (id: string) => {
    const res = await apiClient.get(`/cyclones/${id}/forecast`);
    return res.data;
  },

  getForecastCone: async (id: string): Promise<ForecastCone> => {
    const res = await apiClient.get<ForecastCone>(`/cyclones/${id}/forecast-cone`);
    return res.data;
  },

  getLandfall: async (id: string): Promise<LandfallInfo> => {
    const res = await apiClient.get<LandfallInfo>(`/cyclones/${id}/landfall`);
    return res.data;
  },

  getLandfallZone: async (id: string): Promise<LandfallZone> => {
    const res = await apiClient.get<LandfallZone>(`/cyclones/${id}/landfall-zone`);
    return res.data;
  },

  getImpact: async (id: string) => {
    const res = await apiClient.get(`/cyclones/${id}/impact`);
    return res.data;
  },

  getPopulationExposure: async (cycloneId: string): Promise<PopulationExposure> => {
    const res = await apiClient.get<PopulationExposure>('/population', { params: { cyclone_id: cycloneId } });
    return res.data;
  },

  getTrackGeoJson: async (cycloneId: string) => {
    const res = await apiClient.get('/map/cyclone-track', { params: { cyclone_id: cycloneId } });
    return res.data;
  },

  getRiskZonesGeoJson: async (cycloneId: string) => {
    const res = await apiClient.get('/map/risk-zones', { params: { cyclone_id: cycloneId } });
    return res.data;
  },

  getInfrastructureGeoJson: async (cycloneId: string) => {
    const res = await apiClient.get('/map/infrastructure', { params: { cyclone_id: cycloneId } });
    return res.data;
  }
};
