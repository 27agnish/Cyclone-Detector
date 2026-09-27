# CycloneShield AI - Complete API Reference

Base URL: `http://localhost:8000/api/v1`

## Health & System
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/health` | Service health status, version, and active mode (DEMO/LIVE) |

## Cyclones & Pathway
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/cyclones` | List all tracked and registered cyclones |
| `GET` | `/cyclones/active` | Return currently active storms |
| `GET` | `/cyclones/detect` | Proactively scan data sources for cyclonic disturbances |
| `POST` | `/cyclones/refresh` | Force cache refresh across all providers |
| `GET` | `/cyclones/{id}` | Detailed cyclone record with track arrays, cone, and landfall |
| `GET` | `/cyclones/{id}/track` | Observed pathway points and chronological animation frames |
| `GET` | `/cyclones/{id}/forecast` | Projected future pathway points |
| `GET` | `/cyclones/{id}/forecast-cone` | GeoJSON Polygon of expanding forecast uncertainty |
| `GET` | `/cyclones/{id}/landfall` | Predicted landfall location, timing, wind, and storm surge |
| `GET` | `/cyclones/{id}/landfall-zone` | Critical, High, and Moderate impact zone polygons |
| `GET` | `/cyclones/{id}/impact` | Aggregated dossier (track + landfall + infrastructure + population) |

## Risk Engine
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/risk/{cyclone_id}` | CYCLONESHIELD AI PROTOTYPE RISK SCORE (0-100) and top vulnerable assets |
| `GET` | `/risk/landfall/{cyclone_id}` | Landfall sector risk metrics, storm surge, and saline ingress alerts |

## Infrastructure & Population
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/infrastructure` | Monitored lifeline assets with evaluated vulnerability |
| `GET` | `/infrastructure/{id}` | Detailed risk dossier for individual asset |
| `GET` | `/population` | Demographic exposure breakdown across hazard tiers and districts |

## GIS & Map Layers (GeoJSON RFC 7946)
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/map/cyclone-track` | FeatureCollection of observed line, forecast line, cone, and point nodes |
| `GET` | `/map/risk-zones` | FeatureCollection of multi-tier landfall impact zone polygons |
| `GET` | `/map/infrastructure` | FeatureCollection of evaluated infrastructure points |

## AI Decision Support & Reporting (Gemini / Vertex AI)
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/ai/explain-risk` | AI natural language explanation of asset physical vulnerability |
| `POST` | `/ai/explain-landfall` | AI strategic briefing on projected landfall sector |
| `POST` | `/ai/analyze-satellite` | Multimodal interpretation of Sentinel-1 SAR radar imagery |
| `POST` | `/ai/generate-emergency-plan`| Ranked emergency priority action checklist (01 Hospital, 02 Bridge, etc.) |
| `POST` | `/ai/generate-report` | Complete AI Disaster Briefing & Incident Action Plan |
