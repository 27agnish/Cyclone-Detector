import pytest
from fastapi.testclient import TestClient
import sys
from pathlib import Path

# Ensure root is on sys.path
root_dir = Path(__file__).resolve().parent.parent
if str(root_dir) not in sys.path:
    sys.path.insert(0, str(root_dir))

from main import app

client = TestClient(app)

def test_cors_production_origin():
    # Test GET request with Vercel production origin
    headers = {"Origin": "https://cyclone-detector.vercel.app"}
    response = client.get("/api/v1/health", headers=headers)
    assert response.status_code == 200
    assert response.headers.get("access-control-allow-origin") == "https://cyclone-detector.vercel.app"
    assert response.headers.get("access-control-allow-credentials") == "true"

def test_cors_preview_origin():
    # Test GET request with Vercel preview deployment origin
    headers = {"Origin": "https://cyclone-detector-preview-123.vercel.app"}
    response = client.get("/api/v1/health", headers=headers)
    assert response.status_code == 200
    assert response.headers.get("access-control-allow-origin") == "https://cyclone-detector-preview-123.vercel.app"

def test_cors_local_origin():
    # Test GET request with local Vite dev origin
    headers = {"Origin": "http://localhost:5173"}
    response = client.get("/api/v1/health", headers=headers)
    assert response.status_code == 200
    assert response.headers.get("access-control-allow-origin") == "http://localhost:5173"

def test_cors_preflight_options():
    # Test preflight OPTIONS request
    headers = {
        "Origin": "https://cyclone-detector.vercel.app",
        "Access-Control-Request-Method": "POST",
        "Access-Control-Request-Headers": "content-type",
    }
    response = client.options("/api/v1/ai/explain-risk", headers=headers)
    assert response.status_code == 200
    assert response.headers.get("access-control-allow-origin") == "https://cyclone-detector.vercel.app"
    assert "POST" in response.headers.get("access-control-allow-methods", "")

def test_frontend_routes_match_backend():
    # Test all routes that frontend services call
    # 1. Detect cyclones
    detect = client.get("/api/v1/cyclones/detect")
    assert detect.status_code == 200
    assert "cyclones" in detect.json()
    
    # 2. Get active cyclones
    active = client.get("/api/v1/cyclones/active")
    assert active.status_code == 200

    # 3. Get cyclone detail
    detail = client.get("/api/v1/cyclones/cyclone_dana")
    assert detail.status_code == 200
    assert detail.json()["id"] == "cyclone_dana"

    # 4. Get infrastructure
    infra = client.get("/api/v1/infrastructure?cyclone_id=cyclone_dana")
    assert infra.status_code == 200

    # 5. Get population exposure
    pop = client.get("/api/v1/population?cyclone_id=cyclone_dana")
    assert pop.status_code == 200

    # 6. Map GeoJSON layers
    map_track = client.get("/api/v1/map/cyclone-track?cyclone_id=cyclone_dana")
    assert map_track.status_code == 200
    map_zones = client.get("/api/v1/map/risk-zones?cyclone_id=cyclone_dana")
    assert map_zones.status_code == 200
    map_infra = client.get("/api/v1/map/infrastructure?cyclone_id=cyclone_dana")
    assert map_infra.status_code == 200

    # 7. AI Endpoints
    ai_risk = client.post("/api/v1/ai/explain-risk", json={"cyclone_id": "cyclone_dana"})
    assert ai_risk.status_code == 200
    ai_plan = client.post("/api/v1/ai/generate-emergency-plan", json={"cyclone_id": "cyclone_dana"})
    assert ai_plan.status_code == 200
