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

def test_vercel_serverless_entrypoint():
    from api.index import app as vercel_app
    vclient = TestClient(vercel_app)
    
    # Test root and /api /api/v1 alias
    resp_root = vclient.get("/")
    assert resp_root.status_code == 200
    if "text/html" in resp_root.headers.get("content-type", ""):
        assert "cycloneshield" in resp_root.text.lower()
    else:
        assert resp_root.json()["name"] == "CYCLONESHIELD AI"
    
    resp_api = vclient.get("/api")
    assert resp_api.status_code == 200

    resp_apiv1 = vclient.get("/api/v1")
    assert resp_apiv1.status_code == 200
    
    # Test health endpoints
    for endpoint in ["/api/v1/health", "/api/v1/health/", "/api/health", "/api/health/", "/health", "/health/"]:
        h_resp = vclient.get(endpoint)
        assert h_resp.status_code == 200
        assert h_resp.json()["status"] == "ok"
    
    # Test active cyclones
    cyc_resp = vclient.get("/api/v1/cyclones/active")
    assert cyc_resp.status_code == 200
    assert "application/json" in cyc_resp.headers.get("content-type", "")

    # Test detect endpoint used by fetchInitialData()
    detect_resp = vclient.get("/api/v1/cyclones/detect")
    assert detect_resp.status_code == 200
    assert "application/json" in detect_resp.headers.get("content-type", "")
    detect_data = detect_resp.json()
    assert "cyclones" in detect_data
    assert isinstance(detect_data["cyclones"], list)
    assert len(detect_data["cyclones"]) > 0

    # Test detail endpoint used by fetchInitialData()
    detail_resp = vclient.get("/api/v1/cyclones/cyclone_dana")
    assert detail_resp.status_code == 200
    assert "application/json" in detail_resp.headers.get("content-type", "")
    detail_data = detail_resp.json()
    assert "observed_track" in detail_data
    assert isinstance(detail_data["observed_track"], list)
    assert len(detail_data["observed_track"]) > 0

    # Test infrastructure and population endpoints used by fetchInitialData()
    infra_resp = vclient.get("/api/v1/infrastructure?cyclone_id=cyclone_dana")
    assert infra_resp.status_code == 200
    assert "application/json" in infra_resp.headers.get("content-type", "")

    pop_resp = vclient.get("/api/v1/population?cyclone_id=cyclone_dana")
    assert pop_resp.status_code == 200
    assert "application/json" in pop_resp.headers.get("content-type", "")

def test_detect_route_variations():
    # Verify all detection route aliases return valid JSON with cyclones list
    for route in ["/api/v1/cyclones/detect", "/api/v1/detect", "/api/v1/cyclones/cyclone-detection"]:
        res = client.get(route)
        assert res.status_code == 200
        assert "application/json" in res.headers.get("content-type", "")
        data = res.json()
        assert "cyclones" in data
        assert isinstance(data["cyclones"], list)

def test_route_normalization_and_no_html_leak():
    # Test duplicate prefix normalization
    res_dup1 = client.get("/api/v1/api/v1/health")
    assert res_dup1.status_code == 200
    assert res_dup1.json()["status"] == "ok"

    res_dup2 = client.get("/api/api/health")
    assert res_dup2.status_code == 200
    assert res_dup2.json()["status"] == "ok"

    # Test that unknown API route returns 404 JSON, NEVER HTML index.html
    res_unknown_api = client.get("/api/v1/nonexistent-route", headers={"Accept": "application/json"})
    assert res_unknown_api.status_code == 404
    assert "text/html" not in res_unknown_api.headers.get("content-type", "")

    # Test that non-HTML request to non-existent route returns 404 JSON, not HTML
    res_unknown_data = client.get("/cyclone-unknown", headers={"Accept": "application/json"})
    assert res_unknown_data.status_code == 404
    assert "text/html" not in res_unknown_data.headers.get("content-type", "")


