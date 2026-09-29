#!/usr/bin/env python3
"""
CycloneShield AI - Unified Single-Port Application Runner
Serves both the FastAPI backend REST API and the built React frontend on a single port.
"""

import sys
import os
import argparse
import subprocess
from pathlib import Path

# Paths configuration
ROOT_DIR = Path(__file__).resolve().parent
BACKEND_DIR = ROOT_DIR / "backend"
FRONTEND_DIR = ROOT_DIR / "frontend"
FRONTEND_DIST = FRONTEND_DIR / "dist"

# Ensure Python path includes backend and root
for path in (str(ROOT_DIR), str(BACKEND_DIR)):
    if path not in sys.path:
        sys.path.insert(0, path)

def ensure_frontend_build():
    """Verify frontend build exists, or run build if missing."""
    index_html = FRONTEND_DIST / "index.html"
    if not index_html.exists():
        print("=" * 60)
        print("[CycloneShield] Frontend build (frontend/dist) not found.")
        print("[CycloneShield] Running 'npm run build' in frontend/ ...")
        print("=" * 60)
        try:
            subprocess.run(["npm", "run", "build"], cwd=str(FRONTEND_DIR), check=True)
            print("[CycloneShield] Frontend build succeeded.")
        except Exception as e:
            print(f"[CycloneShield] Warning: Frontend build failed ({e}).")
            print("[CycloneShield] The backend API will still run, but UI will show build instructions.")

def main():
    parser = argparse.ArgumentParser(description="CycloneShield AI Unified Server")
    parser.add_argument("--host", default=os.getenv("HOST", "0.0.0.0"), help="Host IP to bind (default: 0.0.0.0)")
    parser.add_argument("--port", type=int, default=int(os.getenv("PORT", "8000")), help="Port to bind (default: 8000)")
    parser.add_argument("--reload", action="store_true", help="Enable auto-reload for development")
    parser.add_argument("--build", action="store_true", help="Force rebuild frontend before starting")

    args = parser.parse_args()

    if args.build or not (FRONTEND_DIST / "index.html").exists():
        ensure_frontend_build()

    display_host = "localhost" if args.host in ("0.0.0.0", "127.0.0.1") else args.host

    print("=" * 65)
    print(" 🌀 CycloneShield AI - Unified Single-Port Server")
    print("=" * 65)
    print(f" • Web UI Application:   http://{display_host}:{args.port}/")
    print(f" • Health Check:         http://{display_host}:{args.port}/api/health")
    print(f" • Cyclone Detection:    http://{display_host}:{args.port}/api/cyclones/detect")
    print(f" • Interactive API Docs: http://{display_host}:{args.port}/api/docs")
    print("=" * 65)
    print(" Single-port unified architecture active (No separate dev server needed).")
    print("=" * 65 + "\n")

    import uvicorn
    # Use app module path
    uvicorn.run("backend.app.main:app", host=args.host, port=args.port, reload=args.reload)

if __name__ == "__main__":
    main()
