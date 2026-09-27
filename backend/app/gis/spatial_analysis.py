from typing import List, Dict, Any
from shapely.geometry import Point, Polygon, LineString, shape
from app.gis.geometry import haversine_distance_km

def calculate_min_distance_to_track(lat: float, lon: float, track_points: List[Dict[str, Any]]) -> float:
    """Calculates minimum distance from a point to any point along the cyclone pathway."""
    if not track_points:
        return 999.0
    return min(haversine_distance_km(lat, lon, pt["latitude"], pt["longitude"]) for pt in track_points)

def is_point_in_polygon(lat: float, lon: float, geojson_polygon: Dict[str, Any]) -> bool:
    """Checks whether coordinate falls within GeoJSON Polygon geometry."""
    try:
        poly = shape(geojson_polygon)
        return poly.contains(Point(lon, lat))
    except Exception:
        return False

def filter_assets_in_impact_zone(
    assets: List[Dict[str, Any]], 
    critical_poly: Dict[str, Any], 
    high_poly: Dict[str, Any], 
    moderate_poly: Dict[str, Any]
) -> List[Dict[str, Any]]:
    """Assigns impact zone and proximity metrics to each infrastructure asset."""
    results = []
    for asset in assets:
        lat, lon = asset["latitude"], asset["longitude"]
        zone = "LOW"
        if is_point_in_polygon(lat, lon, critical_poly):
            zone = "CRITICAL"
        elif is_point_in_polygon(lat, lon, high_poly):
            zone = "HIGH"
        elif is_point_in_polygon(lat, lon, moderate_poly):
            zone = "MODERATE"
            
        updated = {**asset, "impact_zone": zone}
        results.append(updated)
    return results
