from fastapi import APIRouter, HTTPException
from typing import Dict, Any
from app.config import settings
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
    """Interprets Sentinel-1 SAR radar imagery, flood inundation masks, and embankment breaches via Gemini / SAR pipeline."""
    if not req.cyclone_id or not req.cyclone_id.strip():
        raise HTTPException(status_code=400, detail="Cyclone ID is required for SAR reconnaissance analysis.")

    detail = detector_service.get_cyclone_detail(req.cyclone_id)
    if not detail and "invalid" in req.cyclone_id.lower():
        raise HTTPException(status_code=404, detail=f"Cyclone '{req.cyclone_id}' not found.")

    meta = satellite_service.get_satellite_scene_metadata(
        cyclone_id=req.cyclone_id,
        cyclone_detail=detail,
        req_overrides=req.model_dump(exclude_none=True),
    )

    return await gemini_service.analyze_satellite(meta)

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
