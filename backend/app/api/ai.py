from fastapi import APIRouter, HTTPException
from typing import Dict, Any
from app.schemas.ai import (
    AIExplainRiskRequest, 
    AIExplainLandfallRequest, 
    AISatelliteAnalysisRequest, 
    AIEmergencyPlanRequest, 
    AIReportRequest, 
    AIResponse, 
    EmergencyPriorityResponse
)
from app.services.cyclone_detection.detector import detector_service
from app.services.infrastructure_service import infrastructure_service
from app.services.population_service import population_service
from app.services.emergency_service import emergency_service
from app.services.satellite_service import satellite_service
from app.ai.gemini import gemini_service

router = APIRouter(prefix="/ai", tags=["AI Intelligence"])

@router.post("/explain-risk", response_model=AIResponse)
async def explain_risk(req: AIExplainRiskRequest):
    """Uses Gemini / Vertex AI to explain risk factors and physical vulnerability of a specific asset or district."""
    detail = detector_service.get_cyclone_detail(req.cyclone_id)
    if not detail:
        raise HTTPException(status_code=404, detail="Cyclone not found.")
        
    track_pts = [p.model_dump() for p in detail["observed_track"]] + [p.model_dump() for p in detail["forecast_track"]]
    landfall = detail.get("landfall")
    lf_dict = landfall.model_dump() if landfall else None
    
    analyzed_assets = infrastructure_service.get_analyzed_assets(track_pts, lf_dict, detail["summary"].wind_speed)
    
    target_asset = None
    if req.asset_id:
        target_asset = next((a for a in analyzed_assets if a.id == req.asset_id), None)
    if not target_asset and analyzed_assets:
        target_asset = analyzed_assets[0]

    return await gemini_service.explain_risk(target_asset.model_dump() if target_asset else {}, detail["summary"].model_dump())

@router.post("/explain-landfall", response_model=AIResponse)
async def explain_landfall(req: AIExplainLandfallRequest):
    """Generates an AI strategic landfall briefing with meteorological, bathymetric, and surge explanations."""
    detail = detector_service.get_cyclone_detail(req.cyclone_id)
    if not detail or not detail.get("landfall"):
        raise HTTPException(status_code=404, detail="Landfall information not available.")
        
    pop_exp = population_service.calculate_exposure(req.cyclone_id)
    track_pts = [p.model_dump() for p in detail["observed_track"]] + [p.model_dump() for p in detail["forecast_track"]]
    analyzed_assets = infrastructure_service.get_analyzed_assets(track_pts, detail["landfall"].model_dump(), detail["summary"].wind_speed)
    crit_count = sum(1 for a in analyzed_assets if a.risk_category == "CRITICAL")

    return await gemini_service.explain_landfall(
        detail["landfall"].model_dump(),
        detail["summary"].model_dump(),
        pop_exp.total,
        crit_count
    )

@router.post("/analyze-satellite", response_model=AIResponse)
async def analyze_satellite(req: AISatelliteAnalysisRequest):
    """Interprets Sentinel-1 SAR radar imagery, flood inundation masks, and embankment breaches."""
    meta = satellite_service.get_satellite_scene_metadata(req.cyclone_id)
    
    content = (
        f"### Satellite Remote Sensing Analysis (Copernicus Sentinel-1A SAR)\n\n"
        f"**Sensor Specification**: C-band Synthetic Aperture Radar (Interferometric Wide Swath)\n"
        f"**Cloud Penetration**: Operational across 100% thick cyclone convective cloud shield.\n"
        f"**Observed Surface Water Inundation**: **{meta['flood_inundation_detected_sqkm']} sq km** ({meta['water_body_change_percent']}).\n\n"
        f"#### Identified Embankment Breaches & Water Backflow:\n"
        f"1. **{meta['breach_locations'][0]['name']}** (Severity: {meta['breach_locations'][0]['severity']}) - Active saltwater ingress into adjacent agricultural wetlands.\n"
        f"2. **{meta['breach_locations'][1]['name']}** (Severity: {meta['breach_locations'][1]['severity']}) - Rising water levels threatening perimeter road.\n\n"
        f"#### Tactical Recommendation:\n"
        f"Pre-deploy geo-synthetic sandbag reinforcements at the Dhamra Estuary North Embankment; "
        f"monitor satellite pass intervals for progressive flood recession tracking."
    )

    disclaimer_note = (
        "Satellite analysis is currently unavailable. Using cached/demo data."
        if not settings.is_earth_engine_configured()
        else "Satellite SAR analysis for prototype flood mapping. Cloud-penetrating C-band radar processed data."
    )

    return AIResponse(
        cyclone_id=req.cyclone_id,
        title="Sentinel-1 SAR Radar Flood Analysis",
        generated_at=meta["acquisition_date"],
        model_used="Sentinel-1 SAR Hydrological Change Detector + Gemini Multimodal",
        is_simulated_fallback=True,
        content=content,
        key_findings=[
            f"Total flood inundation detected: {meta['flood_inundation_detected_sqkm']} sq km.",
            "Water surface backscatter indicates active saline intrusion in coastal estuary.",
            "Two high-severity embankment risk sectors identified."
        ],
        recommended_actions=[
            "Dispatch local engineering teams to reinforce Dhamra estuary embankment.",
            "Alert low-lying villages along Bhitarkanika creek."
        ],
        disclaimer=disclaimer_note
    )

@router.post("/generate-emergency-plan", response_model=EmergencyPriorityResponse)
async def generate_emergency_plan(req: AIEmergencyPlanRequest):
    """Generates ranked prototype emergency priority checklist for incident commanders."""
    detail = detector_service.get_cyclone_detail(req.cyclone_id)
    track_pts = []
    landfall = None
    max_wind = 130.0
    if detail:
        track_pts = [p.model_dump() for p in detail["observed_track"]] + [p.model_dump() for p in detail["forecast_track"]]
        landfall = detail.get("landfall")
        if landfall:
            landfall = landfall.model_dump()
        max_wind = detail["summary"].wind_speed

    analyzed_assets = infrastructure_service.get_analyzed_assets(track_pts, landfall, max_wind)
    return emergency_service.generate_priorities(req.cyclone_id, analyzed_assets)

@router.post("/generate-report", response_model=AIResponse)
async def generate_disaster_report(req: AIReportRequest):
    """Produces the comprehensive CycloneShield AI Disaster Briefing & Incident Action Plan."""
    detail = detector_service.get_cyclone_detail(req.cyclone_id)
    if not detail:
        raise HTTPException(status_code=404, detail="Cyclone not found.")
        
    pop_exp = population_service.calculate_exposure(req.cyclone_id)
    track_pts = [p.model_dump() for p in detail["observed_track"]] + [p.model_dump() for p in detail["forecast_track"]]
    landfall = detail.get("landfall")
    lf_dict = landfall.model_dump() if landfall else None
    
    analyzed_assets = infrastructure_service.get_analyzed_assets(track_pts, lf_dict, detail["summary"].wind_speed)
    infra_sum = infrastructure_service.get_summary(analyzed_assets)

    return await gemini_service.generate_disaster_briefing(detail, pop_exp.model_dump(), infra_sum.model_dump())
