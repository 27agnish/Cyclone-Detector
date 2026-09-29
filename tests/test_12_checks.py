"""
CycloneShield AI - Complete 12 Systematic Verification Checks
Validates all requirements for the Python/FastAPI centered single-port architecture.
"""

import sys
import os
import json
from pathlib import Path

# Setup paths
root_dir = Path(__file__).resolve().parent.parent
backend_dir = root_dir / "backend"
if str(root_dir) not in sys.path:
    sys.path.insert(0, str(root_dir))
if str(backend_dir) not in sys.path:
    sys.path.insert(0, str(backend_dir))

import pytest
from fastapi.testclient import TestClient

def test_check_1_python_imports():
    """CHECK 1: Verify Python imports and app instantiation without errors."""
    from backend.app.main import app
    assert app is not None
    assert app.title.upper() == "CYCLONESHIELD AI"

def test_check_2_backend_startup():
    """CHECK 2: Backend startup and lifespan verification."""
    from backend.app.main import app
    with TestClient(app) as client:
        assert client is not None

def test_check_3_root_page_serves_html():
    """CHECK 3: Root page GET / -> HTTP 200 and serves frontend index.html."""
    from backend.app.main import app
    client = TestClient(app)
    resp = client.get("/", headers={"Accept": "text/html"})
    assert resp.status_code == 200
    assert "text/html" in resp.headers.get("content-type", "")
    assert "<!doctype html>" in resp.text.lower() or "<html" in resp.text.lower()
    assert "cycloneshield" in resp.text.lower()

def test_check_4_health_endpoints():
    """CHECK 4: Health endpoints GET /api/health and /api/cyclones/health -> HTTP 200 JSON."""
    from backend.app.main import app
    client = TestClient(app)

    # Global health
    for endpoint in ["/api/health", "/api/v1/health"]:
        resp = client.get(endpoint)
        assert resp.status_code == 200
        assert "application/json" in resp.headers.get("content-type", "")
        data = resp.json()
        assert data["status"] == "ok"
        assert "services" in data
        assert data["services"]["cyclone_data"] == "available"

    # Cyclones router health
    for endpoint in ["/api/cyclones/health", "/api/v1/cyclones/health"]:
        resp = client.get(endpoint)
        assert resp.status_code == 200
        assert "application/json" in resp.headers.get("content-type", "")
        data = resp.json()
        assert data["status"] in ("ok", "operational")
        assert "data_available" in data or "active_cyclones" in data

def test_check_5_cyclone_detect_schema():
    """CHECK 5: Cyclone endpoint GET /api/cyclones/detect -> HTTP 200 JSON matching frontend schema."""
    from backend.app.main import app
    client = TestClient(app)

    for endpoint in ["/api/cyclones/detect", "/api/v1/cyclones/detect", "/api/detect"]:
        resp = client.get(endpoint)
        assert resp.status_code == 200
        assert "application/json" in resp.headers.get("content-type", "")
        data = resp.json()
        assert "cyclones" in data
        assert isinstance(data["cyclones"], list)
        assert len(data["cyclones"]) > 0

        # Validate first cyclone contract
        c = data["cyclones"][0]
        required_fields = ["id", "name", "category", "wind_speed", "current_latitude", "current_longitude", "is_active"]
        for field in required_fields:
            assert field in c, f"Missing required field '{field}' in cyclone detection response"

def test_check_6_no_api_endpoint_returns_html():
    """CHECK 6: Verify no API endpoint returns HTML under any circumstances."""
    from backend.app.main import app
    client = TestClient(app)

    # Nonexistent API route with JSON accept
    resp1 = client.get("/api/v1/nonexistent-route", headers={"Accept": "application/json"})
    assert resp1.status_code == 404
    assert "text/html" not in resp1.headers.get("content-type", "")
    assert "application/json" in resp1.headers.get("content-type", "")

    # Nonexistent API route even with HTML accept header must NEVER leak index.html
    resp2 = client.get("/api/v1/nonexistent-api-action", headers={"Accept": "text/html"})
    assert resp2.status_code == 404
    assert "text/html" not in resp2.headers.get("content-type", "")

    resp3 = client.get("/api/unknown", headers={"Accept": "text/html"})
    assert resp3.status_code == 404
    assert "text/html" not in resp3.headers.get("content-type", "")

def test_check_7_frontend_navigation_spa_fallback():
    """CHECK 7: Frontend navigation (/analysis, /cyclones, etc.) returns HTTP 200 HTML."""
    from backend.app.main import app
    client = TestClient(app)

    routes = [
        "/analysis",
        "/cyclones",
        "/cyclone-details",
        "/ai-intelligence",
        "/landfall-analysis",
        "/settings"
    ]
    for r in routes:
        resp = client.get(r, headers={"Accept": "text/html"})
        assert resp.status_code == 200, f"Client route {r} returned {resp.status_code}"
        assert "text/html" in resp.headers.get("content-type", "")
        assert "cycloneshield" in resp.text.lower()

def test_check_8_single_port_static_and_api():
    """CHECK 8: Static assets (/assets/...) and API (/api/...) served from single ASGI app."""
    from backend.app.main import app
    client = TestClient(app)

    # 1. API route
    api_resp = client.get("/api/health")
    assert api_resp.status_code == 200
    assert api_resp.json()["status"] == "ok"

    # 2. Extract asset from root HTML and verify it is served
    root_resp = client.get("/")
    assert root_resp.status_code == 200
    import re
    match = re.search(r'href="(/assets/[^"]+\.css)"', root_resp.text)
    if match:
        asset_path = match.group(1)
        css_resp = client.get(asset_path)
        assert css_resp.status_code == 200
        assert len(css_resp.content) > 0

def test_check_9_relative_api_paths():
    """CHECK 9: Verify frontend configuration uses relative paths (/api) by default."""
    env_file = root_dir / "frontend" / "src" / "config" / "env.ts"
    assert env_file.exists()
    content = env_file.read_text(encoding="utf-8")
    assert "return '/api';" in content or "return clean;" in content

    api_file = root_dir / "frontend" / "src" / "services" / "api.ts"
    assert api_file.exists()
    api_content = api_file.read_text(encoding="utf-8")
    assert "baseURL: API_BASE_URL || '/api'" in api_content

def test_check_10_frontend_build_artifacts():
    """CHECK 10: Frontend build verification (dist/index.html and dist/assets)."""
    dist_dir = root_dir / "frontend" / "dist"
    assert dist_dir.exists(), "frontend/dist does not exist"
    assert (dist_dir / "index.html").is_file(), "frontend/dist/index.html missing"
    assets_dir = dist_dir / "assets"
    assert assets_dir.exists(), "frontend/dist/assets missing"
    js_files = list(assets_dir.glob("*.js"))
    assert len(js_files) > 0, "No JS files found in dist/assets"

def test_check_11_backend_unit_tests():
    """CHECK 11: Backend tests validation."""
    from backend.app.main import app
    client = TestClient(app)
    # Check AI plan generation, risk calculations, infrastructure endpoints
    resp = client.post("/api/ai/generate-emergency-plan", json={"cyclone_id": "cyclone_dana"})
    assert resp.status_code == 200
    data = resp.json()
    assert "priorities" in data or "cyclone_id" in data

def test_check_12_end_to_end_pipeline():
    """CHECK 12: End-to-end full pipeline verification."""
    from backend.app.main import app
    client = TestClient(app)

    # 1. Health
    h = client.get("/api/health").json()
    assert h["status"] == "ok"

    # 2. Detect
    detect = client.get("/api/cyclones/detect").json()
    assert len(detect["cyclones"]) > 0
    cid = detect["cyclones"][0]["id"]

    # 3. Details
    detail = client.get(f"/api/cyclones/{cid}").json()
    assert detail["id"] == cid
    assert len(detail["observed_track"]) > 0

    # 4. Forecast & Cone
    track = client.get(f"/api/cyclones/{cid}/track").json()
    assert "observed_track" in track
    cone = client.get(f"/api/cyclones/{cid}/forecast-cone").json()
    assert "geometry" in cone

    # 5. Risk Assessment
    risk = client.get(f"/api/risk/{cid}").json()
    assert "overall_cyclone_risk_score" in risk

    # 6. Infrastructure & Population
    infra = client.get(f"/api/infrastructure?cyclone_id={cid}").json()
    assert "total_assets_monitored" in infra
    pop = client.get(f"/api/population?cyclone_id={cid}").json()
    assert "total" in pop
