from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional
from app.schemas.cyclone import RiskLevel
from app.schemas.infrastructure import InfrastructureAsset

class HazardFactorBreakdown(BaseModel):
    wind_hazard_score: float
    storm_surge_score: float
    rainfall_flood_score: float
    coastal_proximity_score: float
    elevation_vulnerability_score: float
    asset_fragility_score: float

class AssetRiskDetail(BaseModel):
    asset_id: str
    name: str
    asset_type: str
    latitude: float
    longitude: float
    risk_score: float
    risk_category: RiskLevel
    breakdown: HazardFactorBreakdown
    recommended_action: str

class RiskAssessmentResponse(BaseModel):
    cyclone_id: str
    overall_cyclone_risk_score: float
    overall_risk_category: RiskLevel
    score_label: str = "CYCLONESHIELD AI PROTOTYPE RISK SCORE"
    calculated_at: str
    model_type: str = "Deterministic Multi-Criteria + XGBoost Hazard Ensemble"
    critical_count: int
    high_count: int
    moderate_count: int
    low_count: int
    top_vulnerable_assets: List[AssetRiskDetail] = []
    disclaimer: str = "Prototype risk calculation for decision support. Not a certified meteorological risk index."
