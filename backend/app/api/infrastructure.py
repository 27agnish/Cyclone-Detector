from fastapi import APIRouter, HTTPException, Query
from typing import List, Optional
from app.services.cyclone_detection.detector import detector_service
from app.services.infrastructure_service import infrastructure_service
from app.schemas.infrastructure import InfrastructureAsset, InfrastructureSummary

router = APIRouter(prefix="/infrastructure", tags=["Infrastructure"])

@router.get("", response_model=InfrastructureSummary)
def list_infrastructure(
    cyclone_id: Optional[str] = Query("cyclone_dana", description="Active cyclone ID for context"),
    type: Optional[str] = Query(None, description="Filter by type (hospital, power, bridge, etc.)")
):
    """Returns all monitored lifeline infrastructure assets with computed vulnerability against active cyclone."""
    detail = detector_service.get_cyclone_detail(cyclone_id)
    track_pts = []
    landfall = None
    max_wind = 130.0
    if detail:
        track_pts = [p.model_dump() for p in detail["observed_track"]] + [p.model_dump() for p in detail["forecast_track"]]
        landfall = detail.get("landfall")
        if landfall:
            landfall = landfall.model_dump()
        max_wind = detail["summary"].wind_speed

    assets = infrastructure_service.get_analyzed_assets(track_pts, landfall, max_wind)
    if type:
        assets = [a for a in assets if a.type.value.lower() == type.lower()]
        
    return infrastructure_service.get_summary(assets)

@router.get("/{asset_id}", response_model=InfrastructureAsset)
def get_asset_by_id(
    asset_id: str,
    cyclone_id: Optional[str] = Query("cyclone_dana")
):
    """Returns detailed risk dossier for an individual infrastructure asset."""
    detail = detector_service.get_cyclone_detail(cyclone_id)
    track_pts = []
    landfall = None
    max_wind = 130.0
    if detail:
        track_pts = [p.model_dump() for p in detail["observed_track"]] + [p.model_dump() for p in detail["forecast_track"]]
        landfall = detail.get("landfall")
        if landfall:
            landfall = landfall.model_dump()
        max_wind = detail["summary"].wind_speed

    assets = infrastructure_service.get_analyzed_assets(track_pts, landfall, max_wind)
    for a in assets:
        if a.id == asset_id:
            return a
    raise HTTPException(status_code=404, detail="Infrastructure asset not found.")
