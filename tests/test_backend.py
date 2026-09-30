import pytest
from fastapi.testclient import TestClient
import sys
import os

# Add backend to sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "backend")))

from app.main import app

client = TestClient(app)

def test_health_endpoint():
    response = client.get("/api/v1/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"
    assert "CYCLONESHIELD AI" in data["service"]
    assert "services" in data
    assert data["services"]["database"] == "connected"
    assert data["services"]["cyclone_data"] == "available"
    assert "gemini" in data["services"]
    assert "google_maps" in data["services"]
    # Ensure no secret leakage
    content_str = str(data).lower()
    assert "key=" not in content_str
    assert "password" not in content_str
    assert "credentials" not in content_str

def test_cyclone_detection():
    response = client.get("/api/v1/cyclones/detect")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "CYCLONE DETECTED"
    assert data["cyclones_count"] >= 1
    assert any(c["name"] == "Cyclone DANA" for c in data["cyclones"])

def test_active_cyclone_api():
    response = client.get("/api/v1/cyclones/active")
    assert response.status_code == 200
    cyclones = response.json()
    assert len(cyclones) >= 1
    c = cyclones[0]
    assert "current_latitude" in c
    assert "wind_speed" in c
    assert "category" in c

def test_cyclone_by_id():
    response = client.get("/api/v1/cyclones/cyclone_dana")
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == "Cyclone DANA"
    assert len(data["observed_track"]) >= 2
    assert len(data["forecast_track"]) >= 2

def test_invalid_cyclone_id():
    response = client.get("/api/v1/cyclones/invalid_cyclone_9999")
    assert response.status_code == 404

def test_track_api():
    response = client.get("/api/v1/cyclones/cyclone_dana/track")
    assert response.status_code == 200
    data = response.json()
    assert "observed_track" in data
    assert "animation_frames" in data
    assert len(data["animation_frames"]) >= 5

def test_forecast_api():
    response = client.get("/api/v1/cyclones/cyclone_dana/forecast")
    assert response.status_code == 200
    data = response.json()
    assert len(data["forecast_track"]) >= 2

def test_forecast_cone_generation():
    response = client.get("/api/v1/cyclones/cyclone_dana/forecast-cone")
    assert response.status_code == 200
    data = response.json()
    assert data["label"] == "FORECAST UNCERTAINTY"
    assert data["geometry"]["type"] in ["Polygon", "MultiPolygon"]

def test_landfall_calculation():
    response = client.get("/api/v1/cyclones/cyclone_dana/landfall")
    assert response.status_code == 200
    data = response.json()
    assert "location_name" in data
    assert "expected_wind_speed" in data
    assert data["expected_wind_speed"] >= 100
    assert "source_label" in data

def test_landfall_zone():
    response = client.get("/api/v1/cyclones/cyclone_dana/landfall-zone")
    assert response.status_code == 200
    data = response.json()
    assert "critical_polygon" in data
    assert "high_polygon" in data

def test_risk_calculation():
    response = client.get("/api/v1/risk/cyclone_dana")
    assert response.status_code == 200
    data = response.json()
    assert "overall_cyclone_risk_score" in data
    assert data["score_label"] == "CYCLONESHIELD AI PROTOTYPE RISK SCORE"
    assert len(data["top_vulnerable_assets"]) >= 1

def test_infrastructure_analysis():
    response = client.get("/api/v1/infrastructure?cyclone_id=cyclone_dana")
    assert response.status_code == 200
    data = response.json()
    assert data["total_assets_monitored"] >= 10
    assert data["critical_assets"] >= 1
    assert "hospital" in data["by_type"]

def test_population_exposure():
    response = client.get("/api/v1/population?cyclone_id=cyclone_dana")
    assert response.status_code == 200
    data = response.json()
    assert data["total"] > 1000000
    assert data["critical"] > 100000
    assert len(data["districts"]) >= 3

def test_map_geojson_layers():
    track_resp = client.get("/api/v1/map/cyclone-track?cyclone_id=cyclone_dana")
    assert track_resp.status_code == 200
    assert track_resp.json()["type"] == "FeatureCollection"
    
    infra_resp = client.get("/api/v1/map/infrastructure?cyclone_id=cyclone_dana")
    assert infra_resp.status_code == 200
    assert infra_resp.json()["type"] == "FeatureCollection"

def test_ai_fallback_and_emergency_priorities():
    # Test risk explanation fallback
    risk_exp = client.post("/api/v1/ai/explain-risk", json={"cyclone_id": "cyclone_dana", "asset_id": "hosp_1"})
    assert risk_exp.status_code == 200
    rdata = risk_exp.json()
    assert "Risk Explanation" in rdata["title"]
    assert len(rdata["key_findings"]) >= 1

    # Test emergency priority plan
    plan_resp = client.post("/api/v1/ai/generate-emergency-plan", json={"cyclone_id": "cyclone_dana"})
    assert plan_resp.status_code == 200
    pdata = plan_resp.json()
    assert len(pdata["priorities"]) >= 5
    assert pdata["priorities"][0]["rank"] == 1

    # Test Sentinel-1 SAR & Gemini reconnaissance endpoint
    sar_resp = client.post(
        "/api/v1/ai/analyze-satellite",
        json={
            "cyclone_id": "cyclone_dana",
            "cyclone_name": "Cyclone DANA",
            "latitude": 20.85,
            "longitude": 86.90,
            "wind_speed": 120.0,
            "pressure": 976.0,
            "landfall_location": "Bhitarkanika & Dhamra, Odisha",
            "satellite_source": "Sentinel-1A C-Band SAR",
            "analysis_type": "SAR_RECONNAISSANCE",
        },
    )
    assert sar_resp.status_code == 200
    sdata = sar_resp.json()
    assert sdata["cyclone_id"] == "cyclone_dana"
    assert "sar_data" in sdata and sdata["sar_data"] is not None
    assert sdata["sar_data"]["flood_inundation_sqkm"] > 0
    assert len(sdata["sar_data"]["submerged_infrastructure"]) >= 1
    assert len(sdata["sar_data"]["road_bridge_impact"]) >= 1
    assert len(sdata["sar_data"]["detected_changes"]) >= 1
    assert len(sdata["sar_data"]["recommended_investigation_areas"]) >= 1

    # Test validation error for empty cyclone_id
    bad_sar = client.post("/api/v1/ai/analyze-satellite", json={"cyclone_id": "   "})
    assert bad_sar.status_code == 400

