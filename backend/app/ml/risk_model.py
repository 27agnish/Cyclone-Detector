from typing import Dict, Any, Tuple
from app.schemas.cyclone import RiskLevel

# Weights for deterministic multi-criteria vulnerability index
WEIGHTS = {
    "wind_hazard": 0.28,
    "track_proximity": 0.20,
    "landfall_proximity": 0.18,
    "surge_elevation": 0.14,
    "asset_criticality": 0.12,
    "rainfall_flood": 0.08
}

CRITICALITY_MAP = {
    "hospital": 1.0,
    "power": 0.95,
    "water": 0.90,
    "shelter": 0.90,
    "bridge": 0.85,
    "communication": 0.80,
    "road": 0.70,
    "school": 0.65
}

def calculate_infrastructure_risk(
    asset_type: str,
    distance_track_km: float,
    distance_landfall_km: float,
    wind_kmh: float,
    elevation_m: float,
    rainfall_mm: float = 180.0
) -> Tuple[float, RiskLevel, Dict[str, float]]:
    """
    Deterministic multi-criteria risk engine calculating CYCLONESHIELD AI PROTOTYPE RISK SCORE.
    Computes sub-scores for wind, track proximity, landfall proximity, surge/elevation, and asset criticality.
    """
    # 1. Wind hazard score (0 to 100): begins impacting around 50km/h, severe above 115km/h
    wind_sub = min(100.0, max(0.0, (wind_kmh - 45.0) / 75.0 * 100.0))

    # 2. Track proximity score: decays with distance from track
    if distance_track_km <= 15:
        track_sub = 100.0
    elif distance_track_km <= 80:
        track_sub = 100.0 - ((distance_track_km - 15) / 65.0 * 70.0)
    else:
        track_sub = max(5.0, 30.0 - (distance_track_km - 80) * 0.2)

    # 3. Landfall proximity score: peak near landfall epicenter
    if distance_landfall_km <= 25:
        landfall_sub = 100.0
    elif distance_landfall_km <= 100:
        landfall_sub = 100.0 - ((distance_landfall_km - 25) / 75.0 * 75.0)
    else:
        landfall_sub = max(0.0, 25.0 - (distance_landfall_km - 100) * 0.15)

    # 4. Surge and low elevation hazard
    # Low elevation coastal sites (< 5m) within 50km of landfall face extreme surge inundation
    if elevation_m <= 4.0 and distance_landfall_km <= 50:
        surge_sub = 95.0
    elif elevation_m <= 10.0 and distance_landfall_km <= 80:
        surge_sub = 65.0
    else:
        surge_sub = max(10.0, 40.0 - elevation_m * 1.5)

    # 5. Asset criticality
    crit_factor = CRITICALITY_MAP.get(asset_type.lower(), 0.7)
    crit_sub = crit_factor * 100.0

    # 6. Rainfall flood hazard
    rain_sub = min(100.0, (rainfall_mm / 250.0) * 100.0)

    # Weighted composite index
    composite = (
        wind_sub * WEIGHTS["wind_hazard"] +
        track_sub * WEIGHTS["track_proximity"] +
        landfall_sub * WEIGHTS["landfall_proximity"] +
        surge_sub * WEIGHTS["surge_elevation"] +
        crit_sub * WEIGHTS["asset_criticality"] +
        rain_sub * WEIGHTS["rainfall_flood"]
    )
    
    score = round(min(100.0, max(0.0, composite)), 1)

    # Classification
    if score >= 76.0:
        level = RiskLevel.CRITICAL
    elif score >= 51.0:
        level = RiskLevel.HIGH
    elif score >= 26.0:
        level = RiskLevel.MODERATE
    else:
        level = RiskLevel.LOW

    breakdown = {
        "wind_hazard_score": round(wind_sub, 1),
        "track_proximity_score": round(track_sub, 1),
        "landfall_proximity_score": round(landfall_sub, 1),
        "surge_elevation_score": round(surge_sub, 1),
        "asset_criticality_score": round(crit_sub, 1),
        "rainfall_flood_score": round(rain_sub, 1)
    }

    return score, level, breakdown

def generate_prototype_action(asset_type: str, risk_level: RiskLevel, asset_name: str) -> str:
    """Generates actionable prototype mitigation recommendations based on risk tier and asset function."""
    if risk_level == RiskLevel.CRITICAL:
        if asset_type == "hospital":
            return f"Activate auxiliary diesel generators immediately at {asset_name}; secure ICU oxygen backup tanks, move basement clinical supplies to upper floors, pre-position trauma emergency teams."
        elif asset_type == "power":
            return f"Execute controlled sectional isolation on 132kV feeder lines at {asset_name}; pre-stage mobile substation repair units and emergency pole inventory."
        elif asset_type == "water":
            return f"Charge water storage reservoirs to maximum capacity; seal filtration intake wells against saltwater surge contamination."
        elif asset_type == "bridge":
            return f"Inspect bridge scour sensors; restrict heavy vehicular transport across {asset_name} 6 hours prior to gale-force winds."
        elif asset_type == "shelter":
            return f"Verify emergency dry ration stocks, drinking water tanks, and satellite radios at {asset_name}; prepare for intake of evacuated population."
        else:
            return f"Deploy emergency response crew for pre-landfall structural hardening and immediate access clearance."
    elif risk_level == RiskLevel.HIGH:
        return f"Pre-position response equipment, test emergency communications, and inspect backup utility systems."
    elif risk_level == RiskLevel.MODERATE:
        return f"Monitor cyclone advisories, inspect drainage gutters, and alert standby maintenance teams."
    else:
        return f"Standard vigilance and routine operational monitoring."
