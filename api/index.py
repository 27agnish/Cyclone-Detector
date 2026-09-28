import sys
import os
from pathlib import Path

# Add all candidate paths to sys.path for Vercel Serverless environment
api_dir = Path(__file__).resolve().parent
root_dir = api_dir.parent

candidate_paths = [
    str(root_dir / "backend"),
    str(api_dir / "backend"),
    str(root_dir),
    str(api_dir),
    os.getcwd(),
    os.path.join(os.getcwd(), "backend"),
]

for p in candidate_paths:
    if os.path.exists(p) and p not in sys.path:
        sys.path.insert(0, p)

from app.main import app
