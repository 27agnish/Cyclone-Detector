from fastapi import APIRouter, HTTPException
from datetime import datetime, timezone
from app.services.cyclone_detection.detector import detector_service
from app.services.infrastructure_service import infrastructure_service
from app.schemas.risk import RiskAssessmentResponse, AssetRiskDetail, HazardFactorBreakdown
from app.schemas.cyclone import RiskLevel

router = APIRouter(prefix="/risk", tags=["Risk Engine"])

@router.get("/{cyclone_id}", response_model=RiskAssessmentResponse)
def get_risk_assessment(cyclone_id: str):
    """Calculates CYCLONESHIELD AI PROTOTYPE RISK SCORE across all monitored assets and zones."""
    detail = detector_service.get_cyclone_detail(cyclone_id)
    if not detail:
        raise HTTPException(status_code=404, detail="Cyclone not found.")
        
    track_pts = [p.model_dump() for p in detail["observed_track"]] + [p.model_dump() for p in detail["forecast_track"]]
    landfall = detail.get("landfall")
    lf_dict = landfall.model_dump() if landfall else None
    
    analyzed_assets = infrastructure_service.get_analyzed_assets(track_pts, lf_dict, detail["summary"].wind_speed)
    summary = infrastructure_service.get_summary(analyzed_assets)

    top_vulnerable = []
    for a in analyzed_assets[:10]:
        top_vulnerable.append(
            AssetRiskDetail(
                asset_id=a.id,
                name=a.name,
                asset_type=a.type.value,
                latitude=a.latitude,
                longitude=a.longitude,
                risk_score=a.risk_score,
                risk_category=a.risk_category,
                breakdown=HazardFactorBreakdown(
                    wind_hazard_score=round(min(100.0, a.wind_exposure_kmh / 1.4), 1),
                    storm_surge_score=round(max(10.0, 95.0 - a.elevation_m * 8), 1),
                    rainfall_flood_score=72.0,
                    coastal_proximity_score=round(max(15.0, 100.0 - a.distance_from_landfall_km * 1.1), 1),
                    elevation_vulnerability_score=round(max(5.0, 100.0 - a.elevation_m * 10), 1),
                    asset_fragility_score=85.0
                ),
                recommended_action=a.prototype_action
            )
        )

    # Compute overall composite index
    overall_score = round(sum(a.risk_score for a in analyzed_assets) / max(1, len(analyzed_assets)), 1)
    if overall_score >= 76.0:
        overall_level = RiskLevel.CRITICAL
    elif overall_score >= 51.0:
        overall_level = RiskLevel.HIGH
    elif overall_score >= 26.0:
        overall_level = RiskLevel.MODERATE
    else:
        overall_level = RiskLevel.LOW

    return RiskAssessmentResponse(
        cyclone_id=cyclone_id,
        overall_cyclone_risk_score=overall_score,
        overall_risk_category=overall_level,
        calculated_at=datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M UTC"),
        critical_count=summary.critical_assets,
        high_count=summary.high_risk_assets,
        moderate_count=summary.moderate_risk_assets,
        low_count=summary.total_assets_monitored - (summary.critical_assets + summary.high_risk_assets + summary.moderate_risk_assets),
        top_vulnerable_assets=top_vulnerable
    )

@router.get("/landfall/{cyclone_id}")
def get_landfall_risk_breakdown(cyclone_id: str):
    """Specific risk metrics focused on predicted landfall impact zone."""
    detail = detector_service.get_cyclone_detail(cyclone_id)
    if not detail or not detail.get("landfall"):
        raise HTTPException(status_code=404, detail="Landfall information not available.")
    
    landfall = detail["landfall"]
    return {
        "cyclone_id": cyclone_id,
        "landfall_sector": landfall.location_name,
        "district": landfall.district,
        "expected_wind_speed": landfall.expected_wind_speed,
        "expected_storm_surge_m": landfall.expected_storm_surge_m,
        "risk_tier": "CRITICAL",
        "coastal_saline_inundation_risk": "HIGH",
        "estuary_backflow_risk": "SEVERE (Baitarani & Brahmani Delta)",
        "source_label": landfall.source_label,
        "disclaimer": "Model-derived prototype impact calculation."
    }
