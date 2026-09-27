import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { useCycloneStore } from '../../store/cycloneStore';
import { env } from '../../config/env';
import { MapControls } from './MapControls';
import { MapLegend } from './MapLegend';
import { GoogleCycloneMap } from './GoogleCycloneMap';
import { TrackPoint, InfrastructureAsset } from '../../types/cyclone';
import { Map as MapIcon, Globe, AlertTriangle, ShieldCheck } from 'lucide-react';

export const CycloneMap: React.FC = () => {
  // If Google Maps key is present, default to Google Maps; otherwise Tactical Vector Map
  const [mapEngine, setMapEngine] = useState<'google' | 'vector'>(
    env.IS_GOOGLE_MAPS_CONFIGURED ? 'google' : 'vector'
  );
  const [googleLoadError, setGoogleLoadError] = useState<string | null>(null);

  // If user switches to google map or if error occurs, handle fallback
  const handleGoogleMapError = (err: string) => {
    setGoogleLoadError(err);
    setMapEngine('vector');
  };

  // If Google Maps engine is selected and no error, render GoogleCycloneMap
  if (mapEngine === 'google' && env.IS_GOOGLE_MAPS_CONFIGURED && !googleLoadError) {
    return (
      <div className="relative w-full h-full min-h-[520px]">
        {/* Engine Switcher Ribbon */}
        <div className="absolute top-3 left-1/2 -translate-x-1/2 z-[500] flex items-center gap-2 bg-slate-900/90 backdrop-blur-md border border-cyan-500/60 text-xs px-3 py-1 rounded-full shadow-lg font-mono">
          <Globe className="w-3.5 h-3.5 text-cyan-400" />
          <span className="text-cyan-300 font-semibold">ENGINE: GOOGLE MAPS PLATFORM</span>
          <button
            onClick={() => setMapEngine('vector')}
            className="ml-2 text-[10px] text-slate-400 hover:text-white underline"
          >
            Switch to Tactical Vector Map
          </button>
        </div>
        <GoogleCycloneMap onError={handleGoogleMapError} />
      </div>
    );
  }

  // Otherwise, render Tactical Vector Map (Leaflet) with clear status notice
  return (
    <div className="relative w-full h-full min-h-[520px]">
      {/* Engine Status Banner */}
      <div className="absolute top-3 left-1/2 -translate-x-1/2 z-[500] flex flex-col items-center">
        <div className="flex items-center gap-2 bg-slate-900/95 backdrop-blur-md border border-slate-700 text-xs px-3.5 py-1 rounded-full shadow-xl font-mono text-slate-300">
          <MapIcon className="w-3.5 h-3.5 text-cyan-400" />
          <span>ENGINE: TACTICAL VECTOR MAP</span>
          {env.IS_GOOGLE_MAPS_CONFIGURED ? (
            <button
              onClick={() => {
                setGoogleLoadError(null);
                setMapEngine('google');
              }}
              className="ml-2 text-[10px] text-cyan-400 hover:text-cyan-300 font-semibold underline"
            >
              Switch to Google Maps
            </button>
          ) : (
            <span className="text-[10px] text-amber-300/90 ml-1">
              (Google Maps API key is not configured)
            </span>
          )}
        </div>
      </div>

      <TacticalVectorMap />
    </div>
  );
};

// Tactical Vector Map Implementation (Leaflet CartoDB / Esri Satellite)
const TacticalVectorMap: React.FC = () => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const layersGroupRef = useRef<L.LayerGroup | null>(null);
  const cycloneMarkerRef = useRef<L.Marker | null>(null);

  const {
    cycloneDetail,
    infrastructure,
    layers,
    currentFramePoint,
    isPlaying,
    mapViewMode,
    setSelectedAsset
  } = useCycloneStore();

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: [20.2, 87.2],
      zoom: 7,
      zoomControl: false,
      attributionControl: false
    });

    mapInstanceRef.current = map;
    layersGroupRef.current = L.layerGroup().addTo(map);

    updateBaseTile(map, mapViewMode);

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (mapInstanceRef.current) {
      updateBaseTile(mapInstanceRef.current, mapViewMode);
    }
  }, [mapViewMode]);

  const updateBaseTile = (map: L.Map, mode: string) => {
    map.eachLayer((layer) => {
      if (layer instanceof L.TileLayer) {
        map.removeLayer(layer);
      }
    });

    if (mode === 'satellite') {
      L.tileLayer(
        'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
        { maxZoom: 18 }
      ).addTo(map);
    } else {
      L.tileLayer(
        'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
        { maxZoom: 19, subdomains: 'abcd' }
      ).addTo(map);
    }
  };

  // Render Cyclone GIS Layers
  useEffect(() => {
    if (!mapInstanceRef.current || !layersGroupRef.current || !cycloneDetail) return;

    const group = layersGroupRef.current;
    group.clearLayers();

    const obsPoints = cycloneDetail.observed_track || [];
    const fcPoints = cycloneDetail.forecast_track || [];
    const landfall = cycloneDetail.landfall;
    const cone = cycloneDetail.forecast_cone;
    const zone = cycloneDetail.landfall_zone;

    // 1. FORECAST UNCERTAINTY CONE
    if (layers.forecastCone && cone && cone.geometry && cone.geometry.coordinates) {
      try {
        const coneLayer = L.geoJSON(cone.geometry as any, {
          style: {
            color: '#0ea5e9',
            weight: 2,
            dashArray: '5, 5',
            fillColor: '#38bdf8',
            fillOpacity: 0.16
          }
        });
        coneLayer.bindTooltip(
          `<div class="font-mono text-xs"><b>FORECAST UNCERTAINTY CONE</b><br/><span class="text-slate-400">Expanding track probability envelope</span></div>`,
          { sticky: true }
        );
        group.addLayer(coneLayer);
      } catch (e) {
        console.error('Error rendering uncertainty cone:', e);
      }
    }

    // 2. LANDFALL HAZARD IMPACT ZONES
    if (layers.landfallZone && zone) {
      if (zone.moderate_polygon) {
        const modLayer = L.geoJSON(zone.moderate_polygon, {
          style: { color: '#eab308', weight: 1.5, fillColor: '#eab308', fillOpacity: 0.08 }
        }).bindTooltip('<div class="font-mono text-xs text-yellow-400"><b>MODERATE IMPACT ZONE (80-150 km)</b></div>');
        group.addLayer(modLayer);
      }
      if (zone.high_polygon) {
        const highLayer = L.geoJSON(zone.high_polygon, {
          style: { color: '#f97316', weight: 2, fillColor: '#f97316', fillOpacity: 0.16 }
        }).bindTooltip('<div class="font-mono text-xs text-orange-400"><b>HIGH RISK ZONE (35-80 km)</b><br/>Gale winds & surge warning</div>');
        group.addLayer(highLayer);
      }
      if (zone.critical_polygon) {
        const critLayer = L.geoJSON(zone.critical_polygon, {
          style: { color: '#ef4444', weight: 2.5, fillColor: '#dc2626', fillOpacity: 0.28 }
        }).bindTooltip('<div class="font-mono text-xs text-red-400"><b>CRITICAL LANDFALL ZONE (0-35 km)</b><br/>Peak eyewall destructive winds & storm surge</div>');
        group.addLayer(critLayer);
      }
    }

    // 3. OBSERVED PATHWAY
    if (layers.observedPath && obsPoints.length > 0) {
      const obsLatLngs = obsPoints.map(p => [p.latitude, p.longitude] as [number, number]);
      const obsPolyline = L.polyline(obsLatLngs, {
        color: '#38bdf8',
        weight: 4,
        opacity: 0.95
      });
      group.addLayer(obsPolyline);

      obsPoints.forEach((pt, idx) => {
        const isCurrent = idx === obsPoints.length - 1;
        const circle = L.circleMarker([pt.latitude, pt.longitude], {
          radius: isCurrent ? 7 : 5,
          color: '#0284c7',
          weight: 2,
          fillColor: '#38bdf8',
          fillOpacity: 1
        });
        circle.bindPopup(`
          <div class="p-2 space-y-1 font-sans min-w-[190px]">
            <div class="flex items-center justify-between border-b border-slate-700 pb-1 text-[11px] font-mono">
              <span class="text-cyan-400 font-semibold">OBSERVED POINT</span>
              <span class="text-slate-400">${pt.timestamp}</span>
            </div>
            <div class="text-xs font-semibold text-white pt-0.5">${pt.category}</div>
            <div class="text-[11px] text-slate-300">Position: <span class="text-white font-mono">${pt.latitude}°N, ${pt.longitude}°E</span></div>
            <div class="text-[11px] text-slate-300">Wind: <span class="text-amber-400 font-mono font-bold">${pt.wind_speed} km/h</span></div>
            <div class="text-[11px] text-slate-300">Pressure: <span class="text-sky-300 font-mono font-bold">${pt.pressure} hPa</span></div>
            <div class="text-[11px] text-slate-300">Movement: <span class="text-cyan-300 font-mono">${pt.movement_direction} @ ${pt.movement_speed} km/h</span></div>
          </div>
        `);
        group.addLayer(circle);
      });
    }

    // 4. FORECAST PATHWAY
    if (layers.forecastPath && fcPoints.length > 0) {
      const lastObs = obsPoints.length > 0 ? obsPoints[obsPoints.length - 1] : null;
      const fcLatLngs = lastObs 
        ? [[lastObs.latitude, lastObs.longitude] as [number, number], ...fcPoints.map(p => [p.latitude, p.longitude] as [number, number])]
        : fcPoints.map(p => [p.latitude, p.longitude] as [number, number]);

      const fcPolyline = L.polyline(fcLatLngs, {
        color: '#f43f5e',
        weight: 3.5,
        dashArray: '8, 6',
        opacity: 0.9
      });
      group.addLayer(fcPolyline);

      fcPoints.forEach((pt) => {
        const circle = L.circleMarker([pt.latitude, pt.longitude], {
          radius: 5,
          color: '#be123c',
          weight: 2,
          fillColor: '#fb7185',
          fillOpacity: 0.95
        });
        circle.bindPopup(`
          <div class="p-2 space-y-1 font-sans min-w-[190px]">
            <div class="flex items-center justify-between border-b border-slate-700 pb-1 text-[11px] font-mono">
              <span class="text-rose-400 font-semibold">FORECAST POINT</span>
              <span class="text-slate-400">${pt.timestamp}</span>
            </div>
            <div class="text-xs font-semibold text-white pt-0.5">${pt.category}</div>
            <div class="text-[11px] text-slate-300">Position: <span class="text-white font-mono">${pt.latitude}°N, ${pt.longitude}°E</span></div>
            <div class="text-[11px] text-slate-300">Expected Wind: <span class="text-amber-400 font-mono font-bold">${pt.wind_speed} km/h</span></div>
            <div class="text-[11px] text-slate-300">Pressure: <span class="text-sky-300 font-mono font-bold">${pt.pressure} hPa</span></div>
          </div>
        `);
        group.addLayer(circle);
      });
    }

    // 5. PREDICTED LANDFALL MARKER (◆)
    if (landfall) {
      const landfallIcon = L.divIcon({
        className: 'landfall-custom-marker',
        html: `
          <div class="relative flex items-center justify-center">
            <div class="absolute -inset-2 bg-rose-500/40 rounded-full animate-ping"></div>
            <div class="w-8 h-8 rotate-45 bg-rose-600 border-2 border-white shadow-xl flex items-center justify-center text-white font-bold text-xs">
              <span class="-rotate-45">◆</span>
            </div>
            <div class="absolute -top-7 whitespace-nowrap bg-rose-950/90 border border-rose-500 text-[10px] font-mono text-rose-200 px-1.5 py-0.5 rounded shadow">
              PREDICTED LANDFALL
            </div>
          </div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 16]
      });

      const landfallMarker = L.marker([landfall.latitude, landfall.longitude], { icon: landfallIcon });
      landfallMarker.bindPopup(`
        <div class="p-2 space-y-1.5 font-sans min-w-[220px]">
          <div class="flex items-center justify-between border-b border-slate-700 pb-1">
            <span class="font-bold text-rose-400 font-mono text-xs">◆ PREDICTED LANDFALL</span>
            <span class="text-[10px] bg-red-950 border border-red-800 text-red-300 px-1 rounded font-mono">${landfall.risk_category}</span>
          </div>
          <div class="text-xs font-semibold text-slate-100">${landfall.location_name}</div>
          <div class="text-[11px] text-slate-300">District: <span class="text-white">${landfall.district}, ${landfall.state}</span></div>
          <div class="text-[11px] text-slate-300">Estimated Window: <span class="text-cyan-400 font-mono font-semibold">${landfall.estimated_time}</span></div>
          <div class="text-[11px] text-slate-300">Expected Sustained Wind: <span class="text-amber-400 font-mono font-bold">${landfall.expected_wind_speed} km/h</span></div>
          <div class="text-[11px] text-slate-300">Expected Storm Surge: <span class="text-sky-300 font-mono font-bold">${landfall.expected_storm_surge_m} meters</span></div>
          <div class="text-[10px] text-slate-400 pt-1 border-t border-slate-700 italic">${landfall.source_label}</div>
        </div>
      `);
      group.addLayer(landfallMarker);
    }

    // 6. LIFELINE INFRASTRUCTURE MARKERS
    if (layers.infrastructure && infrastructure && infrastructure.assets) {
      infrastructure.assets.forEach((asset) => {
        if (asset.type === 'hospital' && !layers.hospitals) return;
        if (asset.type === 'power' && !layers.power) return;
        if (asset.type === 'bridge' && !layers.bridges) return;
        if (asset.type === 'shelter' && !layers.shelters) return;
        if (asset.type === 'water' && !layers.water) return;

        let colorClass = 'bg-emerald-600 border-emerald-400';
        if (asset.risk_category === 'CRITICAL') colorClass = 'bg-red-600 border-red-400 shadow-[0_0_10px_rgba(220,38,38,0.7)] animate-pulse';
        else if (asset.risk_category === 'HIGH') colorClass = 'bg-orange-600 border-orange-400';
        else if (asset.risk_category === 'MODERATE') colorClass = 'bg-yellow-600 border-yellow-400';

        let initial = asset.type.substring(0, 1).toUpperCase();
        if (asset.type === 'hospital') initial = '+';
        if (asset.type === 'power') initial = '⚡';
        if (asset.type === 'bridge') initial = '☵';
        if (asset.type === 'shelter') initial = '▲';

        const assetIcon = L.divIcon({
          className: 'infra-marker',
          html: `
            <div class="w-6 h-6 rounded-full ${colorClass} border-2 text-white text-[11px] font-bold flex items-center justify-center cursor-pointer transform hover:scale-125 transition">
              ${initial}
            </div>
          `,
          iconSize: [24, 24],
          iconAnchor: [12, 12]
        });

        const marker = L.marker([asset.latitude, asset.longitude], { icon: assetIcon });
        marker.on('click', () => setSelectedAsset(asset));
        marker.bindPopup(`
          <div class="p-2 space-y-1.5 font-sans min-w-[220px]">
            <div class="flex items-center justify-between border-b border-slate-700 pb-1">
              <span class="font-bold text-slate-100 text-xs">${asset.name}</span>
              <span class="text-[10px] px-1.5 py-0.5 rounded font-mono font-bold ${
                asset.risk_category === 'CRITICAL' ? 'bg-red-950 text-red-300 border border-red-800' :
                asset.risk_category === 'HIGH' ? 'bg-orange-950 text-orange-300 border border-orange-800' :
                'bg-yellow-950 text-yellow-300 border border-yellow-800'
              }">${asset.risk_category} (${asset.risk_score})</span>
            </div>
            <div class="text-[11px] text-slate-300">Type: <span class="text-white capitalize">${asset.type}</span> | ${asset.district}</div>
            <div class="text-[11px] text-slate-300">Dist to Track: <span class="text-cyan-400 font-mono font-semibold">${asset.distance_from_track_km} km</span></div>
            <div class="text-[11px] text-slate-300">Dist to Landfall: <span class="text-rose-400 font-mono font-semibold">${asset.distance_from_landfall_km} km</span></div>
            <div class="text-[11px] text-slate-300">Wind Exposure: <span class="text-amber-400 font-mono font-bold">${asset.wind_exposure_kmh} km/h</span></div>
            <div class="text-[10px] text-slate-400 bg-slate-800/80 p-1.5 rounded border border-slate-700/80 mt-1">
              <span class="text-cyan-300 font-semibold">Priority Action:</span> ${asset.prototype_action}
            </div>
          </div>
        `);
        group.addLayer(marker);
      });
    }

  }, [cycloneDetail, infrastructure, layers]);

  // Animated Cyclone Marker
  useEffect(() => {
    if (!mapInstanceRef.current || !layersGroupRef.current) return;

    const group = layersGroupRef.current;
    const pt = currentFramePoint || (cycloneDetail?.observed_track ? cycloneDetail.observed_track[cycloneDetail.observed_track.length - 1] : null);
    if (!pt) return;

    if (cycloneMarkerRef.current) {
      group.removeLayer(cycloneMarkerRef.current);
    }

    const eyeIcon = L.divIcon({
      className: 'cyclone-eye-marker',
      html: `
        <div class="relative flex items-center justify-center">
          <div class="absolute -inset-4 bg-cyan-500/30 rounded-full radar-wave pointer-events-none"></div>
          <div class="w-10 h-10 rounded-full bg-slate-900 border-2 border-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.6)] flex items-center justify-center text-cyan-300 animate-spin-slow">
            <svg class="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 2a10 10 0 0 0-10 10c0 5.523 4.477 10 10 10s10-4.477 10-10a10 10 0 0 0-10-10z"/>
              <path d="M12 6a6 6 0 1 0 0 12 6 6 0 0 0 0-12z"/>
              <circle cx="12" cy="12" r="2" fill="currentColor"/>
            </svg>
          </div>
          <div class="absolute -bottom-6 whitespace-nowrap bg-slate-950/95 border border-cyan-500/80 text-[10px] font-mono text-cyan-200 px-2 py-0.5 rounded shadow-lg flex items-center gap-1.5">
            <span class="font-bold text-white">${pt.wind_speed} km/h</span>
            <span class="text-slate-400">|</span>
            <span class="text-cyan-400 font-semibold">${pt.movement_direction} @ ${pt.movement_speed}km/h</span>
          </div>
        </div>
      `,
      iconSize: [40, 40],
      iconAnchor: [20, 20]
    });

    const marker = L.marker([pt.latitude, pt.longitude], { icon: eyeIcon, zIndexOffset: 1000 });
    marker.addTo(group);
    cycloneMarkerRef.current = marker;

    if (isPlaying && mapInstanceRef.current) {
      mapInstanceRef.current.panTo([pt.latitude, pt.longitude], { animate: true, duration: 1.0 });
    }
  }, [currentFramePoint, isPlaying, cycloneDetail]);

  const handleZoomIn = () => mapInstanceRef.current?.zoomIn();
  const handleZoomOut = () => mapInstanceRef.current?.zoomOut();

  const handleFitCyclonePath = () => {
    if (!mapInstanceRef.current || !cycloneDetail) return;
    const all = [...cycloneDetail.observed_track, ...cycloneDetail.forecast_track];
    if (all.length > 0) {
      const bounds = L.latLngBounds(all.map(p => [p.latitude, p.longitude]));
      if (cycloneDetail.landfall) {
        bounds.extend([cycloneDetail.landfall.latitude, cycloneDetail.landfall.longitude]);
      }
      mapInstanceRef.current.fitBounds(bounds, { padding: [50, 50], animate: true });
    }
  };

  const handleLocateCyclone = () => {
    const pt = currentFramePoint || (cycloneDetail?.observed_track ? cycloneDetail.observed_track[cycloneDetail.observed_track.length - 1] : null);
    if (pt && mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([pt.latitude, pt.longitude], 8, { animate: true });
    }
  };

  const handleShowLandfall = () => {
    if (cycloneDetail?.landfall && mapInstanceRef.current) {
      mapInstanceRef.current.flyTo(
        [cycloneDetail.landfall.latitude, cycloneDetail.landfall.longitude],
        9.5,
        { animate: true }
      );
    }
  };

  return (
    <div className="relative w-full h-full min-h-[520px] rounded-lg overflow-hidden border border-command-border shadow-2xl bg-command-surface">
      <div ref={mapContainerRef} className="w-full h-full z-0" />
      <MapLegend />
      <MapControls
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onFitCyclonePath={handleFitCyclonePath}
        onLocateCyclone={handleLocateCyclone}
        onShowLandfall={handleShowLandfall}
      />
    </div>
  );
};
