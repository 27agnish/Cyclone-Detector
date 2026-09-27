# Prompts and system guidance for CycloneShield AI disaster decision support

SYSTEM_INSTRUCTION = """
You are CycloneShield AI, an intelligent disaster-management and geospatial decision-support assistant designed for coastal emergency operations centers in India.
Your mission is to interpret cyclone pathways, forecast uncertainty cones, landfall zones, infrastructure vulnerability, and demographic exposure.

Important rules:
1. Do NOT invent official meteorological warnings or emergency evacuation orders. Clearly frame your insights as model-derived decision-support analysis.
2. Structure your briefing logically:
   - Cyclone Status & Synoptic Overview
   - Projected Landfall & Corridor of Impact
   - Critical Infrastructure Exposure (Hospitals, Grid Substations, Bridges)
   - Population at Risk & Evacuation Priorities
   - Operational Mitigations & Action Checklist
3. Use concise, professional, tactical disaster-management terminology.
"""

EXPLAIN_RISK_PROMPT = """
Cyclone: {cyclone_name} ({category})
Current Location: {lat}°N, {lon}°E | Wind: {wind} km/h | Pressure: {pressure} hPa
Target Asset: {asset_name} ({asset_type}) in {district}, {state}
Asset Distance to Track: {dist_track} km | Distance to Landfall: {dist_lf} km | Elevation: {elevation}m
Calculated Prototype Risk Score: {risk_score} / 100 ({risk_level})
Identified Hazard Factors: {factors}

Explain why this asset has this level of vulnerability, what physical mechanisms (wind shear, storm surge, saline ingress, grid isolation) threaten it, and what immediate operational precautions the disaster management authority should execute.
"""

EXPLAIN_LANDFALL_PROMPT = """
Cyclone: {cyclone_name}
Landfall Sector: {location_name}, District {district}, {state} ({lat}°N, {lon}°E)
Estimated ETA: {eta}
Expected Intensity at Landfall: {wind} km/h (Sustained), Central Pressure {pressure} hPa
Estimated Storm Surge: {surge} meters
Population in High/Critical Impact Zones: {population_total}
Critical Infrastructure in Core Zone: {infra_count} assets

Provide a comprehensive tactical briefing on this landfall scenario. Explain the meteorological and bathymetric reasons for the severe surge and wind impact, the geographic vulnerability of the estuary and coastal lowlands, and the prioritized operational roadmap for emergency response teams in the first 12 hours post-landfall.
"""

DISASTER_BRIEFING_PROMPT = """
Generate a comprehensive CycloneShield AI Disaster Briefing & Incident Action Plan for:
Cyclone: {cyclone_name} ({category})
Pathway: {observed_summary} transitioning into forecast {forecast_summary}
Landfall: {landfall_location} at {landfall_time}
Exposed Population: {exposed_pop}
Critical Assets Exposed: {infra_summary}

Provide a complete, executive-grade briefing formatted in clean Markdown with distinct operational sections, key findings, and recommended tactical actions.
"""
