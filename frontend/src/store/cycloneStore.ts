import { create } from 'zustand';
import { 
  CycloneSummary, 
  CycloneDetail, 
  InfrastructureSummary, 
  InfrastructureAsset, 
  PopulationExposure, 
  AIResponse,
  TrackPoint,
  HealthCheckResponse,
  RiskAssessmentResponse,
  LandfallRiskBreakdown
} from '../types/cyclone';
import { cycloneApi } from '../services/cycloneApi';
import { riskApi } from '../services/riskApi';
import { infrastructureApi } from '../services/infrastructureApi';
import { populationApi } from '../services/populationApi';
import { env } from '../config/env';

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: 'critical' | 'warning' | 'info';
  timestamp: string;
}

export type TabType = 
  | 'dashboard' 
  | 'cyclones' 
  | 'cyclone-details' 
  | 'analysis' 
  | 'landfall' 
  | 'infrastructure' 
  | 'population' 
  | 'satellite' 
  | 'emergency' 
  | 'ai' 
  | 'reports' 
  | 'settings';

interface CycloneStoreState {
  healthStatus: HealthCheckResponse | null;
  activeCyclones: CycloneSummary[];
  selectedCycloneId: string;
  cycloneDetail: CycloneDetail | null;
  riskAssessment: RiskAssessmentResponse | null;
  landfallRisk: LandfallRiskBreakdown | null;
  infrastructure: InfrastructureSummary | null;
  populationExposure: PopulationExposure | null;
  selectedAsset: InfrastructureAsset | null;
  
  // Timeline Animation
  timelineStepIndex: number;
  currentFramePoint: TrackPoint | null;
  isPlaying: boolean;
  playbackSpeed: number; // ms per step

  // Navigation & Modals
  activeTab: TabType;
  isAiLoading: boolean;
  aiModalOpen: boolean;
  aiModalData: AIResponse | null;
  mapViewMode: 'dark' | 'satellite' | 'light';
  isSidebarCollapsed: boolean;

  // Search & Notifications
  searchQuery: string;
  notifications: AppNotification[];

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
  setActiveTab: (tab: TabType) => void;
  setMapViewMode: (mode: 'dark' | 'satellite' | 'light') => void;
  setTimelineStep: (index: number) => void;
  setIsPlaying: (playing: boolean) => void;
  openAiModal: (data: AIResponse) => void;
  closeAiModal: () => void;
  setIsAiLoading: (loading: boolean) => void;
  toggleSidebar: () => void;
  setSearchQuery: (query: string) => void;
  dismissNotification: (id: string) => void;
}

export const useCycloneStore = create<CycloneStoreState>((set, get) => ({
  healthStatus: null,
  activeCyclones: [],
  selectedCycloneId: 'cyclone_dana',
  cycloneDetail: null,
  riskAssessment: null,
  landfallRisk: null,
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
  isSidebarCollapsed: false,

  searchQuery: '',
  notifications: [
    {
      id: 'notif-1',
      title: 'Landfall Warning Alert',
      message: 'Cyclone eyewall projected landfall within 18 hours at Dhamra / Bhitarkanika corridor.',
      type: 'critical',
      timestamp: '10m ago'
    },
    {
      id: 'notif-2',
      title: 'Infrastructure Alert',
      message: 'Dhamra 220kV Grid Substation and Chandbali Pumping Station placed on critical watch.',
      type: 'warning',
      timestamp: '25m ago'
    },
    {
      id: 'notif-3',
      title: 'Satellite SAR Processed',
      message: 'Copernicus Sentinel-1A SAR flood inundation mask updated (342.8 sq km detected).',
      type: 'info',
      timestamp: '1h ago'
    }
  ],

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
  statusMessage: 'Connecting to backend...',
  lastUpdated: new Date().toLocaleTimeString(),
  error: null,

  fetchInitialData: async () => {
    set({ isLoading: true, error: null });
    try {
      // 1. Health check on startup (Phase 6: First GET /api/v1/health)
      let health: HealthCheckResponse | null = null;
      try {
        health = await cycloneApi.getHealth();
      } catch (healthErr) {
        console.warn('[CycloneShield] Health check probe warning:', healthErr);
      }

      // 2. Next: GET /api/v1/cyclones/active / detect
      const detectRes = await cycloneApi.detectCyclones();
      let cyclones: CycloneSummary[] = [];
      if (Array.isArray(detectRes)) {
        cyclones = detectRes;
      } else if (detectRes && Array.isArray((detectRes as any).cyclones)) {
        cyclones = (detectRes as any).cyclones;
      } else {
        throw new Error("Invalid cyclone detection response format");
      }

      const defaultId = cyclones.length > 0 && cyclones[0]?.id ? cyclones[0].id : 'cyclone_dana';

      // 3. Fetch selected cyclone details
      const detail = await cycloneApi.getCycloneById(defaultId);
      if (!detail || typeof detail !== 'object') {
        throw new Error(`Invalid cyclone detail response for '${defaultId}'`);
      }

      // 4. Supplemental real backend data (Risk, Landfall, Infrastructure, Population)
      let riskAss: RiskAssessmentResponse | null = null;
      try {
        riskAss = await riskApi.getRiskAssessment(defaultId);
      } catch (e) {
        console.warn(`[CycloneShield] Risk assessment load warning for ${defaultId}:`, e);
      }

      let lfRisk: LandfallRiskBreakdown | null = null;
      try {
        lfRisk = await riskApi.getLandfallRisk(defaultId);
      } catch (e) {
        console.warn(`[CycloneShield] Landfall risk breakdown load warning for ${defaultId}:`, e);
      }

      let infra: InfrastructureSummary | null = null;
      try {
        infra = await infrastructureApi.getInfrastructure(defaultId);
      } catch (e) {
        console.warn(`[CycloneShield] Supplemental infrastructure data warning for ${defaultId}:`, e);
      }

      let pop: PopulationExposure | null = null;
      try {
        pop = await populationApi.getPopulationExposure(defaultId);
      } catch (e) {
        console.warn(`[CycloneShield] Supplemental population data warning for ${defaultId}:`, e);
      }

      // Default frame to current cyclone position (last observed point)
      const currentPoint = detail.observed_track.length > 0 
        ? detail.observed_track[detail.observed_track.length - 1] 
        : null;

      set({
        healthStatus: health,
        activeCyclones: cyclones,
        selectedCycloneId: defaultId,
        cycloneDetail: detail,
        riskAssessment: riskAss,
        landfallRisk: lfRisk,
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
      } else if (err instanceof Error) {
        userFriendlyError = err.message;
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
      if (!detail || typeof detail !== 'object') {
        throw new Error(`Invalid cyclone detail response for '${cycloneId}'`);
      }

      let riskAss: RiskAssessmentResponse | null = null;
      try {
        riskAss = await riskApi.getRiskAssessment(cycloneId);
      } catch (e) {
        console.warn(`[CycloneShield] Risk assessment load warning for ${cycloneId}:`, e);
      }

      let lfRisk: LandfallRiskBreakdown | null = null;
      try {
        lfRisk = await riskApi.getLandfallRisk(cycloneId);
      } catch (e) {
        console.warn(`[CycloneShield] Landfall risk breakdown load warning for ${cycloneId}:`, e);
      }

      let infra: InfrastructureSummary | null = null;
      try {
        infra = await infrastructureApi.getInfrastructure(cycloneId);
      } catch (e) {
        console.warn(`[CycloneShield] Supplemental infrastructure data warning for ${cycloneId}:`, e);
      }

      let pop: PopulationExposure | null = null;
      try {
        pop = await populationApi.getPopulationExposure(cycloneId);
      } catch (e) {
        console.warn(`[CycloneShield] Supplemental population data warning for ${cycloneId}:`, e);
      }
      
      const currentPoint = detail.observed_track.length > 0 
        ? detail.observed_track[detail.observed_track.length - 1] 
        : null;

      set({
        selectedCycloneId: cycloneId,
        cycloneDetail: detail,
        riskAssessment: riskAss,
        landfallRisk: lfRisk,
        infrastructure: infra,
        populationExposure: pop,
        currentFramePoint: currentPoint,
        timelineStepIndex: detail.observed_track.length > 0 ? detail.observed_track.length - 1 : 0,
        isPlaying: false,
        lastUpdated: detail.last_updated,
        isLoading: false
      });
    } catch (err: any) {
      console.error(`[CycloneShield] Failed to select cyclone ${cycloneId}:`, err);
      set({ 
        error: `Failed to load details for ${cycloneId}: ${err.message || err}`,
        isLoading: false 
      });
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
  setIsAiLoading: (loading) => set({ isAiLoading: loading }),

  toggleSidebar: () => set((state) => ({ isSidebarCollapsed: !state.isSidebarCollapsed })),
  setSearchQuery: (query) => set({ searchQuery: query }),
  dismissNotification: (id) => set((state) => ({
    notifications: state.notifications.filter(n => n.id !== id)
  }))
}));
