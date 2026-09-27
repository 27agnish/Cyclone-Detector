from typing import List, Dict, Any, Optional
from app.schemas.infrastructure import InfrastructureAsset, InfrastructureSummary, InfrastructureType
from app.schemas.cyclone import RiskLevel
from app.gis.geometry import haversine_distance_km
from app.gis.spatial_analysis import calculate_min_distance_to_track
from app.ml.risk_model import calculate_infrastructure_risk, generate_prototype_action
from app.gis.hazard import estimate_wind_at_distance

# Core coastal assets in the demo impact corridor (Odisha coastal zone)
INITIAL_ASSETS = [
    # Hospitals
    {"id": "hosp_1", "name": "Bhadrak District Headquarters Hospital (DHH)", "type": "hospital", "district": "Bhadrak", "state": "Odisha", "latitude": 21.056, "longitude": 86.498, "elevation_m": 8.0, "capacity": 380, "backup_power": True},
    {"id": "hosp_2", "name": "Basudevpur Community Health Centre (CHC)", "type": "hospital", "district": "Bhadrak", "state": "Odisha", "latitude": 21.140, "longitude": 86.750, "elevation_m": 4.5, "capacity": 120, "backup_power": True},
    {"id": "hosp_3", "name": "Kendrapara District Hospital", "type": "hospital", "district": "Kendrapara", "state": "Odisha", "latitude": 20.502, "longitude": 86.422, "elevation_m": 9.0, "capacity": 310, "backup_power": True},
    {"id": "hosp_4", "name": "Rajnagar Area Hospital (Bhitarkanika Gate)", "type": "hospital", "district": "Kendrapara", "state": "Odisha", "latitude": 20.575, "longitude": 86.732, "elevation_m": 3.8, "capacity": 85, "backup_power": False},
    {"id": "hosp_5", "name": "Paradip Port Trust Hospital", "type": "hospital", "district": "Jagatsinghpur", "state": "Odisha", "latitude": 20.316, "longitude": 86.611, "elevation_m": 3.2, "capacity": 150, "backup_power": True},
    {"id": "hosp_6", "name": "Balasore District Headquarters Hospital", "type": "hospital", "district": "Balasore", "state": "Odisha", "latitude": 21.492, "longitude": 86.933, "elevation_m": 12.0, "capacity": 450, "backup_power": True},
    {"id": "hosp_7", "name": "Chandbali Sub-Divisional Hospital", "type": "hospital", "district": "Bhadrak", "state": "Odisha", "latitude": 20.781, "longitude": 86.744, "elevation_m": 4.1, "capacity": 95, "backup_power": True},
    
    # Power Stations & Grids
    {"id": "pwr_1", "name": "Dhamra 132/33kV Grid Substation", "type": "power", "district": "Bhadrak", "state": "Odisha", "latitude": 20.825, "longitude": 86.920, "elevation_m": 3.5, "capacity": 160, "backup_power": True},
    {"id": "pwr_2", "name": "Chandbali OPTCL 220kV Grid Substation", "type": "power", "district": "Bhadrak", "state": "Odisha", "latitude": 20.765, "longitude": 86.715, "elevation_m": 5.0, "capacity": 220, "backup_power": True},
    {"id": "pwr_3", "name": "Paradip Refinery Primary Substation", "type": "power", "district": "Jagatsinghpur", "state": "Odisha", "latitude": 20.280, "longitude": 86.580, "elevation_m": 4.0, "capacity": 300, "backup_power": True},
    {"id": "pwr_4", "name": "Kendrapara Town 33kV Substation", "type": "power", "district": "Kendrapara", "state": "Odisha", "latitude": 20.490, "longitude": 86.415, "elevation_m": 8.5, "capacity": 100, "backup_power": False},
    {"id": "pwr_5", "name": "Balasore Remuna Industrial Substation", "type": "power", "district": "Balasore", "state": "Odisha", "latitude": 21.520, "longitude": 86.880, "elevation_m": 14.0, "capacity": 180, "backup_power": True},

    # Bridges & Critical Transportation
    {"id": "brg_1", "name": "Baitarani River Bridge (Chandbali Link)", "type": "bridge", "district": "Bhadrak", "state": "Odisha", "latitude": 20.774, "longitude": 86.748, "elevation_m": 5.2, "capacity": None, "backup_power": False},
    {"id": "brg_2", "name": "Dhamra Estuary Port Link Road Bridge", "type": "bridge", "district": "Bhadrak", "state": "Odisha", "latitude": 20.840, "longitude": 86.880, "elevation_m": 3.0, "capacity": None, "backup_power": False},
    {"id": "brg_3", "name": "Mahanadi River Bridge (Cuttack-Jagatsinghpur Bypass)", "type": "bridge", "district": "Cuttack", "state": "Odisha", "latitude": 20.485, "longitude": 85.925, "elevation_m": 18.0, "capacity": None, "backup_power": False},
    {"id": "brg_4", "name": "Brahmani River Bridge (Pattamundai)", "type": "bridge", "district": "Kendrapara", "state": "Odisha", "latitude": 20.570, "longitude": 86.560, "elevation_m": 7.0, "capacity": None, "backup_power": False},
    {"id": "brg_5", "name": "NH-16 Hanspatna Flyover & Evacuation Artery", "type": "road", "district": "Bhadrak", "state": "Odisha", "latitude": 21.030, "longitude": 86.510, "elevation_m": 10.0, "capacity": None, "backup_power": False},

    # Multi-Purpose Cyclone Shelters (OSDMA / ODRAF)
    {"id": "shlt_1", "name": "Dhamra Coastal Multi-Purpose Cyclone Shelter", "type": "shelter", "district": "Bhadrak", "state": "Odisha", "latitude": 20.812, "longitude": 86.940, "elevation_m": 5.5, "capacity": 2500, "backup_power": True},
    {"id": "shlt_2", "name": "Bhitarkanika Forest Border Cyclone Shelter", "type": "shelter", "district": "Kendrapara", "state": "Odisha", "latitude": 20.620, "longitude": 86.840, "elevation_m": 4.8, "capacity": 1800, "backup_power": True},
    {"id": "shlt_3", "name": "Talasari Beach Community Cyclone Shelter", "type": "shelter", "district": "Balasore", "state": "Odisha", "latitude": 21.605, "longitude": 87.450, "elevation_m": 6.0, "capacity": 2200, "backup_power": True},
    {"id": "shlt_4", "name": "Ersama High-Resilience Cyclone Shelter", "type": "shelter", "district": "Jagatsinghpur", "state": "Odisha", "latitude": 20.180, "longitude": 86.440, "elevation_m": 5.0, "capacity": 3000, "backup_power": True},
    {"id": "shlt_5", "name": "Chandipur Coast Defense Cyclone Shelter", "type": "shelter", "district": "Balasore", "state": "Odisha", "latitude": 21.465, "longitude": 87.015, "elevation_m": 7.5, "capacity": 2100, "backup_power": True},

    # Water Facilities
    {"id": "wtr_1", "name": "Chandbali Municipal Water Treatment & Pump House", "type": "water", "district": "Bhadrak", "state": "Odisha", "latitude": 20.785, "longitude": 86.735, "elevation_m": 4.2, "capacity": 50000, "backup_power": True},
    {"id": "wtr_2", "name": "Paradip Industrial Desalination & Potable Reservoir", "type": "water", "district": "Jagatsinghpur", "state": "Odisha", "latitude": 20.295, "longitude": 86.630, "elevation_m": 3.8, "capacity": 120000, "backup_power": True},
    {"id": "wtr_3", "name": "Bhadrak Town Surface Water Treatment Facility", "type": "water", "district": "Bhadrak", "state": "Odisha", "latitude": 21.045, "longitude": 86.520, "elevation_m": 8.5, "capacity": 80000, "backup_power": True},

    # Communication & Radar
    {"id": "com_1", "name": "Paradip Coastal Doppler Weather Radar & V-SAT", "type": "communication", "district": "Jagatsinghpur", "state": "Odisha", "latitude": 20.302, "longitude": 86.625, "elevation_m": 12.0, "capacity": None, "backup_power": True},
    {"id": "com_2", "name": "Dhamra Port Marine Radio & Telecom Tower", "type": "communication", "district": "Bhadrak", "state": "Odisha", "latitude": 20.828, "longitude": 86.935, "elevation_m": 6.0, "capacity": None, "backup_power": True}
]

class InfrastructureService:
    def __init__(self):
        self.raw_assets = INITIAL_ASSETS

    def get_analyzed_assets(
        self, 
        cyclone_track_points: List[Dict[str, Any]], 
        landfall_point: Optional[Dict[str, Any]] = None,
        max_cyclone_wind: float = 130.0
    ) -> List[InfrastructureAsset]:
        results = []
        lf_lat = landfall_point.get("latitude", 20.85) if landfall_point else 20.85
        lf_lon = landfall_point.get("longitude", 86.90) if landfall_point else 86.90

        for a in self.raw_assets:
            lat, lon = a["latitude"], a["longitude"]
            dist_track = calculate_min_distance_to_track(lat, lon, cyclone_track_points)
            dist_lf = haversine_distance_km(lat, lon, lf_lat, lf_lon)
            
            # Parametric local wind estimation
            local_wind = estimate_wind_at_distance(max_cyclone_wind, radius_max_wind_km=30.0, distance_km=dist_track)
            
            # Multi-factor ML/deterministic risk scoring
            score, level, breakdown = calculate_infrastructure_risk(
                asset_type=a["type"],
                distance_track_km=dist_track,
                distance_landfall_km=dist_lf,
                wind_kmh=local_wind,
                elevation_m=a["elevation_m"]
            )
            
            # Build list of risk factors
            factors = []
            if local_wind >= 100:
                factors.append(f"High wind exposure ({round(local_wind)} km/h)")
            if dist_lf <= 40:
                factors.append(f"Near predicted landfall center ({round(dist_lf, 1)} km)")
            if a["elevation_m"] <= 5.0 and dist_lf <= 60:
                factors.append(f"Low coastal elevation ({a['elevation_m']}m) - high storm surge risk")
            if not a.get("backup_power", True):
                factors.append("No active auxiliary power backup")
            if not factors:
                factors.append(f"Moderate perimeter exposure ({round(dist_track, 1)} km from track)")

            action = generate_prototype_action(a["type"], level, a["name"])

            asset_obj = InfrastructureAsset(
                id=a["id"],
                name=a["name"],
                type=InfrastructureType(a["type"]),
                district=a["district"],
                state=a["state"],
                latitude=lat,
                longitude=lon,
                distance_from_track_km=round(dist_track, 1),
                distance_from_landfall_km=round(dist_lf, 1),
                wind_exposure_kmh=round(local_wind, 1),
                elevation_m=a["elevation_m"],
                capacity=a.get("capacity"),
                backup_power=a.get("backup_power", True),
                risk_score=score,
                risk_category=level,
                risk_factors=factors,
                prototype_action=action,
                status="Operational"
            )
            results.append(asset_obj)

        return sorted(results, key=lambda x: x.risk_score, reverse=True)

    def get_summary(self, analyzed_assets: List[InfrastructureAsset]) -> InfrastructureSummary:
        crit = sum(1 for a in analyzed_assets if a.risk_category == RiskLevel.CRITICAL)
        high = sum(1 for a in analyzed_assets if a.risk_category == RiskLevel.HIGH)
        mod = sum(1 for a in analyzed_assets if a.risk_category == RiskLevel.MODERATE)
        
        by_type = {}
        for a in analyzed_assets:
            by_type[a.type.value] = by_type.get(a.type.value, 0) + 1

        return InfrastructureSummary(
            total_assets_monitored=len(analyzed_assets),
            critical_assets=crit,
            high_risk_assets=high,
            moderate_risk_assets=mod,
            by_type=by_type,
            assets=analyzed_assets
        )

infrastructure_service = InfrastructureService()
