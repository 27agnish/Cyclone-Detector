from pydantic import BaseModel
from typing import List, Dict, Any

class DistrictExposure(BaseModel):
    district: str
    state: str = "Odisha"
    total_population: int
    critical_exposure: int
    high_exposure: int
    moderate_exposure: int
    evacuation_centers_active: int
    coastal_vulnerability_index: float

class PopulationExposure(BaseModel):
    cyclone_id: str
    critical: int
    high: int
    moderate: int
    total: int
    districts: List[DistrictExposure] = []
    label: str = "POPULATION EXPOSURE ESTIMATE"
    source_notes: str = "Census & Geo-spatial density modeling (Model-derived estimate)"
