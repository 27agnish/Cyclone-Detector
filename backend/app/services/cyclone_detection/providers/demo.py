from typing import List, Dict, Any, Optional
from datetime import datetime, timezone, timedelta
from app.services.cyclone_detection.providers.base import BaseCycloneProvider

class DemoCycloneProvider(BaseCycloneProvider):
    """
    Demo Cyclone Provider featuring realistic North Indian Ocean cyclone scenarios
    with complete observed and forecast pathways, uncertainty cones, and landfall zones.
    """
    @property
    def provider_name(self) -> str:
        return "CycloneShield Simulated Demo Provider (IMD/RSMC Synoptic Framework)"

    def _get_demo_cyclones_data(self) -> Dict[str, Dict[str, Any]]:
        now = datetime.now(timezone.utc)
        
        # Scenario 1: CYCLONE DANA (Default - Bay of Bengal targeting Coastal Odisha)
        # Observed track (T-30h to T0), Current Position (T0), Forecast Track (T+6h to T+48h)
        dana_observed = [
            {
                "id": "dana_obs_1",
                "timestamp": (now - timedelta(hours=30)).strftime("%Y-%m-%d %H:%M UTC"),
                "latitude": 15.60,
                "longitude": 91.20,
                "wind_speed": 55.0,
                "pressure": 1002.0,
                "category": "Deep Depression",
                "movement_speed": 16.0,
                "movement_direction": "WNW",
                "track_type": "OBSERVED",
                "lead_hours": -30
            },
            {
                "id": "dana_obs_2",
                "timestamp": (now - timedelta(hours=24)).strftime("%Y-%m-%d %H:%M UTC"),
                "latitude": 16.40,
                "longitude": 90.10,
                "wind_speed": 70.0,
                "pressure": 996.0,
                "category": "Cyclonic Storm",
                "movement_speed": 17.5,
                "movement_direction": "NW",
                "track_type": "OBSERVED",
                "lead_hours": -24
            },
            {
                "id": "dana_obs_3",
                "timestamp": (now - timedelta(hours=18)).strftime("%Y-%m-%d %H:%M UTC"),
                "latitude": 17.30,
                "longitude": 89.20,
                "wind_speed": 85.0,
                "pressure": 990.0,
                "category": "Severe Cyclonic Storm",
                "movement_speed": 18.0,
                "movement_direction": "NW",
                "track_type": "OBSERVED",
                "lead_hours": -18
            },
            {
                "id": "dana_obs_4",
                "timestamp": (now - timedelta(hours=12)).strftime("%Y-%m-%d %H:%M UTC"),
                "latitude": 18.15,
                "longitude": 88.50,
                "wind_speed": 105.0,
                "pressure": 982.0,
                "category": "Severe Cyclonic Storm",
                "movement_speed": 17.0,
                "movement_direction": "NW",
                "track_type": "OBSERVED",
                "lead_hours": -12
            },
            {
                "id": "dana_obs_5",
                "timestamp": (now - timedelta(hours=6)).strftime("%Y-%m-%d %H:%M UTC"),
                "latitude": 18.90,
                "longitude": 87.85,
                "wind_speed": 115.0,
                "pressure": 978.0,
                "category": "Severe Cyclonic Storm",
                "movement_speed": 16.5,
                "movement_direction": "NNW",
                "track_type": "OBSERVED",
                "lead_hours": -6
            },
            {
                "id": "dana_obs_current",
                "timestamp": now.strftime("%Y-%m-%d %H:%M UTC"),
                "latitude": 19.55,
                "longitude": 87.35,
                "wind_speed": 120.0,
                "pressure": 974.0,
                "category": "Severe Cyclonic Storm",
                "movement_speed": 18.0,
                "movement_direction": "NNW",
                "track_type": "OBSERVED",
                "lead_hours": 0
            }
        ]

        dana_forecast = [
            {
                "id": "dana_fc_1",
                "timestamp": (now + timedelta(hours=6)).strftime("%Y-%m-%d %H:%M UTC"),
                "latitude": 20.10,
                "longitude": 87.05,
                "wind_speed": 125.0,
                "pressure": 970.0,
                "category": "Severe Cyclonic Storm",
                "movement_speed": 17.0,
                "movement_direction": "NNW",
                "track_type": "FORECAST",
                "lead_hours": 6
            },
            {
                "id": "dana_fc_2",
                "timestamp": (now + timedelta(hours=12)).strftime("%Y-%m-%d %H:%M UTC"),
                "latitude": 20.65,
                "longitude": 86.85,
                "wind_speed": 130.0,
                "pressure": 966.0,
                "category": "Very Severe Cyclonic Storm",
                "movement_speed": 15.0,
                "movement_direction": "NNW",
                "track_type": "FORECAST",
                "lead_hours": 12
            },
            {
                "id": "dana_fc_3_landfall",
                "timestamp": (now + timedelta(hours=18)).strftime("%Y-%m-%d %H:%M UTC"),
                "latitude": 20.85,
                "longitude": 86.90,
                "wind_speed": 120.0,
                "pressure": 972.0,
                "category": "Severe Cyclonic Storm (Landfall)",
                "movement_speed": 14.0,
                "movement_direction": "NW",
                "track_type": "FORECAST",
                "lead_hours": 18
            },
            {
                "id": "dana_fc_4",
                "timestamp": (now + timedelta(hours=24)).strftime("%Y-%m-%d %H:%M UTC"),
                "latitude": 21.25,
                "longitude": 86.60,
                "wind_speed": 95.0,
                "pressure": 984.0,
                "category": "Cyclonic Storm",
                "movement_speed": 13.0,
                "movement_direction": "NW",
                "track_type": "FORECAST",
                "lead_hours": 24
            },
            {
                "id": "dana_fc_5",
                "timestamp": (now + timedelta(hours=36)).strftime("%Y-%m-%d %H:%M UTC"),
                "latitude": 21.80,
                "longitude": 86.10,
                "wind_speed": 65.0,
                "pressure": 994.0,
                "category": "Deep Depression",
                "movement_speed": 12.0,
                "movement_direction": "WNW",
                "track_type": "FORECAST",
                "lead_hours": 36
            },
            {
                "id": "dana_fc_6",
                "timestamp": (now + timedelta(hours=48)).strftime("%Y-%m-%d %H:%M UTC"),
                "latitude": 22.30,
                "longitude": 85.40,
                "wind_speed": 45.0,
                "pressure": 1002.0,
                "category": "Depression",
                "movement_speed": 11.0,
                "movement_direction": "W",
                "track_type": "FORECAST",
                "lead_hours": 48
            }
        ]

        # Scenario 2: CYCLONE BIPARJOY (Arabian Sea targeting Gujarat)
        biparjoy_observed = [
            {
                "id": "bip_obs_1",
                "timestamp": (now - timedelta(hours=24)).strftime("%Y-%m-%d %H:%M UTC"),
                "latitude": 19.50,
                "longitude": 66.80,
                "wind_speed": 140.0,
                "pressure": 960.0,
                "category": "Very Severe Cyclonic Storm",
                "movement_speed": 10.0,
                "movement_direction": "N",
                "track_type": "OBSERVED",
                "lead_hours": -24
            },
            {
                "id": "bip_obs_current",
                "timestamp": now.strftime("%Y-%m-%d %H:%M UTC"),
                "latitude": 21.20,
                "longitude": 67.20,
                "wind_speed": 130.0,
                "pressure": 966.0,
                "category": "Very Severe Cyclonic Storm",
                "movement_speed": 12.0,
                "movement_direction": "NNE",
                "track_type": "OBSERVED",
                "lead_hours": 0
            }
        ]

        biparjoy_forecast = [
            {
                "id": "bip_fc_1",
                "timestamp": (now + timedelta(hours=12)).strftime("%Y-%m-%d %H:%M UTC"),
                "latitude": 22.40,
                "longitude": 67.90,
                "wind_speed": 125.0,
                "pressure": 972.0,
                "category": "Very Severe Cyclonic Storm",
                "movement_speed": 13.0,
                "movement_direction": "NE",
                "track_type": "FORECAST",
                "lead_hours": 12
            },
            {
                "id": "bip_fc_2_landfall",
                "timestamp": (now + timedelta(hours=24)).strftime("%Y-%m-%d %H:%M UTC"),
                "latitude": 23.20,
                "longitude": 68.65,
                "wind_speed": 115.0,
                "pressure": 978.0,
                "category": "Severe Cyclonic Storm (Landfall)",
                "movement_speed": 12.0,
                "movement_direction": "NE",
                "track_type": "FORECAST",
                "lead_hours": 24
            }
        ]

        return {
            "cyclone_dana": {
                "id": "cyclone_dana",
                "name": "Cyclone DANA",
                "basin": "North Indian Ocean (Bay of Bengal)",
                "current_latitude": 19.55,
                "current_longitude": 87.35,
                "timestamp": now.strftime("%Y-%m-%d %H:%M UTC"),
                "wind_speed": 120.0,
                "central_pressure": 974.0,
                "category": "Severe Cyclonic Storm",
                "movement_direction": "NNW",
                "movement_speed": 18.0,
                "source": "CycloneShield Simulated Demo Provider (IMD/RSMC Synoptic Framework)",
                "source_timestamp": now.strftime("%Y-%m-%d %H:%M UTC"),
                "last_updated": now.strftime("%Y-%m-%d %H:%M UTC"),
                "data_status": "DEMO",
                "is_active": True,
                "estimated_landfall_time": (now + timedelta(hours=18)).strftime("%Y-%m-%d %H:%M UTC"),
                "estimated_landfall_location": "Dhamra Port / Bhitarkanika (Bhadrak / Kendrapara)",
                "observed_track": dana_observed,
                "forecast_track": dana_forecast
            },
            "cyclone_biparjoy": {
                "id": "cyclone_biparjoy",
                "name": "Cyclone BIPARJOY",
                "basin": "North Indian Ocean (Arabian Sea)",
                "current_latitude": 21.20,
                "current_longitude": 67.20,
                "timestamp": now.strftime("%Y-%m-%d %H:%M UTC"),
                "wind_speed": 130.0,
                "central_pressure": 966.0,
                "category": "Very Severe Cyclonic Storm",
                "movement_direction": "NNE",
                "movement_speed": 12.0,
                "source": "CycloneShield Simulated Demo Provider (IMD/RSMC Synoptic Framework)",
                "source_timestamp": now.strftime("%Y-%m-%d %H:%M UTC"),
                "last_updated": now.strftime("%Y-%m-%d %H:%M UTC"),
                "data_status": "DEMO",
                "is_active": True,
                "estimated_landfall_time": (now + timedelta(hours=24)).strftime("%Y-%m-%d %H:%M UTC"),
                "estimated_landfall_location": "Jakhau Port / Mandvi (Kutch, Gujarat)",
                "observed_track": biparjoy_observed,
                "forecast_track": biparjoy_forecast
            }
        }

    def detect_active_cyclones(self) -> List[Dict[str, Any]]:
        data = self._get_demo_cyclones_data()
        return list(data.values())

    def get_cyclone_track(self, cyclone_id: str) -> Optional[Dict[str, Any]]:
        data = self._get_demo_cyclones_data()
        return data.get(cyclone_id, data.get("cyclone_dana"))
