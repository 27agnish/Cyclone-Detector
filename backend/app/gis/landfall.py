from typing import List, Dict, Any, Optional, Tuple
from shapely.geometry import LineString, Point, mapping, Polygon
from app.gis.geometry import haversine_distance_km, create_circle_polygon

# Approximate coastal landmarks for Indian states to cross-reference landfall locations
COASTAL_SECTORS = [
    # Odisha
    {"state": "Odisha", "district": "Bhadrak", "location": "Dhamra Port / Bhitarkanika", "lat": 20.80, "lon": 86.95},
    {"state": "Odisha", "district": "Kendrapara", "location": "Rajnagar / Hukitola Bay", "lat": 20.58, "lon": 86.82},
    {"state": "Odisha", "district": "Jagatsinghpur", "location": "Paradip Port", "lat": 20.26, "lon": 86.66},
    {"state": "Odisha", "district": "Puri", "location": "Puri Beach / Konark Coast", "lat": 19.81, "lon": 85.83},
    {"state": "Odisha", "district": "Balasore", "location": "Chandipur / Talasari", "lat": 21.46, "lon": 87.02},
    {"state": "Odisha", "district": "Ganjam", "location": "Gopalpur-on-Sea", "lat": 19.26, "lon": 84.91},
    # West Bengal
    {"state": "West Bengal", "district": "Purba Medinipur", "location": "Digha / Mandarmani", "lat": 21.62, "lon": 87.51},
    {"state": "West Bengal", "district": "South 24 Parganas", "location": "Sagar Island / Bakkhali", "lat": 21.65, "lon": 88.08},
    # Andhra Pradesh
    {"state": "Andhra Pradesh", "district": "Visakhapatnam", "location": "Visakhapatnam Harbor", "lat": 17.68, "lon": 83.21},
    {"state": "Andhra Pradesh", "district": "Krishna", "location": "Machilipatnam", "lat": 16.18, "lon": 81.13},
    {"state": "Andhra Pradesh", "district": "Bapatla", "location": "Bapatla / Chirala", "lat": 15.90, "lon": 80.46},
    # Gujarat
    {"state": "Gujarat", "district": "Kutch", "location": "Jakhau Port / Mandvi", "lat": 23.23, "lon": 68.65},
    {"state": "Gujarat", "district": "Gir Somnath", "location": "Veraval / Somnath", "lat": 20.90, "lon": 70.36}
]

def find_nearest_coastal_sector(lat: float, lon: float) -> Dict[str, Any]:
    """Finds the closest coastal settlement / port to given coordinate."""
    best = COASTAL_SECTORS[0]
    best_dist = 999999.0
    for s in COASTAL_SECTORS:
        d = haversine_distance_km(lat, lon, s["lat"], s["lon"])
        if d < best_dist:
            best_dist = d
            best = s
    return {**best, "distance_km": round(best_dist, 1)}

def estimate_landfall_point(forecast_points: List[Dict[str, Any]]) -> Optional[Dict[str, Any]]:
    """
    Detects when the cyclone forecast pathway crosses from oceanic waters onto the Indian coast.
    Returns landfall coordinates, timing, sector, and expected intensity.
    """
    if not forecast_points:
        return None

    # Track moving generally NW / W / N towards coastal line
    for pt in forecast_points:
        lat = pt.get("latitude", 0.0)
        lon = pt.get("longitude", 0.0)
        
        # Check proximity to known coastal sector (< 40 km)
        nearest = find_nearest_coastal_sector(lat, lon)
        if nearest["distance_km"] <= 45.0:
            wind = pt.get("wind_speed", 120.0)
            # Estimate storm surge based on wind and coastal slope (prototype formulation)
            surge_m = round(max(0.8, (wind / 120.0)**1.8 * 2.8), 1)
            
            return {
                "latitude": round(lat, 4),
                "longitude": round(lon, 4),
                "location_name": nearest["location"],
                "district": nearest["district"],
                "state": nearest["state"],
                "estimated_time": pt.get("timestamp", "T+24H"),
                "expected_wind_speed": wind,
                "expected_storm_surge_m": surge_m,
                "lead_hours": pt.get("lead_hours", 24),
                "source_label": "CYCLONESHIELD AI MODEL ESTIMATE"
            }
            
    # Default fallback: take the point closest to land in forecast
    closest_pt = min(forecast_points, key=lambda p: find_nearest_coastal_sector(p.get("latitude", 0), p.get("longitude", 0))["distance_km"])
    nearest = find_nearest_coastal_sector(closest_pt.get("latitude", 0), closest_pt.get("longitude", 0))
    wind = closest_pt.get("wind_speed", 120.0)
    surge_m = round(max(0.8, (wind / 120.0)**1.8 * 2.8), 1)

    return {
        "latitude": round(closest_pt.get("latitude", 0), 4),
        "longitude": round(closest_pt.get("longitude", 0), 4),
        "location_name": nearest["location"],
        "district": nearest["district"],
        "state": nearest["state"],
        "estimated_time": closest_pt.get("timestamp", "T+24H"),
        "expected_wind_speed": wind,
        "expected_storm_surge_m": surge_m,
        "lead_hours": closest_pt.get("lead_hours", 24),
        "source_label": "CYCLONESHIELD AI MODEL ESTIMATE"
    }

def generate_landfall_impact_zones(landfall_lat: float, landfall_lon: float) -> Dict[str, Any]:
    """
    Generates multi-tier GIS impact zone polygons around predicted landfall:
    - Critical Zone (0-35 km): severe wind destruction & peak storm surge inundation
    - High Risk Zone (35-80 km): gale force winds, tree/powerline damage, structural risk
    - Moderate Risk Zone (80-150 km): squally winds, flash rainfall swath
    """
    crit_coords = create_circle_polygon(landfall_lat, landfall_lon, radius_km=35.0, num_points=36)
    high_coords = create_circle_polygon(landfall_lat, landfall_lon, radius_km=80.0, num_points=36)
    mod_coords = create_circle_polygon(landfall_lat, landfall_lon, radius_km=150.0, num_points=36)

    return {
        "critical_zone": {
            "type": "Polygon",
            "coordinates": [crit_coords],
            "properties": {"zone": "CRITICAL", "radius_km": 35.0, "color": "#dc2626"}
        },
        "high_risk_zone": {
            "type": "Polygon",
            "coordinates": [high_coords],
            "properties": {"zone": "HIGH", "radius_km": 80.0, "color": "#f97316"}
        },
        "moderate_risk_zone": {
            "type": "Polygon",
            "coordinates": [mod_coords],
            "properties": {"zone": "MODERATE", "radius_km": 150.0, "color": "#eab308"}
        }
    }
