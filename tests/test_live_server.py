import pytest
import httpx

BASE_URL = "http://127.0.0.1:8000/api/v1"

def is_live_server_running():
    try:
        with httpx.Client(timeout=1.0) as client:
            r = client.get(f"{BASE_URL}/health")
            return r.status_code == 200
    except Exception:
        return False

pytestmark = pytest.mark.skipif(
    not is_live_server_running(),
    reason="Live server not running at http://127.0.0.1:8000"
)

def test_live_health():
    with httpx.Client(timeout=5.0) as client:
        r = client.get(f"{BASE_URL}/health")
        assert r.status_code == 200
        data = r.json()
        assert data["status"] == "ok"
        assert "CYCLONESHIELD AI" in data["service"]

def test_live_cyclones_active():
    with httpx.Client(timeout=5.0) as client:
        r = client.get(f"{BASE_URL}/cyclones/active")
        assert r.status_code == 200
        data = r.json()
        assert isinstance(data, list)
        assert len(data) >= 1
        assert data[0]["name"] == "Cyclone DANA"

def test_live_cyclone_details():
    with httpx.Client(timeout=5.0) as client:
        r = client.get(f"{BASE_URL}/cyclones/cyclone_dana")
        assert r.status_code == 200
        data = r.json()
        assert data["id"] == "cyclone_dana"
        assert "observed_track" in data
        assert "forecast_track" in data
        assert "landfall" in data

def test_live_cyclone_track():
    with httpx.Client(timeout=5.0) as client:
        r = client.get(f"{BASE_URL}/cyclones/cyclone_dana/track")
        assert r.status_code == 200
        data = r.json()
        assert "observed_track" in data

def test_live_cyclone_forecast():
    with httpx.Client(timeout=5.0) as client:
        r = client.get(f"{BASE_URL}/cyclones/cyclone_dana/forecast")
        assert r.status_code == 200
        data = r.json()
        assert "forecast_track" in data

def test_live_cyclone_cone():
    with httpx.Client(timeout=5.0) as client:
        r = client.get(f"{BASE_URL}/cyclones/cyclone_dana/forecast-cone")
        assert r.status_code == 200
        data = r.json()
        assert data["label"] == "FORECAST UNCERTAINTY"

def test_live_cyclone_landfall():
    with httpx.Client(timeout=5.0) as client:
        r = client.get(f"{BASE_URL}/cyclones/cyclone_dana/landfall")
        assert r.status_code == 200
        data = r.json()
        assert "location_name" in data

def test_live_cyclone_landfall_zone():
    with httpx.Client(timeout=5.0) as client:
        r = client.get(f"{BASE_URL}/cyclones/cyclone_dana/landfall-zone")
        assert r.status_code == 200
        data = r.json()
        assert "critical_polygon" in data

def test_live_risk():
    with httpx.Client(timeout=5.0) as client:
        r = client.get(f"{BASE_URL}/risk/cyclone_dana")
        assert r.status_code == 200
        data = r.json()
        assert data["score_label"] == "CYCLONESHIELD AI PROTOTYPE RISK SCORE"
        assert len(data["top_vulnerable_assets"]) >= 1

def test_live_infrastructure():
    with httpx.Client(timeout=5.0) as client:
        r = client.get(f"{BASE_URL}/infrastructure?cyclone_id=cyclone_dana")
        assert r.status_code == 200
        data = r.json()
        assert data["total_assets_monitored"] >= 10

def test_live_population():
    with httpx.Client(timeout=5.0) as client:
        r = client.get(f"{BASE_URL}/population?cyclone_id=cyclone_dana")
        assert r.status_code == 200
        data = r.json()
        assert data["total"] > 1000000

def test_live_ai_explain_risk():
    with httpx.Client(timeout=10.0) as client:
        r = client.post(f"{BASE_URL}/ai/explain-risk", json={"cyclone_id": "cyclone_dana"})
        assert r.status_code == 200
        data = r.json()
        assert "Risk Explanation" in data["title"]

def test_live_ai_explain_landfall():
    with httpx.Client(timeout=10.0) as client:
        r = client.post(f"{BASE_URL}/ai/explain-landfall", json={"cyclone_id": "cyclone_dana"})
        assert r.status_code == 200
        data = r.json()
        assert "Landfall Impact Analysis" in data["title"]

def test_live_ai_emergency_plan():
    with httpx.Client(timeout=10.0) as client:
        r = client.post(f"{BASE_URL}/ai/generate-emergency-plan", json={"cyclone_id": "cyclone_dana"})
        assert r.status_code == 200
        data = r.json()
        assert len(data["priorities"]) >= 1

def test_live_ai_report():
    with httpx.Client(timeout=10.0) as client:
        r = client.post(f"{BASE_URL}/ai/generate-report", json={"cyclone_id": "cyclone_dana"})
        assert r.status_code == 200
        data = r.json()
        assert "Disaster Briefing" in data["title"]
