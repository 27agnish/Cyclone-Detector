import math
from typing import Dict, Any

def estimate_wind_at_distance(max_wind_kmh: float, radius_max_wind_km: float, distance_km: float) -> float:
    """
    Parametric cyclone vortex wind profile.
    Eyewall (r <= Rmax) experiences maximum peak winds.
    Beyond Rmax, wind decays radially as (Rmax / r)^0.55.
    """
    if distance_km <= radius_max_wind_km:
        # Near center and eyewall experiences peak destructive winds (90% to 100% of Vmax)
        if distance_km < 6.0:
            return max_wind_kmh * 0.70 # Eye center calm
        return max_wind_kmh * (0.88 + 0.12 * (distance_km / radius_max_wind_km))
    else:
        # Radial decay beyond eyewall
        return max_wind_kmh * ((radius_max_wind_km / distance_km) ** 0.55)

def estimate_surge_hazard(distance_to_landfall_km: float, max_surge_m: float) -> float:
    """Estimates storm surge amplitude along coastal front."""
    if distance_to_landfall_km > 100:
        return 0.2
    factor = max(0.0, 1.0 - (distance_to_landfall_km / 100.0) ** 1.5)
    return round(max_surge_m * factor, 2)
