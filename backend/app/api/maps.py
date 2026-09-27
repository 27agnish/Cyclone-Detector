from fastapi import APIRouter, Query
from typing import Dict, Any
from app.services.maps_service import maps_service
from app.services.cyclone_detection.detector import detector_service

router = APIRouter(prefix="/map", tags=["GIS & Map Layers"])

@router.get("/cyclone-track")
def get_cyclone_track_layer(cyclone_id: str = Query("cyclone_dana")) -> Dict[str, Any]:
    """Provides GeoJSON FeatureCollection of observed line, forecast line, uncertainty cone, and track points."""
    return maps_service.get_cyclone_track_geojson(cyclone_id)

@router.get("/risk-zones")
def get_risk_zones_layer(cyclone_id: str = Query("cyclone_dana")) -> Dict[str, Any]:
    """Provides GeoJSON polygons for Critical, High, and Moderate landfall impact zones."""
    detail = detector_service.get_cyclone_detail(cyclone_id)
    if not detail or not detail.get("landfall_zone"):
        return {"type": "FeatureCollection", "features": []}

    zone = detail["landfall_zone"]
    features = [
        {"type": "Feature", "geometry": zone.critical_polygon, "properties": {"zone": "CRITICAL", "radius_km": 35.0, "color": "#dc2626"}},
        {"type": "Feature", "geometry": zone.high_polygon, "properties": {"zone": "HIGH", "radius_km": 80.0, "color": "#f97316"}},
        {"type": "Feature", "geometry": zone.moderate_polygon, "properties": {"zone": "MODERATE", "radius_km": 150.0, "color": "#eab308"}}
    ]
    return {"type": "FeatureCollection", "features": features}

@router.get("/infrastructure")
def get_infrastructure_layer(cyclone_id: str = Query("cyclone_dana")) -> Dict[str, Any]:
    """Provides GeoJSON FeatureCollection containing all infrastructure assets and their evaluated risk."""
    return maps_service.get_infrastructure_geojson(cyclone_id)
