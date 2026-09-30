from typing import List, Dict, Any, Optional
from app.schemas.population import PopulationExposure, DistrictExposure

DISTRICT_DEMOGRAPHICS = [
    {
        "district": "Bhadrak",
        "state": "Odisha",
        "total_population": 1506000,
        "critical_exposure": 210000,
        "high_exposure": 480000,
        "moderate_exposure": 620000,
        "evacuation_centers_active": 185,
        "coastal_vulnerability_index": 0.91
    },
    {
        "district": "Kendrapara",
        "state": "Odisha",
        "total_population": 1440000,
        "critical_exposure": 160000,
        "high_exposure": 420000,
        "moderate_exposure": 580000,
        "evacuation_centers_active": 210,
        "coastal_vulnerability_index": 0.89
    },
    {
        "district": "Balasore",
        "state": "Odisha",
        "total_population": 2320000,
        "critical_exposure": 85000,
        "high_exposure": 350000,
        "moderate_exposure": 780000,
        "evacuation_centers_active": 240,
        "coastal_vulnerability_index": 0.82
    },
    {
        "district": "Jagatsinghpur",
        "state": "Odisha",
        "total_population": 1136000,
        "critical_exposure": 30000,
        "high_exposure": 180000,
        "moderate_exposure": 420000,
        "evacuation_centers_active": 165,
        "coastal_vulnerability_index": 0.86
    }
]

GUJARAT_DEMOGRAPHICS = [
    {
        "district": "Kutch",
        "state": "Gujarat",
        "total_population": 2092000,
        "critical_exposure": 195000,
        "high_exposure": 440000,
        "moderate_exposure": 680000,
        "evacuation_centers_active": 215,
        "coastal_vulnerability_index": 0.93
    },
    {
        "district": "Devbhumi Dwarka",
        "state": "Gujarat",
        "total_population": 752000,
        "critical_exposure": 115000,
        "high_exposure": 260000,
        "moderate_exposure": 310000,
        "evacuation_centers_active": 140,
        "coastal_vulnerability_index": 0.90
    },
    {
        "district": "Jamnagar",
        "state": "Gujarat",
        "total_population": 1407000,
        "critical_exposure": 72000,
        "high_exposure": 290000,
        "moderate_exposure": 510000,
        "evacuation_centers_active": 165,
        "coastal_vulnerability_index": 0.84
    },
    {
        "district": "Morbi",
        "state": "Gujarat",
        "total_population": 960000,
        "critical_exposure": 42000,
        "high_exposure": 175000,
        "moderate_exposure": 340000,
        "evacuation_centers_active": 110,
        "coastal_vulnerability_index": 0.81
    }
]

class PopulationService:
    def calculate_exposure(self, cyclone_id: str, intensity_factor: float = 1.0) -> PopulationExposure:
        is_gujarat = "biparjoy" in (cyclone_id or "").lower()
        source_demographics = GUJARAT_DEMOGRAPHICS if is_gujarat else DISTRICT_DEMOGRAPHICS
        districts = [DistrictExposure(**d) for d in source_demographics]
        
        crit = sum(d.critical_exposure for d in districts)
        high = sum(d.high_exposure for d in districts)
        mod = sum(d.moderate_exposure for d in districts)
        tot = crit + high + mod

        return PopulationExposure(
            cyclone_id=cyclone_id,
            critical=int(crit * intensity_factor),
            high=int(high * intensity_factor),
            moderate=int(mod * intensity_factor),
            total=int(tot * intensity_factor),
            districts=districts
        )

population_service = PopulationService()
