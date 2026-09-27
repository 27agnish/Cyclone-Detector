from typing import List, Dict, Any, Optional
from app.gis.geometry import haversine_distance_km

class CycloneTracker:
    """Manages cyclone temporal animation timeline, timeline scrubbing, and position interpolation."""

    @staticmethod
    def get_animation_frames(observed_points: List[Any], forecast_points: List[Any]) -> List[Dict[str, Any]]:
        frames = []
        # Combine observed and forecast into a unified chronological progression
        all_points = list(observed_points) + list(forecast_points)
        for idx, pt in enumerate(all_points):
            p_dict = pt.model_dump() if hasattr(pt, "model_dump") else dict(pt)
            frames.append({
                "step_index": idx,
                "timestamp": p_dict.get("timestamp"),
                "latitude": p_dict.get("latitude"),
                "longitude": p_dict.get("longitude"),
                "wind_speed": p_dict.get("wind_speed"),
                "pressure": p_dict.get("pressure"),
                "category": p_dict.get("category"),
                "movement_speed": p_dict.get("movement_speed"),
                "movement_direction": p_dict.get("movement_direction"),
                "track_type": p_dict.get("track_type"),
                "is_current": (p_dict.get("track_type") == "OBSERVED" and idx == len(observed_points) - 1),
                "is_landfall": "Landfall" in p_dict.get("category", "")
            })
        return frames

cyclone_tracker = CycloneTracker()
