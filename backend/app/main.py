import sys
import os
from pathlib import Path

# Ensure 'backend' directory is on sys.path so 'app.*' imports work from any working directory
backend_dir = Path(__file__).resolve().parent.parent
if str(backend_dir) not in sys.path:
    sys.path.insert(0, str(backend_dir))

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
    # Startup: preload active cyclone and start periodic scheduler (only in persistent servers)
    detector_service.detect_active_cyclones()
    is_serverless = bool(os.getenv("VERCEL") or os.getenv("AWS_LAMBDA_FUNCTION_NAME"))
    if not is_serverless:
        cyclone_scheduler.start()
    yield
    # Shutdown: stop background scheduler cleanly
    if not is_serverless:
        cyclone_scheduler.stop()

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="Track-Based Cyclone Impact & Infrastructure Vulnerability Forecaster API",
    lifespan=lifespan,
    redirect_slashes=False,
    docs_url="/api/docs",
    openapi_url="/api/openapi.json",
)

# CORS configuration: Allow production Vercel frontend, preview deployments, and local dev
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_origin_regex=r"https://.*\.vercel\.app",
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allow_headers=["*"],
)

@app.get("/", tags=["System"])
@app.get("/api", include_in_schema=False)
@app.get("/api/v1", include_in_schema=False)
def root():
    return {
        "name": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "docs_url": "/api/docs",
        "health_url": f"{settings.API_V1_STR}/health"
    }

# Health endpoint with safe service status reporting
@app.get("/api/v1/health", tags=["Health"])
@app.get("/api/v1/health/", include_in_schema=False)
@app.get("/api/health", include_in_schema=False)
@app.get("/api/health/", include_in_schema=False)
@app.get("/health", include_in_schema=False)
@app.get("/health/", include_in_schema=False)
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
