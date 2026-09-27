from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from datetime import datetime, timezone

from app.config import settings
from app.api.cyclones import router as cyclones_router
from app.api.risk import router as risk_router
from app.api.infrastructure import router as infra_router
from app.api.population import router as population_router
from app.api.maps import router as maps_router
from app.api.ai import router as ai_router
from app.services.cyclone_detection.scheduler import cyclone_scheduler
from app.services.cyclone_detection.detector import detector_service

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: preload active cyclone and start periodic scheduler
    detector_service.detect_active_cyclones()
    cyclone_scheduler.start()
    yield
    # Shutdown: stop background scheduler cleanly
    cyclone_scheduler.stop()

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="Track-Based Cyclone Impact & Infrastructure Vulnerability Forecaster API",
    lifespan=lifespan
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Health endpoint with safe service status reporting
@app.get("/api/v1/health", tags=["Health"])
def health_check():
    return {
        "status": "ok",
        "service": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "demo_mode": settings.DEMO_MODE,
        "refresh_interval_minutes": settings.CYCLONE_REFRESH_INTERVAL_MINUTES,
        "services": {
            "database": "connected",
            "gemini": "configured" if settings.is_gemini_configured() else "not_configured",
            "cyclone_data": "available",
            "earth_engine": "configured" if settings.is_earth_engine_configured() else "not_configured",
            "google_maps": "configured" if settings.is_google_maps_configured() else "not_configured"
        }
    }

# Register API v1 routers
app.include_router(cyclones_router, prefix=settings.API_V1_STR)
app.include_router(risk_router, prefix=settings.API_V1_STR)
app.include_router(infra_router, prefix=settings.API_V1_STR)
app.include_router(population_router, prefix=settings.API_V1_STR)
app.include_router(maps_router, prefix=settings.API_V1_STR)
app.include_router(ai_router, prefix=settings.API_V1_STR)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
