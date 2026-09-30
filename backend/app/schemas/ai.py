from pydantic import BaseModel
from typing import List, Optional, Dict, Any

class AIExplainRiskRequest(BaseModel):
    cyclone_id: str
    asset_id: Optional[str] = None
    district: Optional[str] = None

class AIExplainLandfallRequest(BaseModel):
    cyclone_id: str

class AISatelliteAnalysisRequest(BaseModel):
    cyclone_id: str
    cyclone_name: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    wind_speed: Optional[float] = None
    pressure: Optional[float] = None
    landfall_location: Optional[str] = None
    satellite_source: str = "Sentinel-1 SAR / INSAT-3DR"
    analysis_type: str = "SAR_RECONNAISSANCE"
    bounding_box: Optional[List[float]] = None

class AIEmergencyPlanRequest(BaseModel):
    cyclone_id: str
    target_lead_hours: Optional[int] = 24

class AIReportRequest(BaseModel):
    cyclone_id: str
    include_satellite: bool = True
    include_gis_zones: bool = True

class EmergencyPriorityItem(BaseModel):
    rank: int
    asset_id: str
    name: str
    type: str
    district: str
    risk_level: str
    urgency: str
    priority_action: str
    rationale: str

class SARReconnaissanceData(BaseModel):
    cyclone_name: str
    location_summary: str
    latitude: float
    longitude: float
    satellite_source: str
    sensor_mode: str
    pass_direction: str
    analysis_status: str
    flood_extent_level: str
    flood_inundation_sqkm: float
    permanent_water_sqkm: float
    water_expansion_percent: str
    confidence_score: float
    severity_level: str
    submerged_infrastructure: List[str] = []
    road_bridge_impact: List[str] = []
    affected_area_summary: str
    detected_changes: List[str] = []
    recommended_investigation_areas: List[str] = []
    breach_locations: List[Dict[str, Any]] = []
    imagery_available: bool = False
    imagery_url: Optional[str] = None
    imagery_fallback_reason: str = "Satellite imagery unavailable for this analysis."

class AIResponse(BaseModel):
    cyclone_id: str
    title: str
    generated_at: str
    model_used: str
    is_simulated_fallback: bool
    content: str
    key_findings: List[str] = []
    recommended_actions: List[str] = []
    disclaimer: str = "AI-GENERATED PROTOTYPE ANALYSIS. Not an official meteorological or disaster management order."
    sar_data: Optional[SARReconnaissanceData] = None

class EmergencyPriorityResponse(BaseModel):
    cyclone_id: str
    generated_at: str
    priorities: List[EmergencyPriorityItem]
    model_used: str
    disclaimer: str = "AI-GENERATED PROTOTYPE PRIORITY ANALYSIS. Not official emergency orders."
