export type TrackType = 'OBSERVED' | 'FORECAST';
export type RiskLevel = 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';
export type DataStatus = 'LIVE' | 'CACHED' | 'DEMO' | 'STALE';

export interface TrackPoint {
  id: string;
  cyclone_id: string;
  timestamp: string;
  latitude: number;
  longitude: number;
  wind_speed: number;
  pressure: number;
  category: string;
  movement_speed: number;
  movement_direction: string;
  track_type: TrackType;
  geometry: {
    type: string;
    coordinates: [number, number];
  };
}

export interface CycloneSummary {
  id: string;
  name: string;
  basin: string;
  current_latitude: number;
  current_longitude: number;
  timestamp: string;
  wind_speed: number;
  central_pressure: number;
  category: string;
  movement_direction: string;
  movement_speed: number;
  source: string;
  source_timestamp: string;
  last_updated: string;
  data_status: DataStatus;
  is_active: boolean;
  estimated_landfall_time?: string;
  estimated_landfall_location?: string;
}

export interface CycloneDetectionResponse {
  status: string;
  cyclones_count: number;
  cyclones: CycloneSummary[];
}

export interface ForecastCone {
  cyclone_id: string;
  generated_at: string;
  lead_hours: number[];
  uncertainty_radii_km: number[];
  geometry: {
    type: string;
    coordinates: any[];
  };
  label: string;
  disclaimer: string;
}

export interface LandfallInfo {
  cyclone_id: string;
  location_name: string;
  district: string;
  state: string;
  latitude: number;
  longitude: number;
  estimated_time: string;
  expected_wind_speed: number;
  expected_storm_surge_m: number;
  risk_category: RiskLevel;
  population_exposed: number;
  critical_infrastructure_count: number;
  source_label: string;
  disclaimer: string;
}

export interface LandfallZone {
  cyclone_id: string;
  landfall_point: { lat: number; lng: number };
  critical_radius_km: number;
  high_radius_km: number;
  moderate_radius_km: number;
  critical_polygon: any;
  high_polygon: any;
  moderate_polygon: any;
  disclaimer: string;
}

export interface CycloneDetail extends CycloneSummary {
  observed_track: TrackPoint[];
  forecast_track: TrackPoint[];
  forecast_cone?: ForecastCone;
  landfall?: LandfallInfo;
  landfall_zone?: LandfallZone;
}

export interface InfrastructureAsset {
  id: string;
  name: string;
  type: 'hospital' | 'school' | 'bridge' | 'road' | 'power' | 'water' | 'shelter' | 'communication';
  district: string;
  state: string;
  latitude: number;
  longitude: number;
  distance_from_track_km: number;
  distance_from_landfall_km: number;
  wind_exposure_kmh: number;
  elevation_m: number;
  capacity?: number;
  backup_power: boolean;
  risk_score: number;
  risk_category: RiskLevel;
  risk_factors: string[];
  prototype_action: string;
  status: string;
}

export interface InfrastructureSummary {
  total_assets_monitored: number;
  critical_assets: number;
  high_risk_assets: number;
  moderate_risk_assets: number;
  by_type: Record<string, number>;
  assets: InfrastructureAsset[];
}

export interface DistrictExposure {
  district: string;
  state: string;
  total_population: number;
  critical_exposure: number;
  high_exposure: number;
  moderate_exposure: number;
  evacuation_centers_active: number;
  coastal_vulnerability_index: number;
}

export interface PopulationExposure {
  cyclone_id: string;
  critical: number;
  high: number;
  moderate: number;
  total: number;
  districts: DistrictExposure[];
  label: string;
  source_notes: string;
}

export interface EmergencyPriorityItem {
  rank: number;
  asset_id: string;
  name: string;
  type: string;
  district: string;
  risk_level: string;
  urgency: string;
  priority_action: string;
  rationale: string;
}

export interface EmergencyPriorityResponse {
  cyclone_id: string;
  generated_at: string;
  priorities: EmergencyPriorityItem[];
  model_used: string;
  disclaimer: string;
}

export interface AIResponse {
  cyclone_id: string;
  title: string;
  generated_at: string;
  model_used: string;
  is_simulated_fallback: boolean;
  content: string;
  key_findings: string[];
  recommended_actions: string[];
  disclaimer: string;
}
