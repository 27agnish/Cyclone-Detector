from typing import Dict, Any, List
from app.schemas.cyclone import TrackPoint, CycloneSummary, TrackType, DataStatus, ForecastCone, LandfallInfo, LandfallZone
from app.gis.buffers import generate_forecast_uncertainty_cone
from app.gis.landfall import estimate_landfall_point, generate_landfall_impact_zones

def normalize_track_point(raw: Dict[str, Any], cyclone_id: str) -> TrackPoint:
    lat = float(raw["latitude"])
    lon = float(raw["longitude"])
    track_type = TrackType.FORECAST if raw.get("track_type") == "FORECAST" else TrackType.OBSERVED
    
    return TrackPoint(
        id=raw.get("id", f"{cyclone_id}_{lat}_{lon}"),
        cyclone_id=cyclone_id,
        timestamp=raw.get("timestamp", ""),
        latitude=lat,
        longitude=lon,
        wind_speed=float(raw.get("wind_speed", 0.0)),
        pressure=float(raw.get("pressure", 1000.0)),
        category=raw.get("category", "Cyclonic Storm"),
        movement_speed=float(raw.get("movement_speed", 15.0)),
        movement_direction=raw.get("movement_direction", "NW"),
        track_type=track_type,
        geometry={"type": "Point", "coordinates": [round(lon, 4), round(lat, 4)]}
    )

def normalize_cyclone_payload(raw: Dict[str, Any]) -> Dict[str, Any]:
    cid = raw["id"]
    obs_raw = raw.get("observed_track", [])
    fc_raw = raw.get("forecast_track", [])
    
    obs_track = [normalize_track_point(pt, cid) for pt in obs_raw]
    fc_track = [normalize_track_point(pt, cid) for pt in fc_raw]
    
    # Generate Forecast Uncertainty Cone GeoJSON
    cone_poly = generate_forecast_uncertainty_cone(fc_raw)
    forecast_cone = ForecastCone(
        cyclone_id=cid,
        generated_at=raw.get("last_updated", ""),
        lead_hours=[pt.get("lead_hours", (idx+1)*6) for idx, pt in enumerate(fc_raw)],
        uncertainty_radii_km=[pt.get("uncertainty_radius_km", 35.0 + 2.8*(idx+1)*6) for idx, pt in enumerate(fc_raw)],
        geometry=cone_poly
    )
    
    # Landfall estimation
    landfall_dict = estimate_landfall_point(fc_raw)
    landfall_info = None
    landfall_zone = None
    if landfall_dict:
        zones = generate_landfall_impact_zones(landfall_dict["latitude"], landfall_dict["longitude"])
        landfall_info = LandfallInfo(
            cyclone_id=cid,
            location_name=landfall_dict["location_name"],
            district=landfall_dict["district"],
            state=landfall_dict["state"],
            latitude=landfall_dict["latitude"],
            longitude=landfall_dict["longitude"],
            estimated_time=landfall_dict["estimated_time"],
            expected_wind_speed=landfall_dict["expected_wind_speed"],
            expected_storm_surge_m=landfall_dict["expected_storm_surge_m"],
            risk_category="CRITICAL",
            population_exposed=485000,
            critical_infrastructure_count=138,
            source_label=landfall_dict["source_label"]
        )
        landfall_zone = LandfallZone(
            cyclone_id=cid,
            landfall_point={"lat": landfall_dict["latitude"], "lng": landfall_dict["longitude"]},
            critical_polygon=zones["critical_zone"],
            high_polygon=zones["high_risk_zone"],
            moderate_polygon=zones["moderate_risk_zone"]
        )

    summary = CycloneSummary(
        id=cid,
        name=raw["name"],
        basin=raw.get("basin", "North Indian Ocean"),
        current_latitude=float(raw["current_latitude"]),
        current_longitude=float(raw["current_longitude"]),
        timestamp=raw.get("timestamp", ""),
        wind_speed=float(raw["wind_speed"]),
        central_pressure=float(raw["central_pressure"]),
        category=raw.get("category", "Severe Cyclonic Storm"),
        movement_direction=raw.get("movement_direction", "NW"),
        movement_speed=float(raw.get("movement_speed", 16.0)),
        source=raw.get("source", "CycloneShield AI Ingestion"),
        source_timestamp=raw.get("source_timestamp", ""),
        last_updated=raw.get("last_updated", ""),
        data_status=raw.get("data_status", DataStatus.DEMO),
        is_active=raw.get("is_active", True),
        estimated_landfall_time=landfall_dict["estimated_time"] if landfall_dict else None,
        estimated_landfall_location=f"{landfall_dict['location_name']} ({landfall_dict['district']})" if landfall_dict else None
    )

    return {
        "summary": summary,
        "observed_track": obs_track,
        "forecast_track": fc_track,
        "forecast_cone": forecast_cone,
        "landfall": landfall_info,
        "landfall_zone": landfall_zone
    }
