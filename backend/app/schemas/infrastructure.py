from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from enum import Enum
from app.schemas.cyclone import RiskLevel

class InfrastructureType(str, Enum):
    HOSPITAL = "hospital"
    SCHOOL = "school"
    BRIDGE = "bridge"
    ROAD = "road"
    POWER = "power"
    WATER = "water"
    SHELTER = "shelter"
    COMMUNICATION = "communication"

class InfrastructureAsset(BaseModel):
    id: str
    name: str
    type: InfrastructureType
    district: str
    state: str = "Odisha"
    latitude: float
    longitude: float
    distance_from_track_km: float
    distance_from_landfall_km: float
    wind_exposure_kmh: float
    elevation_m: float
    capacity: Optional[int] = None
    backup_power: bool = True
    risk_score: float = Field(..., ge=0, le=100)
    risk_category: RiskLevel
    risk_factors: List[str] = []
    prototype_action: str
    status: str = "Operational"

class InfrastructureSummary(BaseModel):
    total_assets_monitored: int
    critical_assets: int
    high_risk_assets: int
    moderate_risk_assets: int
    by_type: Dict[str, int]
    assets: List[InfrastructureAsset] = []
