# CYCLONESHIELD AI 🌀🛡️
### *From Cyclone Track to Infrastructure Action*

> **"Detect the cyclone. Understand its pathway. Predict the impact. Prioritize what is at risk."**

---

## 🌪️ Executive Summary

**CycloneShield AI** is an intelligent disaster-management and geospatial decision-support command dashboard. Rather than acting as a simple storm tracking viewer, CycloneShield AI transforms real-time cyclone trajectories, forecast uncertainty envelopes, and numerical landfall models into actionable infrastructure triage, demographic risk calculations, and automated AI Incident Action Plans.

### The Central Visual Story
```
AUTOMATICALLY DETECT CYCLONE
        ↓
WHERE HAS IT BEEN? (Observed Solid Pathway)
        ↓
WHERE IS IT NOW? (Animated Pulsing Eye Marker)
        ↓
WHERE IS IT GOING? (Dashed Forecast Pathway)
        ↓
WHAT IS THE FORECAST UNCERTAINTY? (Expanding Forecast Cone)
        ↓
WHERE COULD IT MAKE LANDFALL? (◆ Predicted Landfall Center & ETA)
        ↓
WHAT AREA COULD BE AFFECTED? (Critical 0-35km, High 35-80km, Moderate 80-150km Zones)
        ↓
WHAT INFRASTRUCTURE IS AT RISK? (Hospitals, Power Grids, Bridges, Shelters, Water)
        ↓
HOW MANY PEOPLE ARE EXPOSED? (District-Level Population Aggregation)
        ↓
WHAT SHOULD EMERGENCY TEAMS ANALYZE FIRST? (AI Emergency Priority Action Engine)
```

---

## ⚡ 2–3 Minute Judge Demonstration Flow

Follow these exact steps during evaluation to showcase the complete end-to-end intelligence story:

1. **Step 1: Open Application**
   - The system automatically executes `CycloneDetectionService`, scans live feeds, detects active cyclonic disturbances in the North Indian Ocean basin, and displays `CYCLONE DETECTED`.
2. **Step 2: Inspect Complete Cyclone Pathway**
   - In approximately 5 seconds, understand the entire storm:
     - **Observed Pathway**: Solid cyan line tracing historical trajectory from East-Central Bay of Bengal.
     - **Current Position**: Pulsing animated cyclone eye marker with live wind and pressure badge.
     - **Forecast Pathway**: Dashed rose line projecting future movement.
     - **Forecast Uncertainty Cone**: Expanding polygon representing empirical error bounds.
3. **Step 3: Play Track Animation**
   - Press **PLAY TRACK** on the bottom timeline.
   - Watch the animated cyclone marker advance along its trajectory, with telemetry, wind speed, pressure, and category updating dynamically at each step.
4. **Step 4: Inspect Track Nodes**
   - Click any point along the observed or forecast track to inspect exact timestamp, wind speed, central pressure, and movement speed.
5. **Step 5: Zoom to Predicted Landfall**
   - Click **SHOW LANDFALL** or the **◆ PREDICTED LANDFALL** diamond marker.
   - Review predicted landfall sector (*Dhamra Port / Bhitarkanika*), ETA, expected wind (120 km/h sustained), and expected storm surge (2.6 meters).
6. **Step 6: Inspect Multi-Tier Hazard Zones**
   - Observe concentric landfall zones: **Critical Zone (0-35 km)**, **High Risk Zone (35-80 km)**, and **Moderate Swath (80-150 km)**.
7. **Step 7: Audit Lifeline Infrastructure**
   - Toggle infrastructure icons on the map or open the **Infrastructure** tab.
   - Click on **Dhamra 132/33kV Grid Substation** or **Bhadrak DHH** to inspect its multi-factor risk score, ground elevation, and actionable prototype mitigation directive.
8. **Step 8: Review Population Demographics**
   - Open **Population Exposure** to view demographic exposure aggregated across 4 coastal districts (*Bhadrak, Kendrapara, Balasore, Jagatsinghpur*).
9. **Step 9: Trigger AI Impact Analysis**
   - Click **AI IMPACT ANALYSIS** on the top command bar.
   - Experience Google Gemini / Vertex AI synthesizing an executive-grade tactical landfall briefing.
10. **Step 10: Generate Emergency Priority Checklist**
    - Click **EMERGENCY PRIORITIES** to view algorithmically ranked field directives (01 Hospital, 02 Bridge, 03 Coastal Population Evacuation, 04 Power Substation).
11. **Step 11: Review Sentinel-1 SAR Radar Flood Mapping**
    - Navigate to **Satellite & SAR** to view cloud-penetrating radar inundation masks and detected coastal embankment breaches.
12. **Step 12: Generate Disaster Briefing & Incident Action Plan**
    - Navigate to **Briefing Reports** to produce a printable AI Incident Action Plan ready for emergency operations commanders.

---

## 🏛️ System Architecture

```
DATA SOURCES (IMD / RSMC / NOAA IBTrACS / Copernicus SAR)
    ↓
AUTOMATIC CYCLONE DETECTION (BaseProvider / OfficialProvider / IBTrACSProvider / DemoProvider)
    ↓
CYCLONE DATA NORMALIZATION (Pydantic RFC 7946 Standardizer)
    ↓
GIS SPATIAL ENGINE (Shapely / Geodesic / Buffers / Landfall Intersections)
    ↓
PARAMETRIC HAZARD PROFILES (Holland Vortex / Storm Surge / Swath)
    ↓
RISK & VULNERABILITY ENGINE (Deterministic Multi-Criteria + Gradient Boosting ML)
    ↓
EMERGENCY PRIORITY ENGINE (Lead-Time Triage & Action Checklist)
    ↓
AI REASONING (Google Gemini / Vertex AI with Offline Resilient Fallback)
    ↓
COMMAND CENTER UI (React + TypeScript + Vite + Tailwind CSS + Leaflet/Google Maps)
```

---

## 🛠️ Tech Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 18, TypeScript, Vite, Tailwind CSS, Leaflet / Google Maps JS API, Turf.js, Recharts, Zustand, Axios, Lucide Icons |
| **Backend** | Python 3.11, FastAPI, Pydantic v2, Uvicorn, SQLAlchemy, Shapely, NumPy, Pandas, Scikit-learn, HTTPX |
| **AI / ML** | Google Gemini (`gemini-2.5-flash`), Vertex AI pipeline, Gradient Boosting Hazard Regressor |
| **Cloud** | Google Cloud Run, Vertex AI, Earth Engine, Cloud Storage, Secret Manager, Docker |

---
## 🔑 API KEY SETUP & SECURITY GUIDE

Follow this guide to securely configure external services for Google Maps Platform, Google Gemini, Vertex AI, and Earth Engine.

### 1. Google Cloud Project Setup
1. Create or select a Google Cloud Project in the [Google Cloud Console](https://console.cloud.google.com/).
2. Enable billing on your Google Cloud Project.

### 2. Google Maps Platform Setup (Frontend)
1. In Google Cloud Console, navigate to **APIs & Services > Library** and enable:
   - **Maps JavaScript API**
2. Navigate to **APIs & Services > Credentials** and click **Create Credentials > API Key**.
3. **Restrict your API key** for security:
   - **Set Application Restrictions**: Choose **HTTP referrers (web sites)**.
   - Add your local and production domains:
     - `http://localhost:5173/*`
     - `http://127.0.0.1:5173/*`
     - `https://your-production-domain.run.app/*`
   - **Set API Restrictions**: Select **Restrict key** and choose only **Maps JavaScript API**.
4. Save the key in your local frontend configuration:
   - Open or create `frontend/.env.local`:
     ```bash
     VITE_GOOGLE_MAPS_API_KEY=YOUR_RESTRICTED_GOOGLE_MAPS_API_KEY
     VITE_API_BASE_URL=http://localhost:8000
     ```
   *(If omitted, CycloneShield AI automatically runs with high-performance Tactical Vector Maps without crashing).*

### 3. Google Gemini / Vertex AI Setup (Server-Side Backend)
> **CRITICAL SECURITY RULE**: The frontend *never* contains Gemini keys, service-account private keys, or cloud credentials. All AI calls run server-side through FastAPI.

Option A: **Direct Gemini API Key**:
1. Obtain an API key from [Google AI Studio](https://aistudio.google.com/).
2. In `backend/.env`, configure:
   ```bash
   GEMINI_API_KEY=YOUR_GEMINI_API_KEY
   GEMINI_MODEL=gemini-2.5-flash
   ```

Option B: **Google Cloud Vertex AI & Service Account (Enterprise/Production)**:
1. Enable **Vertex AI API** in Google Cloud Console.
2. Create a Service Account with role `Vertex AI User`.
3. Download the JSON credentials file and place it in a local directory (e.g. `credentials/service-account.json`).
4. In `backend/.env`, configure:
   ```bash
   GOOGLE_CLOUD_PROJECT=your-google-cloud-project-id
   GOOGLE_CLOUD_LOCATION=asia-south1
   GEMINI_MODEL=gemini-2.5-flash
   GOOGLE_APPLICATION_CREDENTIALS=credentials/service-account.json
   ```

### 4. Secret Protection & Git Hygiene
- The repository `.gitignore` automatically prevents accidental commits of `.env`, `.env.local`, `credentials/`, `secrets/`, and `service-account*.json`.
- Always verify `.env.example` contains placeholders only.
- In production, inject secrets via **Google Secret Manager** and Cloud Run environment variables.

### 5. Verification
- Open the dashboard at `http://localhost:5173`.
- Click the **API STATUS** button on the top right command bar to verify the connectivity state of Google Maps, Gemini / Vertex AI, Database, and Earth Engine.

---

### 1. Prerequisites
- Python 3.11+
- Node.js v18+ (tested on Node v24)

### 2. Backend Setup
```bash
# From project root
python -m venv .venv
# On Windows:
.venv\Scripts\activate

# Install dependencies
pip install fastapi "uvicorn[standard]" pydantic pydantic-settings sqlalchemy shapely numpy pandas scikit-learn httpx pytest python-multipart

# Run automated test suite
pytest tests/test_backend.py -v

# Start FastAPI backend
python -m uvicorn app.main:app --app-dir backend --host 127.0.0.1 --port 8000 --reload
```
Backend API will be live at `http://127.0.0.1:8000/api/v1/health` and Swagger docs at `http://127.0.0.1:8000/docs`.

### 3. Frontend Setup
```bash
# In a separate terminal
cd frontend
npm install
npm run dev
```
Open `http://localhost:5173` in your browser.

---

## 📋 Comprehensive Quality & Compliance Checklist

- [x] **Automatic Cyclone Detection**: Multi-provider chain with RSMC/IBTrACS and Demo scenarios.
- [x] **Active Cyclone API**: Full CRUD and detection endpoints implemented.
- [x] **Complete Pathway**: Solid cyan line for observed, dashed rose line for forecast.
- [x] **Direction Indicators**: Movement bearing, speed, and heading telemetry.
- [x] **Forecast Uncertainty Cone**: GeoJSON expanding Minkowski polygon.
- [x] **Interactive Animation**: Timeline scrubber with Play, Pause, Reset, and Jump to Landfall.
- [x] **Predicted Landfall**: `◆ PREDICTED LANDFALL` diamond marker with ETA, wind, and surge.
- [x] **Multi-Tier Impact Zones**: Critical (0-35km), High Risk (35-80km), Moderate (80-150km).
- [x] **Infrastructure Vulnerability**: Hospitals, Power Grids, Bridges, Roads, Shelters, Water.
- [x] **Population Exposure**: Demographic modeling across districts with chart breakdowns.
- [x] **Risk Engine**: Deterministic multi-criteria hazard index + Gradient Boosting ML.
- [x] **Google Gemini AI**: Natural language risk explanations and Incident Action Plans.
- [x] **AI Offline Fallback**: 100% resilient expert deterministic fallback when keys are absent.
- [x] **Emergency Priority Engine**: Ranked operational triage checklist (01 Hospital, 02 Bridge, etc.).
- [x] **Satellite Architecture**: Sentinel-1 SAR radar cloud-penetrating flood detection.
- [x] **Demo Mode Transparency**: Clear labels for OBSERVED, FORECAST, MODEL-DERIVED, and DEMO.
- [x] **India-Wide Scalability**: Geographically reusable across Odisha, West Bengal, Andhra Pradesh, Gujarat, etc.
- [x] **Test Suite**: 15 automated pytest tests passing with 100% success rate.
- [x] **Production Ready**: Containerized with Google Cloud Run Dockerfiles and Vertex AI specs.

---

## ⚖️ Operational Disclaimer
CycloneShield AI is a prototype decision-support research platform for emergency operations centers. All predictions, risk indices, and AI briefs are model-derived estimates. Emergency responders and citizens must consult official bulletins from the **India Meteorological Department (IMD)** and **NDMA**.
