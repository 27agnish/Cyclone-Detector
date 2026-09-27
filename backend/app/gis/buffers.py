from typing import List, Dict, Any
from shapely.geometry import Point, MultiPolygon, Polygon, mapping
from shapely.ops import unary_union
from app.gis.geometry import destination_point, create_circle_polygon

def generate_forecast_uncertainty_cone(forecast_points: List[Dict[str, Any]]) -> Dict[str, Any]:
    """
    Constructs the expanding forecast uncertainty cone from future cyclone track points.
    Radius expands linearly or by empirical NHC/IMD error statistics over lead time.
    """
    if not forecast_points:
        return {"type": "Polygon", "coordinates": []}

    circles = []
    # Lead time radius model (km): starts around 30km, grows ~3.5km per hour into the forecast
    for idx, pt in enumerate(forecast_points):
        lat = pt.get("latitude")
        lon = pt.get("longitude")
        # Estimate lead time in hours (idx * 6h typical step or from point data)
        lead_hours = pt.get("lead_hours", (idx + 1) * 6)
        # Empirical radius formula: R(t) = 35 + 2.8 * t (e.g. 24h ~ 100km, 48h ~ 170km)
        radius_km = 35.0 + 2.8 * float(lead_hours)
        pt.setdefault("uncertainty_radius_km", radius_km)
        
        # Build polygon ring
        ring = create_circle_polygon(lat, lon, radius_km, num_points=32)
        poly = Polygon(ring)
        if poly.is_valid:
            circles.append(poly)

    if not circles:
        return {"type": "Polygon", "coordinates": []}

    # Union all expanding circles into a smooth contiguous uncertainty envelope
    union_poly = unary_union(circles)
    if isinstance(union_poly, MultiPolygon):
        # Pick the largest polygon if split
        union_poly = max(union_poly.geoms, key=lambda p: p.area)

    # Return as GeoJSON dictionary
    return mapping(union_poly)
