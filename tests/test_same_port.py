import pytest
import urllib.request
import json
import sys

def is_live_server_running():
    try:
        req = urllib.request.Request("http://127.0.0.1:8000/api/v1/health")
        with urllib.request.urlopen(req, timeout=1.0) as resp:
            return resp.status == 200
    except Exception:
        return False

pytestmark = pytest.mark.skipif(
    not is_live_server_running(),
    reason="Live server not running at http://127.0.0.1:8000"
)

def test_same_port():
    print("=== 1. Testing Root URL (Frontend served on Port 8000) ===")
    req = urllib.request.Request("http://127.0.0.1:8000/", headers={"Accept": "text/html"})
    with urllib.request.urlopen(req) as resp:
        content = resp.read()
        print(f"HTTP {resp.status} - Content-Type: {resp.headers.get('Content-Type')}")
        assert resp.status == 200
        assert b"CYCLONESHIELD AI" in content.upper()
        print("[PASS] Frontend index.html served directly on port 8000!")

    print("\n=== 2. Testing Static Assets (/assets/...) on Port 8000 ===")
    # Extract asset link from html
    html_str = content.decode("utf-8")
    import re
    m = re.search(r'src="(/assets/[^"]+)"', html_str)
    if m:
        asset_url = f"http://127.0.0.1:8000{m.group(1)}"
        req = urllib.request.Request(asset_url)
        with urllib.request.urlopen(req) as resp:
            asset_data = resp.read()
            print(f"Asset {asset_url} -> HTTP {resp.status} (Length: {len(asset_data)})")
            assert resp.status == 200
            print("[PASS] Static bundle assets served properly on port 8000!")

    print("\n=== 3. Testing SPA Client-Side Route (/cyclones) on Port 8000 ===")
    req = urllib.request.Request("http://127.0.0.1:8000/cyclones", headers={"Accept": "text/html"})
    with urllib.request.urlopen(req) as resp:
        spa_content = resp.read()
        print(f"HTTP {resp.status} - Content-Type: {resp.headers.get('Content-Type')}")
        assert resp.status == 200
        assert b"CYCLONESHIELD AI" in spa_content.upper()
        print("[PASS] SPA client routing fallback works on port 8000!")

    print("\n=== 4. Testing API Health on Same Port 8000 ===")
    req = urllib.request.Request("http://127.0.0.1:8000/api/v1/health")
    with urllib.request.urlopen(req) as resp:
        body = json.loads(resp.read().decode("utf-8"))
        print(f"Health Response: {body}")
        assert resp.status == 200
        assert body["status"] == "ok"
        print("[PASS] API Health responds on same port 8000!")

    print("\n=== 5. Testing Active Cyclones API on Same Port 8000 ===")
    req = urllib.request.Request("http://127.0.0.1:8000/api/v1/cyclones/active")
    with urllib.request.urlopen(req) as resp:
        cyclones = json.loads(resp.read().decode("utf-8"))
        print(f"Found {len(cyclones)} active cyclone(s): {[c['name'] for c in cyclones]}")
        assert resp.status == 200
        assert len(cyclones) > 0
        cid = cyclones[0]["id"]
        print(f"[PASS] Active cyclones retrieved on same port 8000: ID={cid}")

    print("\n=== 6. Testing Full Pipeline for Active Cyclone on Port 8000 ===")
    endpoints = [
        f"/api/v1/cyclones/{cid}/track",
        f"/api/v1/cyclones/{cid}/forecast",
        f"/api/v1/cyclones/{cid}/forecast-cone",
        f"/api/v1/cyclones/{cid}/landfall",
        f"/api/v1/risk/{cid}",
        f"/api/v1/infrastructure?cyclone_id={cid}",
        f"/api/v1/population?cyclone_id={cid}",
    ]
    for ep in endpoints:
        req = urllib.request.Request(f"http://127.0.0.1:8000{ep}")
        with urllib.request.urlopen(req) as resp:
            data = json.loads(resp.read().decode("utf-8"))
            print(f"[PASS] {ep} -> HTTP {resp.status} OK (Type: {type(data).__name__})")

    print("\n=======================================================")
    print("ALL VERIFICATIONS PASSED: FRONTEND & BACKEND RUN ON SAME PORT 8000!")
    print("=======================================================")

if __name__ == "__main__":
    test_same_port()
