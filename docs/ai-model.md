# CycloneShield AI - ML Risk Engine & AI Decision Support

## 1. Machine Learning Hazard Ensemble

The risk engine computes the **CYCLONESHIELD AI PROTOTYPE RISK SCORE** (0 to 100), mapped into four tactical tiers:
- **0 - 25**: LOW
- **26 - 50**: MODERATE
- **51 - 75**: HIGH
- **76 - 100**: CRITICAL

### Feature Vectors
1. `wind_speed`: Local sustained surface wind calculated via parametric vortex decay.
2. `pressure`: Central atmospheric pressure deficit.
3. `distance_to_track_km`: Great-circle distance to nearest track point.
4. `distance_to_landfall_km`: Distance to projected eyewall landfall point.
5. `elevation_m`: Ground elevation above mean sea level.
6. `asset_criticality`: Operational priority factor (Hospital = 1.0, Power = 0.95, Water = 0.90, Bridge = 0.85).
7. `rainfall_mm`: Modeled 24h precipitation accumulation.

### Parametric Vortex Formulation
We employ a modified Rankine / Holland vortex radial profile:
$$V(r) = V_{\max} \cdot \left(\frac{R_{\max}}{r}\right)^{0.55} \quad \text{for } r > R_{\max}$$
Inside the eyewall core ($r \le R_{\max}$), sustained winds maintain 88% to 100% of maximum intensity, capturing peak destructive cyclonic force.

---

## 2. Gemini / Vertex AI Integration

Natural language explanations are powered by **Google Gemini** (`gemini-2.5-flash`). 
- **Prompt Engineering**: System instructions enforce factual disaster response discipline, strictly forbidding the invention of official meteorology warnings.
- **Resilient Fallback**: If `GEMINI_API_KEY` is not configured or network connectivity drops, the system seamlessly activates a deterministic expert rule engine, ensuring 100% uptime for critical operational dashboards.
