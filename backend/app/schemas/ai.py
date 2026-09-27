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
    satellite_source: str = "Sentinel-1 SAR / Sentinel-2 MSI"
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

class EmergencyPriorityResponse(BaseModel):
    cyclone_id: str
    generated_at: str
    priorities: List[EmergencyPriorityItem]
    model_used: str
    disclaimer: str = "AI-GENERATED PROTOTYPE PRIORITY ANALYSIS. Not official emergency orders."
