from fastapi import APIRouter, HTTPException, Query
from typing import List, Dict, Any, Optional
from app.services.cyclone_detection.detector import detector_service
from app.services.cyclone_detection.tracker import cyclone_tracker
from app.schemas.cyclone import CycloneSummary, CycloneDetail, TrackPoint, ForecastCone, LandfallInfo, LandfallZone, CycloneDetectionResponse
from app.services.infrastructure_service import infrastructure_service
from app.services.population_service import population_service

router = APIRouter(prefix="/cyclones", tags=["Cyclones"])

@router.get("", response_model=List[CycloneSummary])
def get_all_cyclones():
    """Returns all registered cyclones (active, observed, and simulated scenarios)."""
    return detector_service.detect_active_cyclones()

@router.get("/active", response_model=List[CycloneSummary])
def get_active_cyclones():
    """Returns currently active cyclonic storms in monitored ocean basins."""
    active = [c for c in detector_service.detect_active_cyclones() if c.is_active]
    return active

@router.get("/detect", response_model=CycloneDetectionResponse)
@router.get("/cyclone-detection", response_model=CycloneDetectionResponse, include_in_schema=False)
@router.get("/detection", response_model=CycloneDetectionResponse, include_in_schema=False)
def trigger_detection(force_refresh: bool = False):
    """Proactively checks data sources to detect active cyclonic disturbances."""
    results = detector_service.detect_active_cyclones(force_refresh=force_refresh)
    return {
        "status": "CYCLONE DETECTED" if results else "NO ACTIVE CYCLONE DETECTED",
        "cyclones_count": len(results),
        "cyclones": results
    }

@router.post("/refresh")
def refresh_cyclone_data():
    """Forces cache refresh across all configured cyclone providers."""
    results = detector_service.refresh()
    return {
        "status": "DATA UPDATED",
        "timestamp": results[0].last_updated if results else "N/A",
        "cyclones_count": len(results),
        "cyclones": results
    }

@router.get("/{cyclone_id}", response_model=CycloneDetail)
def get_cyclone_by_id(cyclone_id: str):
    """Retrieves full cyclone package including observed track, forecast, uncertainty cone, and landfall."""
    detail = detector_service.get_cyclone_detail(cyclone_id)
    if not detail:
        raise HTTPException(status_code=404, detail=f"Cyclone '{cyclone_id}' not found.")
    
    # Return structured summary with track arrays
    return {
        **detail["summary"].model_dump(),
        "observed_track": [p.model_dump() for p in detail["observed_track"]],
        "forecast_track": [p.model_dump() for p in detail["forecast_track"]],
        "forecast_cone": detail["forecast_cone"].model_dump() if detail.get("forecast_cone") else None,
        "landfall": detail["landfall"].model_dump() if detail.get("landfall") else None,
        "landfall_zone": detail["landfall_zone"].model_dump() if detail.get("landfall_zone") else None,
    }

@router.get("/{cyclone_id}/track")
def get_cyclone_track(cyclone_id: str):
    """Returns observed track points and chronological animation frames."""
    detail = detector_service.get_cyclone_detail(cyclone_id)
    if not detail:
        raise HTTPException(status_code=404, detail="Cyclone not found.")
    
    frames = cyclone_tracker.get_animation_frames(detail["observed_track"], detail["forecast_track"])
    return {
        "cyclone_id": cyclone_id,
        "observed_track": [p.model_dump() for p in detail["observed_track"]],
        "animation_frames": frames
    }

@router.get("/{cyclone_id}/forecast")
def get_cyclone_forecast(cyclone_id: str):
    """Returns projected future pathway points."""
    detail = detector_service.get_cyclone_detail(cyclone_id)
    if not detail:
        raise HTTPException(status_code=404, detail="Cyclone not found.")
    return {
        "cyclone_id": cyclone_id,
        "forecast_track": [p.model_dump() for p in detail["forecast_track"]]
    }

@router.get("/{cyclone_id}/forecast-cone")
def get_cyclone_forecast_cone(cyclone_id: str):
    """Returns GeoJSON polygon geometry representing forecast track uncertainty."""
    detail = detector_service.get_cyclone_detail(cyclone_id)
    if not detail:
        raise HTTPException(status_code=404, detail="Cyclone not found.")
    return detail.get("forecast_cone")

@router.get("/{cyclone_id}/landfall")
def get_cyclone_landfall(cyclone_id: str):
    """Returns predicted landfall location, ETA, expected wind, and storm surge."""
    detail = detector_service.get_cyclone_detail(cyclone_id)
    if not detail or not detail.get("landfall"):
        raise HTTPException(status_code=404, detail="Landfall information not available.")
    return detail["landfall"]

@router.get("/{cyclone_id}/landfall-zone")
def get_cyclone_landfall_zone(cyclone_id: str):
    """Returns Critical, High Risk, and Moderate impact zone polygons around landfall."""
    detail = detector_service.get_cyclone_detail(cyclone_id)
    if not detail or not detail.get("landfall_zone"):
        raise HTTPException(status_code=404, detail="Landfall zone not available.")
    return detail["landfall_zone"]

@router.get("/{cyclone_id}/impact")
def get_cyclone_complete_impact(cyclone_id: str):
    """Comprehensive impact dossier aggregating track, landfall, infrastructure, and population."""
    detail = detector_service.get_cyclone_detail(cyclone_id)
    if not detail:
        raise HTTPException(status_code=404, detail="Cyclone not found.")
        
    track_pts = [p.model_dump() for p in detail["observed_track"]] + [p.model_dump() for p in detail["forecast_track"]]
    landfall = detail.get("landfall")
    lf_dict = landfall.model_dump() if landfall else None
    
    analyzed_assets = infrastructure_service.get_analyzed_assets(track_pts, lf_dict, detail["summary"].wind_speed)
    infra_sum = infrastructure_service.get_summary(analyzed_assets)
    pop_exp = population_service.calculate_exposure(cyclone_id)

    return {
        "cyclone": detail["summary"],
        "landfall": landfall,
        "infrastructure_summary": infra_sum,
        "population_exposure": pop_exp
    }
