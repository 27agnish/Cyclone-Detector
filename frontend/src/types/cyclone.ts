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
  estimated_risk_score?: number;
  estimated_risk_category?: RiskLevel;
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

export interface AISatelliteAnalysisRequest {
  cyclone_id: string;
  cyclone_name?: string;
  latitude?: number;
  longitude?: number;
  wind_speed?: number;
  pressure?: number;
  landfall_location?: string;
  satellite_source?: string;
  analysis_type?: string;
  bounding_box?: number[];
}

export interface SARReconnaissanceData {
  cyclone_name: string;
  location_summary: string;
  latitude: number;
  longitude: number;
  satellite_source: string;
  sensor_mode: string;
  pass_direction: string;
  analysis_status: string;
  flood_extent_level: string;
  flood_inundation_sqkm: number;
  permanent_water_sqkm: number;
  water_expansion_percent: string;
  confidence_score: number;
  severity_level: string;
  submerged_infrastructure: string[];
  road_bridge_impact: string[];
  affected_area_summary: string;
  detected_changes: string[];
  recommended_investigation_areas: string[];
  breach_locations: Array<{
    name: string;
    coordinates: [number, number];
    severity: string;
  }>;
  imagery_available: boolean;
  imagery_url?: string | null;
  imagery_fallback_reason: string;
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
  sar_data?: SARReconnaissanceData;
}

export interface HealthCheckResponse {
  status: string;
  service: string;
  version: string;
  timestamp: string;
  demo_mode: boolean;
  refresh_interval_minutes: number;
  services: {
    database: string;
    gemini: string;
    cyclone_data: string;
    earth_engine: string;
    google_maps: string;
  };
}

export interface HazardFactorBreakdown {
  wind_hazard_score: number;
  storm_surge_score: number;
  rainfall_flood_score: number;
  coastal_proximity_score: number;
  elevation_vulnerability_score: number;
  asset_fragility_score: number;
}

export interface AssetRiskDetail {
  asset_id: string;
  name: string;
  asset_type: string;
  latitude: number;
  longitude: number;
  risk_score: number;
  risk_category: RiskLevel;
  breakdown: HazardFactorBreakdown;
  recommended_action: string;
}

export interface RiskAssessmentResponse {
  cyclone_id: string;
  overall_cyclone_risk_score: number;
  overall_risk_category: RiskLevel;
  score_label: string;
  calculated_at: string;
  model_type: string;
  critical_count: number;
  high_count: number;
  moderate_count: number;
  low_count: number;
  top_vulnerable_assets: AssetRiskDetail[];
  disclaimer: string;
}

export interface LandfallRiskBreakdown {
  cyclone_id: string;
  landfall_sector: string;
  district: string;
  expected_wind_speed: number;
  expected_storm_surge_m: number;
  risk_tier: string;
  coastal_saline_inundation_risk: string;
  estuary_backflow_risk: string;
  source_label: string;
  disclaimer: string;
}

