from typing import Dict, Any, List
from app.services.cyclone_detection.detector import detector_service
from app.services.infrastructure_service import infrastructure_service
from app.services.population_service import population_service

class MapsService:
    """Generates standard RFC 7946 GeoJSON FeatureCollections for all map layers."""

    def get_cyclone_track_geojson(self, cyclone_id: str) -> Dict[str, Any]:
        detail = detector_service.get_cyclone_detail(cyclone_id)
        if not detail:
            return {"type": "FeatureCollection", "features": []}

        features = []
        
        # 1. Observed track LineString
        obs_points = detail["observed_track"]
        if len(obs_points) >= 2:
            obs_coords = [[pt.longitude, pt.latitude] for pt in obs_points]
            features.append({
                "type": "Feature",
                "geometry": {"type": "LineString", "coordinates": obs_coords},
                "properties": {
                    "layer": "observed_path",
                    "style": {"color": "#38bdf8", "weight": 4, "dashArray": None},
                    "title": "Observed Cyclone Pathway"
                }
            })

        # 2. Forecast track LineString
        fc_points = detail["forecast_track"]
        if len(fc_points) >= 2:
            # Include last observed point as anchor
            anchor = [[obs_points[-1].longitude, obs_points[-1].latitude]] if obs_points else []
            fc_coords = anchor + [[pt.longitude, pt.latitude] for pt in fc_points]
            features.append({
                "type": "Feature",
                "geometry": {"type": "LineString", "coordinates": fc_coords},
                "properties": {
                    "layer": "forecast_path",
                    "style": {"color": "#f43f5e", "weight": 3, "dashArray": "8, 6"},
                    "title": "Projected Forecast Pathway"
                }
            })

        # 3. Individual track point nodes with rich metadata
        for pt in obs_points:
            features.append({
                "type": "Feature",
                "geometry": pt.geometry,
                "properties": {
                    "id": pt.id,
                    "layer": "observed_point",
                    "timestamp": pt.timestamp,
                    "wind_speed": pt.wind_speed,
                    "pressure": pt.pressure,
                    "category": pt.category,
                    "movement": f"{pt.movement_direction} @ {pt.movement_speed} km/h",
                    "track_type": "OBSERVED",
                    "status_label": "Observed Historical Point"
                }
            })

        for pt in fc_points:
            features.append({
                "type": "Feature",
                "geometry": pt.geometry,
                "properties": {
                    "id": pt.id,
                    "layer": "forecast_point",
                    "timestamp": pt.timestamp,
                    "wind_speed": pt.wind_speed,
                    "pressure": pt.pressure,
                    "category": pt.category,
                    "movement": f"{pt.movement_direction} @ {pt.movement_speed} km/h",
                    "track_type": "FORECAST",
                    "status_label": "Model-Projected Forecast Point"
                }
            })

        # 4. Forecast Uncertainty Cone Polygon
        cone = detail.get("forecast_cone")
        if cone and cone.geometry:
            features.append({
                "type": "Feature",
                "geometry": cone.geometry,
                "properties": {
                    "layer": "forecast_cone",
                    "title": "Forecast Uncertainty Cone",
                    "style": {
                        "fillColor": "#38bdf8",
                        "fillOpacity": 0.16,
                        "color": "#0ea5e9",
                        "weight": 1.5,
                        "dashArray": "4, 4"
                    }
                }
            })

        # 5. Landfall Marker & Zones
        landfall = detail.get("landfall")
        if landfall:
            features.append({
                "type": "Feature",
                "geometry": {"type": "Point", "coordinates": [landfall.longitude, landfall.latitude]},
                "properties": {
                    "layer": "predicted_landfall",
                    "title": f"Predicted Landfall: {landfall.location_name}",
                    "district": landfall.district,
                    "state": landfall.state,
                    "estimated_time": landfall.estimated_time,
                    "expected_wind": f"{landfall.expected_wind_speed} km/h",
                    "expected_surge": f"{landfall.expected_storm_surge_m} m",
                    "risk": landfall.risk_category
                }
            })

        zone = detail.get("landfall_zone")
        if zone:
            # Critical zone
            features.append({
                "type": "Feature",
                "geometry": zone.critical_polygon,
                "properties": {
                    "layer": "landfall_critical_zone",
                    "title": "Critical Landfall Impact Zone (0-35km)",
                    "risk": "CRITICAL",
                    "style": {"fillColor": "#dc2626", "fillOpacity": 0.28, "color": "#ef4444", "weight": 2}
                }
            })
            # High risk zone
            features.append({
                "type": "Feature",
                "geometry": zone.high_polygon,
                "properties": {
                    "layer": "landfall_high_zone",
                    "title": "High Risk Landfall Zone (35-80km)",
                    "risk": "HIGH",
                    "style": {"fillColor": "#f97316", "fillOpacity": 0.18, "color": "#f97316", "weight": 1.5}
                }
            })
            # Moderate zone
            features.append({
                "type": "Feature",
                "geometry": zone.moderate_polygon,
                "properties": {
                    "layer": "landfall_moderate_zone",
                    "title": "Moderate Risk Swath (80-150km)",
                    "risk": "MODERATE",
                    "style": {"fillColor": "#eab308", "fillOpacity": 0.10, "color": "#eab308", "weight": 1}
                }
            })

        return {"type": "FeatureCollection", "features": features}

    def get_infrastructure_geojson(self, cyclone_id: str) -> Dict[str, Any]:
        detail = detector_service.get_cyclone_detail(cyclone_id)
        track_points = []
        landfall = None
        max_wind = 130.0
        if detail:
            track_points = [pt.model_dump() for pt in detail["observed_track"]] + [pt.model_dump() for pt in detail["forecast_track"]]
            landfall = detail.get("landfall")
            if landfall:
                landfall = landfall.model_dump()
            max_wind = detail["summary"].wind_speed

        assets = infrastructure_service.get_analyzed_assets(track_points, landfall, max_wind)
        features = []
        for a in assets:
            features.append({
                "type": "Feature",
                "geometry": {"type": "Point", "coordinates": [a.longitude, a.latitude]},
                "properties": a.model_dump()
            })
        return {"type": "FeatureCollection", "features": features}

maps_service = MapsService()
