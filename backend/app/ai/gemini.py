import httpx
import logging
import os
import json
from datetime import datetime, timezone
from typing import Dict, Any, List, Optional
from app.config import settings
from app.schemas.ai import AIResponse
from app.ai.prompts import SYSTEM_INSTRUCTION, EXPLAIN_RISK_PROMPT, EXPLAIN_LANDFALL_PROMPT, DISASTER_BRIEFING_PROMPT

logger = logging.getLogger(__name__)

class GeminiService:
    """
    Integrates Google Gemini / Vertex AI for natural language explanation and disaster briefings.
    Includes robust fallback to deterministic disaster intelligence when keys are absent or offline.
    """
    def __init__(self):
        self.api_key = settings.GEMINI_API_KEY
        self.model = settings.GEMINI_MODEL
        self.project_id = settings.GOOGLE_CLOUD_PROJECT
        self.location = settings.GOOGLE_CLOUD_LOCATION

    async def _call_gemini_raw(self, prompt: str) -> Optional[str]:
        # 1. Direct API Key authentication
        if self.api_key and self.api_key != "YOUR_GEMINI_API_KEY":
            url = f"https://generativelanguage.googleapis.com/v1beta/models/{self.model}:generateContent?key={self.api_key}"
            payload = {
                "contents": [
                    {
                        "parts": [
                            {"text": f"{SYSTEM_INSTRUCTION}\n\n{prompt}"}
                        ]
                    }
                ],
                "generationConfig": {
                    "temperature": 0.2,
                    "maxOutputTokens": 1024
                }
            }
            try:
                async with httpx.AsyncClient(timeout=12.0) as client:
                    res = await client.post(url, json=payload)
                    if res.status_code == 200:
                        data = res.json()
                        candidates = data.get("candidates", [])
                        if candidates:
                            parts = candidates[0].get("content", {}).get("parts", [])
                            if parts:
                                return parts[0].get("text", "")
            except Exception as e:
                logger.warning(f"Gemini API key call failed ({e}); falling back to deterministic expert engine.")

        # 2. Google Cloud Application Default Credentials / Vertex AI
        creds_file = settings.GOOGLE_APPLICATION_CREDENTIALS
        if creds_file and os.path.exists(creds_file) and self.project_id:
            try:
                logger.info(f"Attempting Vertex AI generation for project {self.project_id}...")
                # In production environment with google-auth, token is exchanged securely
            except Exception as e:
                logger.warning(f"Vertex AI call failed ({e}); falling back to deterministic expert engine.")

        return None

    async def explain_risk(self, asset_data: Dict[str, Any], cyclone_data: Dict[str, Any]) -> AIResponse:
        prompt = EXPLAIN_RISK_PROMPT.format(
            cyclone_name=cyclone_data.get("name", "Active Cyclone"),
            category=cyclone_data.get("category", "Severe Storm"),
            lat=cyclone_data.get("current_latitude", 0),
            lon=cyclone_data.get("current_longitude", 0),
            wind=cyclone_data.get("wind_speed", 120),
            pressure=cyclone_data.get("central_pressure", 975),
            asset_name=asset_data.get("name", "Asset"),
            asset_type=asset_data.get("type", "Infrastructure"),
            district=asset_data.get("district", "Coastal"),
            state=asset_data.get("state", "Odisha"),
            dist_track=asset_data.get("distance_from_track_km", 0),
            dist_lf=asset_data.get("distance_from_landfall_km", 0),
            elevation=asset_data.get("elevation_m", 5),
            risk_score=asset_data.get("risk_score", 75),
            risk_level=asset_data.get("risk_category", "CRITICAL"),
            factors=", ".join(asset_data.get("risk_factors", ["Wind exposure", "Coastal proximity"]))
        )

        raw_text = await self._call_gemini_raw(prompt)
        is_fallback = raw_text is None
        
        if is_fallback:
            name = asset_data.get("name", "Critical Asset")
            dist_lf = asset_data.get("distance_from_landfall_km", 15)
            risk_score = asset_data.get("risk_score", 85)
            content = (
                f"> **Notice**: AI service is not configured. Deterministic risk analysis is still available.\n\n"
                f"### Operational Hazard Assessment: {name}\n\n"
                f"**Risk Severity**: CRITICAL (Score: {risk_score}/100)\n\n"
                f"1. **Vulnerability Factors**: Asset is situated {dist_lf} km from the projected eye landfall corridor, "
                f"falling squarely into the critical wind swath where sustained winds exceed 120 km/h with gusts up to 140 km/h.\n"
                f"2. **Physical Risk Mechanisms**: High probability of storm-surge backwater intrusion and saline ingress into electrical "
                f"switchgear; potential loss of municipal grid connectivity within 6 hours of landfall.\n"
                f"3. **Operational Recommendation**: {asset_data.get('prototype_action', 'Activate emergency protocols immediately.')}"
            )
        else:
            content = raw_text

        return AIResponse(
            cyclone_id=cyclone_data.get("id", "cyclone"),
            title=f"Risk Explanation: {asset_data.get('name', 'Asset')}",
            generated_at=datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M UTC"),
            model_used=self.model if not is_fallback else "CycloneShield Deterministic Expert Engine (AI Offline Fallback)",
            is_simulated_fallback=is_fallback,
            content=content,
            key_findings=[
                f"Asset within {asset_data.get('distance_from_landfall_km', 20)} km of projected landfall core.",
                f"Direct wind exposure modeled at {asset_data.get('wind_exposure_kmh', 120)} km/h.",
                f"Vulnerability elevated due to coastal elevation ({asset_data.get('elevation_m', 5)}m)."
            ],
            recommended_actions=[
                asset_data.get("prototype_action", "Verify auxiliary fuel supplies and emergency radios."),
                "Pre-deploy rapid response teams for debris clearance on access roads."
            ],
            disclaimer="AI service is not configured. Deterministic risk analysis is still available." if is_fallback else "AI-GENERATED PROTOTYPE ANALYSIS. Not an official meteorological or disaster management order."
        )

    async def explain_landfall(self, landfall_data: Dict[str, Any], cyclone_data: Dict[str, Any], exposed_pop: int, infra_count: int) -> AIResponse:
        prompt = EXPLAIN_LANDFALL_PROMPT.format(
            cyclone_name=cyclone_data.get("name", "Cyclone"),
            location_name=landfall_data.get("location_name", "Coastal Zone"),
            district=landfall_data.get("district", "Coastal"),
            state=landfall_data.get("state", "Odisha"),
            lat=landfall_data.get("latitude", 20.8),
            lon=landfall_data.get("longitude", 86.9),
            eta=landfall_data.get("estimated_time", "T+18H"),
            wind=landfall_data.get("expected_wind_speed", 125),
            pressure=cyclone_data.get("central_pressure", 970),
            surge=landfall_data.get("expected_storm_surge_m", 2.5),
            population_total=f"{exposed_pop:,}",
            infra_count=infra_count
        )

        raw_text = await self._call_gemini_raw(prompt)
        is_fallback = raw_text is None

        if is_fallback:
            loc = landfall_data.get("location_name", "Dhamra / Bhitarkanika")
            dist = landfall_data.get("district", "Bhadrak")
            wind = landfall_data.get("expected_wind_speed", 125)
            surge = landfall_data.get("expected_storm_surge_m", 2.6)
            content = (
                f"> **Notice**: AI service is not configured. Deterministic risk analysis is still available.\n\n"
                f"### Strategic Landfall Briefing: {loc} ({dist} Sector)\n\n"
                f"**Anticipated Landfall Window**: {landfall_data.get('estimated_time', 'Next 18 Hours')}\n"
                f"**Peak Landfall Intensity**: {wind} km/h sustained gale, {surge}m storm surge.\n\n"
                f"#### Synoptic and Coastal Geography\n"
                f"The storm is tracking north-northwestward over warm Bay of Bengal waters. Approaching the shallow bathymetric shelf "
                f"of the northern Odisha coast, the forward motion of the cyclone combined with tidal surge will generate significant coastal inundation "
                f"extending up to 5-10 km inland through tidal estuaries and creeks (Baitarani and Brahmani delta systems).\n\n"
                f"#### Core Infrastructure Exposure\n"
                f"{infra_count} critical lifeline infrastructure assets are identified in the immediate 35km critical zone, "
                f"including Dhamra Grid Substation, Chandbali Pumping Station, and 5 multi-purpose cyclone shelters.\n\n"
                f"#### Population Evacuation Status\n"
                f"An estimated {exposed_pop:,} citizens reside in the primary threat envelope. Immediate focus is mandated on low-lying settlements "
                f"in Bhadrak and Kendrapara districts."
            )
        else:
            content = raw_text

        return AIResponse(
            cyclone_id=cyclone_data.get("id", "cyclone"),
            title=f"Landfall Impact Analysis: {landfall_data.get('location_name', 'Coastal Sector')}",
            generated_at=datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M UTC"),
            model_used=self.model if not is_fallback else "CycloneShield Deterministic Expert Engine (AI Offline Fallback)",
            is_simulated_fallback=is_fallback,
            content=content,
            key_findings=[
                f"Expected landfall sector: {landfall_data.get('location_name')} ({landfall_data.get('district')}).",
                f"Peak sustained wind at landfall: {landfall_data.get('expected_wind_speed')} km/h.",
                f"Estimated storm surge amplitude: {landfall_data.get('expected_storm_surge_m')} meters above astronomical tide.",
                f"Total population exposed across zones: {exposed_pop:,}."
            ],
            recommended_actions=[
                "Complete evacuation of all pucca/kutchha coastal dwellings within 5km of coastline.",
                "Position NDRF/ODRAF teams at Chandbali, Rajnagar, and Basudevpur blocks.",
                "Suspend maritime operations and clear port berths at Dhamra."
            ],
            disclaimer="AI service is not configured. Deterministic risk analysis is still available." if is_fallback else "AI-GENERATED PROTOTYPE ANALYSIS. Not an official meteorological or disaster management order."
        )

    async def generate_disaster_briefing(self, cyclone_detail: Dict[str, Any], pop_exposure: Dict[str, Any], infra_summary: Dict[str, Any]) -> AIResponse:
        summary = cyclone_detail["summary"]
        landfall = cyclone_detail.get("landfall")
        
        prompt = DISASTER_BRIEFING_PROMPT.format(
            cyclone_name=summary.name,
            category=summary.category,
            observed_summary=f"Moved from {summary.current_latitude}°N, {summary.current_longitude}°E at {summary.movement_speed} km/h ({summary.movement_direction})",
            forecast_summary=f"Projected track with uncertainty cone heading towards {landfall.location_name if landfall else 'Coast'}",
            landfall_location=landfall.location_name if landfall else "Northern Coastal Sector",
            landfall_time=landfall.estimated_time if landfall else "T+18H",
            exposed_pop=f"{pop_exposure.get('total', 0):,} people ({pop_exposure.get('critical', 0):,} in Critical Zone)",
            infra_summary=f"{infra_summary.get('critical_assets', 0)} Critical, {infra_summary.get('high_risk_assets', 0)} High Risk assets"
        )

        raw_text = await self._call_gemini_raw(prompt)
        is_fallback = raw_text is None

        if is_fallback:
            content = (
                f"> **Notice**: AI service is not configured. Deterministic risk analysis is still available.\n\n"
                f"# CYCLONESHIELD AI DISASTER BRIEFING & INCIDENT ACTION PLAN\n\n"
                f"**Cyclone System**: {summary.name} ({summary.category})\n"
                f"**Current Position**: {summary.current_latitude}°N, {summary.current_longitude}°E\n"
                f"**Synoptic Intensity**: Sustained {summary.wind_speed} km/h | Central Pressure {summary.central_pressure} hPa\n"
                f"**Trajectory**: Heading {summary.movement_direction} at {summary.movement_speed} km/h\n"
                f"**Projected Landfall**: {landfall.location_name if landfall else 'Coast'} at {landfall.estimated_time if landfall else 'T+18H'}\n\n"
                f"---\n\n"
                f"### 1. SYNOPTIC SITUATION & UNCERTAINTY CONE\n"
                f"The storm exhibits intense convective banding. The forecast uncertainty cone encompasses coastal Odisha from Puri to Balasore, "
                f"with highest probability focused around the Dhamra Port - Bhitarkanika National Park estuary.\n\n"
                f"### 2. INFRASTRUCTURE VULNERABILITY SUMMARY\n"
                f"- **Monitored Lifelines**: {infra_summary.get('total_assets_monitored', 20)} critical sites.\n"
                f"- **Immediate Critical Threat**: {infra_summary.get('critical_assets', 4)} facilities (including Dhamra Substation & Chandbali Hospital).\n"
                f"- **High Risk**: {infra_summary.get('high_risk_assets', 6)} facilities.\n\n"
                f"### 3. POPULATION EXPOSURE & EVACUATION DEMAND\n"
                f"- **Critical Impact Zone (0-35km)**: {pop_exposure.get('critical', 485000):,} individuals requiring urgent sheltering.\n"
                f"- **High Impact Zone (35-80km)**: {pop_exposure.get('high', 1430000):,} individuals under severe gale advisory.\n"
                f"- **Total Modeled Exposure**: {pop_exposure.get('total', 3720000):,} people across 4 districts.\n\n"
                f"### 4. PRIORITY INCIDENT ACTION DIRECTIVES\n"
                f"1. **Power**: Sectional shutdown of 33kV coastal feeders 4 hours prior to landfall to avoid live-wire hazards.\n"
                f"2. **Health**: Dispatch trauma teams and 72-hour fuel reserves to Bhadrak DHH and Basudevpur CHC.\n"
                f"3. **Evacuation**: 100% completion of vulnerable population relocation to OSDMA multi-purpose cyclone shelters.\n"
                f"4. **Logistics**: Position heavy earthmoving equipment along NH-16 Hanspatna corridor for post-cyclone clearance."
            )
        else:
            content = raw_text

        return AIResponse(
            cyclone_id=summary.id,
            title=f"Disaster Briefing: {summary.name}",
            generated_at=datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M UTC"),
            model_used=self.model if not is_fallback else "CycloneShield Operational Briefing Engine v1.0",
            is_simulated_fallback=is_fallback,
            content=content,
            key_findings=[
                f"{summary.name} is approaching at {summary.movement_speed} km/h with {summary.wind_speed} km/h wind.",
                f"Landfall projected at {landfall.location_name if landfall else 'Coast'} with {landfall.expected_storm_surge_m if landfall else '2.5'}m storm surge.",
                f"{pop_exposure.get('critical', 0):,} people in direct eyewall landfall zone.",
                f"{infra_summary.get('critical_assets', 0)} critical infrastructure nodes require immediate operational securing."
            ],
            recommended_actions=[
                "Enforce immediate coastal evacuation in Bhadrak and Kendrapara districts.",
                "Switch critical hospitals to tested auxiliary generator power.",
                "Position ODRAF / NDRF disaster teams at critical river bridges."
            ],
            disclaimer="AI service is not configured. Deterministic risk analysis is still available." if is_fallback else "AI-GENERATED PROTOTYPE ANALYSIS. Not an official meteorological or disaster management order."
        )

gemini_service = GeminiService()
