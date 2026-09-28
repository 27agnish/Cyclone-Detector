from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from enum import Enum

class TrackType(str, Enum):
    OBSERVED = "OBSERVED"
    FORECAST = "FORECAST"

class DataStatus(str, Enum):
    LIVE = "LIVE"
    CACHED = "CACHED"
    DEMO = "DEMO"
    STALE = "STALE"

class RiskLevel(str, Enum):
    LOW = "LOW"
    MODERATE = "MODERATE"
    HIGH = "HIGH"
    CRITICAL = "CRITICAL"

class TrackPoint(BaseModel):
    id: str
    cyclone_id: str
    timestamp: str
    latitude: float
    longitude: float
    wind_speed: float = Field(..., description="Wind speed in km/h")
    pressure: float = Field(..., description="Central pressure in hPa")
    category: str
    movement_speed: float = Field(..., description="Speed in km/h")
    movement_direction: str = Field(..., description="e.g. NW, WNW")
    track_type: TrackType
    geometry: Dict[str, Any] = Field(default_factory=dict)

class CycloneSummary(BaseModel):
    id: str
    name: str
    basin: str = "North Indian Ocean (Bay of Bengal / Arabian Sea)"
    current_latitude: float
    current_longitude: float
    timestamp: str
    wind_speed: float
    central_pressure: float
    category: str
    movement_direction: str
    movement_speed: float
    source: str = "IMD / RSMC New Delhi & IBTrACS Feed"
    source_timestamp: str
    last_updated: str
    data_status: DataStatus = DataStatus.LIVE
    is_active: bool = True
    estimated_landfall_time: Optional[str] = None
    estimated_landfall_location: Optional[str] = None
    estimated_risk_score: Optional[float] = 78.5
    estimated_risk_category: Optional[RiskLevel] = RiskLevel.CRITICAL

class CycloneDetectionResponse(BaseModel):
    status: str
    cyclones_count: int
    cyclones: List[CycloneSummary]

class ForecastCone(BaseModel):
    cyclone_id: str
    generated_at: str
    lead_hours: List[int]
    uncertainty_radii_km: List[float]
    geometry: Dict[str, Any]
    label: str = "FORECAST UNCERTAINTY"
    disclaimer: str = "Model-derived prototype uncertainty cone. Not an official meteorological warning."

class LandfallInfo(BaseModel):
    cyclone_id: str
    location_name: str
    district: str
    state: str
    latitude: float
    longitude: float
    estimated_time: str
    expected_wind_speed: float
    expected_storm_surge_m: float
    risk_category: RiskLevel
    population_exposed: int
    critical_infrastructure_count: int
    source_label: str = "CYCLONESHIELD AI MODEL ESTIMATE"
    disclaimer: str = "Model-derived prototype estimate. Refer to official IMD bulletins for disaster response."

class LandfallZone(BaseModel):
    cyclone_id: str
    landfall_point: Dict[str, float]
    critical_radius_km: float = 35.0
    high_radius_km: float = 80.0
    moderate_radius_km: float = 150.0
    critical_polygon: Dict[str, Any]
    high_polygon: Dict[str, Any]
    moderate_polygon: Dict[str, Any]
    disclaimer: str = "Model-derived prototype impact zone. Not an official warning."

class CycloneDetail(CycloneSummary):
    observed_track: List[TrackPoint] = []
    forecast_track: List[TrackPoint] = []
    forecast_cone: Optional[ForecastCone] = None
    landfall: Optional[LandfallInfo] = None
    landfall_zone: Optional[LandfallZone] = None
