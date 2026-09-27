import { create } from 'zustand';
import { 
  CycloneSummary, 
  CycloneDetail, 
  InfrastructureSummary, 
  InfrastructureAsset, 
  PopulationExposure, 
  AIResponse,
  TrackPoint
} from '../types/cyclone';
import { cycloneApi } from '../services/cycloneApi';
import { infrastructureApi } from '../services/infrastructureApi';
import { env } from '../config/env';

interface CycloneStoreState {
  activeCyclones: CycloneSummary[];
  selectedCycloneId: string;
  cycloneDetail: CycloneDetail | null;
  infrastructure: InfrastructureSummary | null;
  populationExposure: PopulationExposure | null;
  selectedAsset: InfrastructureAsset | null;
  
  // Timeline Animation
  timelineStepIndex: number;
  currentFramePoint: TrackPoint | null;
  isPlaying: boolean;
  playbackSpeed: number; // ms per step

  // Navigation & Modals
  activeTab: 'dashboard' | 'cyclones' | 'analysis' | 'infrastructure' | 'population' | 'emergency' | 'satellite' | 'reports';
  isAiLoading: boolean;
  aiModalOpen: boolean;
  aiModalData: AIResponse | null;
  mapViewMode: 'dark' | 'satellite' | 'light';

  // Layer Toggles
  layers: {
    observedPath: boolean;
    forecastPath: boolean;
    forecastCone: boolean;
    landfallZone: boolean;
    infrastructure: boolean;
    population: boolean;
    hospitals: boolean;
    power: boolean;
    bridges: boolean;
    shelters: boolean;
    water: boolean;
    radarSwath: boolean;
  };

  // Status & Meta
  isLoading: boolean;
  statusMessage: string;
  lastUpdated: string;
  error: string | null;

  // Actions
  fetchInitialData: () => Promise<void>;
  selectCyclone: (cycloneId: string) => Promise<void>;
  refreshAllData: () => Promise<void>;
  setSelectedAsset: (asset: InfrastructureAsset | null) => void;
  toggleLayer: (layerName: keyof CycloneStoreState['layers']) => void;
  setActiveTab: (tab: CycloneStoreState['activeTab']) => void;
  setMapViewMode: (mode: 'dark' | 'satellite' | 'light') => void;
  setTimelineStep: (index: number) => void;
  setIsPlaying: (playing: boolean) => void;
  openAiModal: (data: AIResponse) => void;
  closeAiModal: () => void;
  setIsAiLoading: (loading: boolean) => void;
}

export const useCycloneStore = create<CycloneStoreState>((set, get) => ({
  activeCyclones: [],
  selectedCycloneId: 'cyclone_dana',
  cycloneDetail: null,
  infrastructure: null,
  populationExposure: null,
  selectedAsset: null,

  timelineStepIndex: 0,
  currentFramePoint: null,
  isPlaying: false,
  playbackSpeed: 1600,

  activeTab: 'dashboard',
  isAiLoading: false,
  aiModalOpen: false,
  aiModalData: null,
  mapViewMode: 'dark',

  layers: {
    observedPath: true,
    forecastPath: true,
    forecastCone: true,
    landfallZone: true,
    infrastructure: true,
    population: true,
    hospitals: true,
    power: true,
    bridges: true,
    shelters: true,
    water: true,
    radarSwath: false,
  },

  isLoading: true,
  statusMessage: 'Detecting active cyclones...',
  lastUpdated: new Date().toLocaleTimeString(),
  error: null,

  fetchInitialData: async () => {
    set({ isLoading: true, error: null });
    try {
      // 1. Detect cyclones
      const detectRes = await cycloneApi.detectCyclones();
      const cyclones: CycloneSummary[] = detectRes.cyclones || [];
      const defaultId = cyclones.length > 0 ? cyclones[0].id : 'cyclone_dana';

      // 2. Fetch selected cyclone details
      const detail = await cycloneApi.getCycloneById(defaultId);
      const infra = await infrastructureApi.getInfrastructure(defaultId);
      const pop = await cycloneApi.getPopulationExposure(defaultId);

      // Default frame to current cyclone position (last observed point)
      const currentPoint = detail.observed_track.length > 0 
        ? detail.observed_track[detail.observed_track.length - 1] 
        : null;

      set({
        activeCyclones: cyclones,
        selectedCycloneId: defaultId,
        cycloneDetail: detail,
        infrastructure: infra,
        populationExposure: pop,
        currentFramePoint: currentPoint,
        timelineStepIndex: detail.observed_track.length > 0 ? detail.observed_track.length - 1 : 0,
        statusMessage: cyclones.length > 0 ? 'CYCLONE DETECTED' : 'NO ACTIVE CYCLONE DETECTED',
        lastUpdated: detail.last_updated || new Date().toLocaleTimeString(),
        isLoading: false
      });
    } catch (err: any) {
      console.error('[CycloneShield] Failed to load initial cyclone data:', err);
      const targetUrl = env.API_V1_BASE_URL;
      const status = err.response?.status;
      const statusText = err.response?.statusText;
      const errMsg = err.message || 'Unknown network error';
      
      let userFriendlyError = `Unable to connect to CycloneShield backend (${targetUrl}). ${errMsg}`;
      if (status) {
        userFriendlyError = `Backend returned HTTP ${status}${statusText ? ` (${statusText})` : ''} at ${targetUrl}`;
      } else if (env.IS_PRODUCTION && (!targetUrl || targetUrl.includes('localhost') || targetUrl.includes('127.0.0.1'))) {
        userFriendlyError = `Production backend URL is not configured. Please set VITE_API_BASE_URL in your Vercel Project Settings > Environment Variables to your deployed backend URL.`;
      }
      
      set({ 
        error: userFriendlyError,
        isLoading: false 
      });
    }
  },

  selectCyclone: async (cycloneId: string) => {
    set({ isLoading: true });
    try {
      const detail = await cycloneApi.getCycloneById(cycloneId);
      const infra = await infrastructureApi.getInfrastructure(cycloneId);
      const pop = await cycloneApi.getPopulationExposure(cycloneId);
      
      const currentPoint = detail.observed_track.length > 0 
        ? detail.observed_track[detail.observed_track.length - 1] 
        : null;

      set({
        selectedCycloneId: cycloneId,
        cycloneDetail: detail,
        infrastructure: infra,
        populationExposure: pop,
        currentFramePoint: currentPoint,
        timelineStepIndex: detail.observed_track.length > 0 ? detail.observed_track.length - 1 : 0,
        isPlaying: false,
        lastUpdated: detail.last_updated,
        isLoading: false
      });
    } catch (err) {
      console.error('Error switching cyclone:', err);
      set({ isLoading: false });
    }
  },

  refreshAllData: async () => {
    set({ isLoading: true });
    try {
      await cycloneApi.refreshCycloneData();
      await get().selectCyclone(get().selectedCycloneId);
    } catch (err) {
      console.error('Error refreshing data:', err);
      set({ isLoading: false });
    }
  },

  setSelectedAsset: (asset) => set({ selectedAsset: asset }),

  toggleLayer: (layerName) =>
    set((state) => ({
      layers: { ...state.layers, [layerName]: !state.layers[layerName] }
    })),

  setActiveTab: (tab) => set({ activeTab: tab }),

  setMapViewMode: (mode) => set({ mapViewMode: mode }),

  setTimelineStep: (index) => {
    const detail = get().cycloneDetail;
    if (!detail) return;
    const allPoints = [...detail.observed_track, ...detail.forecast_track];
    if (index >= 0 && index < allPoints.length) {
      set({
        timelineStepIndex: index,
        currentFramePoint: allPoints[index]
      });
    }
  },

  setIsPlaying: (playing) => set({ isPlaying: playing }),

  openAiModal: (data) => set({ aiModalOpen: true, aiModalData: data }),
  closeAiModal: () => set({ aiModalOpen: false, aiModalData: null }),
  setIsAiLoading: (loading) => set({ isAiLoading: loading })
}));
