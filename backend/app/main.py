import sys
import os
from pathlib import Path

# Ensure 'backend' directory is on sys.path so 'app.*' imports work from any working directory
backend_dir = Path(__file__).resolve().parent.parent
root_dir = backend_dir.parent
if str(backend_dir) not in sys.path:
    sys.path.insert(0, str(backend_dir))
if str(root_dir) not in sys.path:
    sys.path.insert(0, str(root_dir))

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
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

from starlette.requests import Request

@app.middleware("http")
async def normalize_api_path(request: Request, call_next):
    """
    Normalizes request paths to ensure full compatibility with Vercel serverless rewrites,
    proxy configurations, and direct single-port access.
    """
    matched_path = (
        request.headers.get("x-matched-path") or
        request.headers.get("x-vercel-matched-path") or
        request.headers.get("x-forwarded-uri") or
        ""
    )
    if matched_path and matched_path not in ("/api/index.py", "/api/index.py/"):
        request.scope["path"] = matched_path.split("?")[0]

    path = request.scope.get("path", "")
    if path in ("/api/index.py", "/api/index.py/"):
        request.scope["path"] = "/"
    elif path.startswith("/api/v1/api/v1"):
        request.scope["path"] = path.replace("/api/v1/api/v1", "/api/v1", 1)
    elif path.startswith("/api/api/"):
        request.scope["path"] = path.replace("/api/api/", "/api/", 1)
    elif path.startswith("/v1/"):
        request.scope["path"] = "/api" + path

    return await call_next(request)

# Resolve frontend distribution directory (frontend/dist)
frontend_dist = Path(__file__).resolve().parent.parent.parent / "frontend" / "dist"
if not frontend_dist.exists():
    frontend_dist = Path(__file__).resolve().parent.parent / "frontend" / "dist"

# Mount frontend assets for same-port delivery (e.g. http://127.0.0.1:8000/assets/...)
if frontend_dist.exists():
    assets_dir = frontend_dist / "assets"
    if assets_dir.exists():
        app.mount("/assets", StaticFiles(directory=str(assets_dir)), name="static_assets")

@app.get("/", tags=["System"])
def root(request: Request):
    index_file = frontend_dist / "index.html"
    if index_file.exists():
        return FileResponse(str(index_file))

    return {
        "name": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "status": "online",
        "docs_url": "/api/docs",
        "health_url": "/api/health",
        "note": "Frontend build not found. Run 'npm run build' in frontend directory."
    }

@app.get("/index.html", include_in_schema=False)
@app.get("/app", include_in_schema=False)
@app.get("/ui", include_in_schema=False)
def serve_app():
    index_file = frontend_dist / "index.html"
    if index_file.exists():
        return FileResponse(str(index_file))
    raise HTTPException(status_code=404, detail="Frontend build not found. Run 'npm run build' in frontend directory.")

@app.get("/favicon.svg", include_in_schema=False)
def serve_favicon():
    fav = frontend_dist / "favicon.svg"
    if fav.exists():
        return FileResponse(str(fav))
    raise HTTPException(status_code=404)

@app.get("/icons.svg", include_in_schema=False)
def serve_icons():
    ic = frontend_dist / "icons.svg"
    if ic.exists():
        return FileResponse(str(ic))
    raise HTTPException(status_code=404)

# API root info endpoint
@app.get("/api", tags=["System"])
@app.get("/api/", tags=["System"], include_in_schema=False)
@app.get("/api/v1", tags=["System"], include_in_schema=False)
@app.get("/api/v1/", tags=["System"], include_in_schema=False)
def api_root():
    return {
        "name": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "status": "online",
        "docs_url": "/api/docs",
        "health_url": "/api/health",
    }

# Health endpoint with safe service status reporting
@app.get("/api/health", tags=["Health"])
@app.get("/api/health/", tags=["Health"], include_in_schema=False)
@app.get("/api/v1/health", tags=["Health"], include_in_schema=False)
@app.get("/api/v1/health/", tags=["Health"], include_in_schema=False)
@app.get("/health", tags=["Health"], include_in_schema=False)
@app.get("/health/", tags=["Health"], include_in_schema=False)
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

# Register API routers under both /api and /api/v1 for complete REST consistency
for api_prefix in ("/api", "/api/v1"):
    app.include_router(cyclones_router, prefix=api_prefix)
    app.include_router(risk_router, prefix=api_prefix)
    app.include_router(infra_router, prefix=api_prefix)
    app.include_router(population_router, prefix=api_prefix)
    app.include_router(maps_router, prefix=api_prefix)
    app.include_router(ai_router, prefix=api_prefix)

# Direct detection endpoint aliases
@app.get("/api/detect", tags=["Cyclones"], include_in_schema=False)
@app.get("/api/v1/detect", tags=["Cyclones"], include_in_schema=False)
@app.get("/detect", tags=["Cyclones"], include_in_schema=False)
def direct_detect(force_refresh: bool = False):
    from app.api.cyclones import trigger_detection
    return trigger_detection(force_refresh=force_refresh)

# SPA fallback for browser client routes (e.g. /cyclones, /analysis, /landfall)
@app.get("/{full_path:path}", include_in_schema=False)
def spa_fallback(full_path: str, request: Request):
    # API, docs, or health requests must NEVER return HTML index.html
    api_prefixes = ("api", "docs", "health", "openapi.json")
    if any(full_path == p or full_path.startswith(f"{p}/") for p in api_prefixes):
        raise HTTPException(status_code=404, detail=f"API route '/{full_path}' not found")

    # If the client explicitly requests JSON (non-browser client), don't return HTML
    accept = request.headers.get("accept", "")
    if "text/html" not in accept and ("application/json" in accept or "text/json" in accept):
        raise HTTPException(status_code=404, detail=f"Route '/{full_path}' not found")

    # If a static asset file exists in frontend/dist, serve it directly
    file_path = frontend_dist / full_path
    if file_path.is_file():
        return FileResponse(str(file_path))

    # For browser client navigation (e.g. /analysis, /cyclones, /cyclone-details, /settings), serve index.html
    index_file = frontend_dist / "index.html"
    if index_file.exists():
        return FileResponse(str(index_file))

    raise HTTPException(status_code=404, detail="Frontend build not found. Run 'npm run build' in frontend directory.")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
