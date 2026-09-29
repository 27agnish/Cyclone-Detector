import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { useCycloneStore } from '../../store/cycloneStore';
import { MapControls } from './MapControls';
import { MapLegend } from './MapLegend';
import { Map as MapIcon } from 'lucide-react';

// Free OSM-derived Carto Dark Matter & Esri World Imagery MapLibre style specification
const TACTICAL_MAP_STYLE: any = {
  version: 8,
  sources: {
    'carto-dark': {
      type: 'raster',
      tiles: [
        'https://a.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}@2x.png',
        'https://b.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}@2x.png',
        'https://c.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}@2x.png',
        'https://d.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}@2x.png'
      ],
      tileSize: 256,
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
    },
    'esri-satellite': {
      type: 'raster',
      tiles: [
        'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
      ],
      tileSize: 256,
      attribution: '&copy; Esri, Maxar, Earthstar Geographics'
    }
  },
  layers: [
    {
      id: 'carto-dark-layer',
      type: 'raster',
      source: 'carto-dark',
      minzoom: 0,
      maxzoom: 20
    },
    {
      id: 'esri-satellite-layer',
      type: 'raster',
      source: 'esri-satellite',
      minzoom: 0,
      maxzoom: 19,
      layout: {
        visibility: 'none'
      }
    }
  ]
};

const EMPTY_GEOJSON: any = {
  type: 'FeatureCollection',
  features: []
};

export const CycloneMap: React.FC = () => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<maplibregl.Map | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);

  // Markers references
  const markersRef = useRef<maplibregl.Marker[]>([]);
  const cycloneEyeMarkerRef = useRef<maplibregl.Marker | null>(null);
  const hoverPopupRef = useRef<maplibregl.Popup | null>(null);

  const {
    cycloneDetail,
    infrastructure,
    layers,
    currentFramePoint,
    isPlaying,
    mapViewMode,
    setSelectedAsset
  } = useCycloneStore();

  // 1. Initialize MapLibre GL Map
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    const map = new maplibregl.Map({
      container: mapContainerRef.current,
      style: TACTICAL_MAP_STYLE,
      center: [87.2, 20.2], // [lng, lat] (Bay of Bengal / Odisha coast)
      zoom: 6.5,
      minZoom: 3,
      maxZoom: 18,
      attributionControl: false
    });

    // Add navigation controls (scale)
    map.addControl(new maplibregl.ScaleControl({ unit: 'metric' }), 'bottom-left');

    const hoverPopup = new maplibregl.Popup({
      closeButton: false,
      closeOnClick: false,
      maxWidth: '280px',
      offset: 12
    });
    hoverPopupRef.current = hoverPopup;

    map.on('load', () => {
      // Setup GeoJSON Sources
      map.addSource('forecast-cone-source', { type: 'geojson', data: EMPTY_GEOJSON });
      map.addSource('moderate-zone-source', { type: 'geojson', data: EMPTY_GEOJSON });
      map.addSource('high-zone-source', { type: 'geojson', data: EMPTY_GEOJSON });
      map.addSource('critical-zone-source', { type: 'geojson', data: EMPTY_GEOJSON });
      map.addSource('observed-track-source', { type: 'geojson', data: EMPTY_GEOJSON });
      map.addSource('forecast-track-source', { type: 'geojson', data: EMPTY_GEOJSON });

      // 1. Forecast Uncertainty Cone Layers
      map.addLayer({
        id: 'forecast-cone-fill',
        type: 'fill',
        source: 'forecast-cone-source',
        paint: {
          'fill-color': '#38bdf8',
          'fill-opacity': 0.16
        }
      });
      map.addLayer({
        id: 'forecast-cone-line',
        type: 'line',
        source: 'forecast-cone-source',
        paint: {
          'line-color': '#0ea5e9',
          'line-width': 2,
          'line-dasharray': [3, 2]
        }
      });

      // 2. Landfall Impact Hazard Zones
      // Moderate Zone (Yellow)
      map.addLayer({
        id: 'moderate-zone-fill',
        type: 'fill',
        source: 'moderate-zone-source',
        paint: {
          'fill-color': '#eab308',
          'fill-opacity': 0.08
        }
      });
      map.addLayer({
        id: 'moderate-zone-line',
        type: 'line',
        source: 'moderate-zone-source',
        paint: {
          'line-color': '#eab308',
          'line-width': 1.5
        }
      });

      // High Risk Zone (Orange)
      map.addLayer({
        id: 'high-zone-fill',
        type: 'fill',
        source: 'high-zone-source',
        paint: {
          'fill-color': '#f97316',
          'fill-opacity': 0.16
        }
      });
      map.addLayer({
        id: 'high-zone-line',
        type: 'line',
        source: 'high-zone-source',
        paint: {
          'line-color': '#f97316',
          'line-width': 2
        }
      });

      // Critical Landfall Zone (Red)
      map.addLayer({
        id: 'critical-zone-fill',
        type: 'fill',
        source: 'critical-zone-source',
        paint: {
          'fill-color': '#dc2626',
          'fill-opacity': 0.28
        }
      });
      map.addLayer({
        id: 'critical-zone-line',
        type: 'line',
        source: 'critical-zone-source',
        paint: {
          'line-color': '#ef4444',
          'line-width': 2.5
        }
      });

      // 3. Observed Pathway Line (Cyan solid)
      map.addLayer({
        id: 'observed-track-line',
        type: 'line',
        source: 'observed-track-source',
        paint: {
          'line-color': '#38bdf8',
          'line-width': 4,
          'line-opacity': 0.95
        }
      });

      // 4. Forecast Pathway Line (Rose dashed)
      map.addLayer({
        id: 'forecast-track-line',
        type: 'line',
        source: 'forecast-track-source',
        paint: {
          'line-color': '#f43f5e',
          'line-width': 3.5,
          'line-dasharray': [3, 2],
          'line-opacity': 0.9
        }
      });

      // Setup Hover Tooltips for Zones & Cone
      const setupHover = (layerId: string, html: string) => {
        map.on('mouseenter', layerId, (e: any) => {
          map.getCanvas().style.cursor = 'pointer';
          if (e.lngLat) {
            hoverPopup.setLngLat(e.lngLat).setHTML(html).addTo(map);
          }
        });
        map.on('mouseleave', layerId, () => {
          map.getCanvas().style.cursor = '';
          hoverPopup.remove();
        });
      };

      setupHover(
        'forecast-cone-fill',
        '<div class="p-2 font-mono text-xs"><b class="text-cyan-400">FORECAST UNCERTAINTY CONE</b><br/><span class="text-slate-300">Expanding track probability envelope</span></div>'
      );
      setupHover(
        'moderate-zone-fill',
        '<div class="p-2 font-mono text-xs text-yellow-400"><b>MODERATE IMPACT ZONE (80-150 km)</b><br/><span class="text-slate-300">Squally winds & localized alerts</span></div>'
      );
      setupHover(
        'high-zone-fill',
        '<div class="p-2 font-mono text-xs text-orange-400"><b>HIGH RISK ZONE (35-80 km)</b><br/><span class="text-slate-300">Gale winds & surge warning</span></div>'
      );
      setupHover(
        'critical-zone-fill',
        '<div class="p-2 font-mono text-xs text-red-400"><b>CRITICAL LANDFALL ZONE (0-35 km)</b><br/><span class="text-slate-300">Peak eyewall destructive winds & storm surge</span></div>'
      );

      setMapLoaded(true);
    });

    mapInstanceRef.current = map;

    // ResizeObserver ensures canvas automatically tracks container dimensions
    const resizeObserver = new ResizeObserver(() => {
      map.resize();
    });
    if (mapContainerRef.current) {
      resizeObserver.observe(mapContainerRef.current);
    }

    return () => {
      resizeObserver.disconnect();
      hoverPopup.remove();
      markersRef.current.forEach((m) => m.remove());
      markersRef.current = [];
      if (cycloneEyeMarkerRef.current) {
        cycloneEyeMarkerRef.current.remove();
        cycloneEyeMarkerRef.current = null;
      }
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // 2. Toggle Map View Mode (Dark Tactical vs Satellite)
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !mapLoaded) return;

    const isSatellite = mapViewMode === 'satellite';
    if (map.getLayer('carto-dark-layer')) {
      map.setLayoutProperty('carto-dark-layer', 'visibility', isSatellite ? 'none' : 'visible');
    }
    if (map.getLayer('esri-satellite-layer')) {
      map.setLayoutProperty('esri-satellite-layer', 'visibility', isSatellite ? 'visible' : 'none');
    }
  }, [mapViewMode, mapLoaded]);

  // 3. Update GeoJSON Vector Layers (Cone, Zones, Pathways)
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !mapLoaded || !cycloneDetail) return;

    const updateSource = (sourceId: string, data: any) => {
      const src = map.getSource(sourceId) as maplibregl.GeoJSONSource | undefined;
      if (src) {
        src.setData(data);
      }
    };

    const obsPoints = cycloneDetail.observed_track || [];
    const fcPoints = cycloneDetail.forecast_track || [];
    const cone = cycloneDetail.forecast_cone;
    const zone = cycloneDetail.landfall_zone;

    // 1. Forecast Cone
    if (layers.forecastCone && cone && cone.geometry && cone.geometry.coordinates) {
      updateSource('forecast-cone-source', {
        type: 'Feature',
        geometry: cone.geometry,
        properties: {}
      });
    } else {
      updateSource('forecast-cone-source', EMPTY_GEOJSON);
    }

    // 2. Landfall Hazard Zones
    if (layers.landfallZone && zone) {
      updateSource(
        'moderate-zone-source',
        zone.moderate_polygon || EMPTY_GEOJSON
      );
      updateSource('high-zone-source', zone.high_polygon || EMPTY_GEOJSON);
      updateSource(
        'critical-zone-source',
        zone.critical_polygon || EMPTY_GEOJSON
      );
    } else {
      updateSource('moderate-zone-source', EMPTY_GEOJSON);
      updateSource('high-zone-source', EMPTY_GEOJSON);
      updateSource('critical-zone-source', EMPTY_GEOJSON);
    }

    // 3. Observed Pathway
    if (layers.observedPath && obsPoints.length > 1) {
      updateSource('observed-track-source', {
        type: 'Feature',
        geometry: {
          type: 'LineString',
          coordinates: obsPoints.map((p) => [p.longitude, p.latitude])
        },
        properties: {}
      });
    } else {
      updateSource('observed-track-source', EMPTY_GEOJSON);
    }

    // 4. Forecast Pathway
    if (layers.forecastPath && fcPoints.length > 0) {
      const lastObs = obsPoints.length > 0 ? obsPoints[obsPoints.length - 1] : null;
      const coords = [
        ...(lastObs ? [[lastObs.longitude, lastObs.latitude]] : []),
        ...fcPoints.map((p) => [p.longitude, p.latitude])
      ];

      updateSource('forecast-track-source', {
        type: 'Feature',
        geometry: {
          type: 'LineString',
          coordinates: coords
        },
        properties: {}
      });
    } else {
      updateSource('forecast-track-source', EMPTY_GEOJSON);
    }
  }, [cycloneDetail, layers, mapLoaded]);

  // 4. Update HTML Markers (Observed, Forecast, Landfall, Infrastructure)
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !mapLoaded || !cycloneDetail) return;

    // Clear previous markers
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    const obsPoints = cycloneDetail.observed_track || [];
    const fcPoints = cycloneDetail.forecast_track || [];
    const landfall = cycloneDetail.landfall;

    // A. Observed Track Points Markers
    if (layers.observedPath && obsPoints.length > 0) {
      obsPoints.forEach((pt, idx) => {
        const isCurrent = idx === obsPoints.length - 1;
        const el = document.createElement('div');
        el.className = 'group cursor-pointer';
        el.innerHTML = `
          <div class="${
            isCurrent ? 'w-3.5 h-3.5' : 'w-2.5 h-2.5'
          } rounded-full bg-cyan-400 border-2 border-slate-900 shadow-[0_0_8px_rgba(6,182,212,0.8)] transition transform group-hover:scale-150"></div>
        `;

        const popup = new maplibregl.Popup({ offset: 12, maxWidth: '240px' }).setHTML(`
          <div class="p-2.5 space-y-1 font-sans">
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

        const marker = new maplibregl.Marker({ element: el })
          .setLngLat([pt.longitude, pt.latitude])
          .setPopup(popup)
          .addTo(map);

        markersRef.current.push(marker);
      });
    }

    // B. Forecast Track Points Markers
    if (layers.forecastPath && fcPoints.length > 0) {
      fcPoints.forEach((pt) => {
        const el = document.createElement('div');
        el.className = 'group cursor-pointer';
        el.innerHTML = `
          <div class="w-2.5 h-2.5 rounded-full bg-rose-400 border-2 border-slate-900 shadow-[0_0_8px_rgba(244,63,94,0.8)] transition transform group-hover:scale-150"></div>
        `;

        const popup = new maplibregl.Popup({ offset: 12, maxWidth: '240px' }).setHTML(`
          <div class="p-2.5 space-y-1 font-sans">
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

        const marker = new maplibregl.Marker({ element: el })
          .setLngLat([pt.longitude, pt.latitude])
          .setPopup(popup)
          .addTo(map);

        markersRef.current.push(marker);
      });
    }

    // C. Predicted Landfall Marker (◆)
    if (landfall) {
      const el = document.createElement('div');
      el.className = 'cursor-pointer';
      el.innerHTML = `
        <div class="relative flex items-center justify-center">
          <div class="absolute -inset-2 bg-rose-500/40 rounded-full animate-ping"></div>
          <div class="w-8 h-8 rotate-45 bg-rose-600 border-2 border-white shadow-2xl flex items-center justify-center text-white font-bold text-xs hover:scale-110 transition">
            <span class="-rotate-45">◆</span>
          </div>
          <div class="absolute -top-7 whitespace-nowrap bg-rose-950/95 border border-rose-500 text-[10px] font-mono text-rose-200 px-1.5 py-0.5 rounded shadow-lg pointer-events-none">
            PREDICTED LANDFALL
          </div>
        </div>
      `;

      const popup = new maplibregl.Popup({ offset: 16, maxWidth: '280px' }).setHTML(`
        <div class="p-2.5 space-y-1.5 font-sans">
          <div class="flex items-center justify-between border-b border-slate-700 pb-1.5">
            <span class="font-bold text-rose-400 font-mono text-xs">◆ PREDICTED LANDFALL</span>
            <span class="text-[10px] bg-red-950 border border-red-800 text-red-300 px-1.5 py-0.5 rounded font-mono font-bold">${landfall.risk_category}</span>
          </div>
          <div class="text-xs font-semibold text-slate-100">${landfall.location_name}</div>
          <div class="text-[11px] text-slate-300">District: <span class="text-white">${landfall.district}, ${landfall.state}</span></div>
          <div class="text-[11px] text-slate-300">Estimated Window: <span class="text-cyan-400 font-mono font-semibold">${landfall.estimated_time}</span></div>
          <div class="text-[11px] text-slate-300">Expected Sustained Wind: <span class="text-amber-400 font-mono font-bold">${landfall.expected_wind_speed} km/h</span></div>
          <div class="text-[11px] text-slate-300">Expected Storm Surge: <span class="text-sky-300 font-mono font-bold">${landfall.expected_storm_surge_m} meters</span></div>
          <div class="text-[10px] text-slate-400 pt-1 border-t border-slate-700 italic">${landfall.source_label}</div>
        </div>
      `);

      const marker = new maplibregl.Marker({ element: el })
        .setLngLat([landfall.longitude, landfall.latitude])
        .setPopup(popup)
        .addTo(map);

      markersRef.current.push(marker);
    }

    // D. Lifeline Infrastructure Markers
    if (layers.infrastructure && infrastructure && infrastructure.assets) {
      infrastructure.assets.forEach((asset) => {
        if (asset.type === 'hospital' && !layers.hospitals) return;
        if (asset.type === 'power' && !layers.power) return;
        if (asset.type === 'bridge' && !layers.bridges) return;
        if (asset.type === 'shelter' && !layers.shelters) return;
        if (asset.type === 'water' && !layers.water) return;

        let colorClass = 'bg-emerald-600 border-emerald-400';
        if (asset.risk_category === 'CRITICAL') {
          colorClass = 'bg-red-600 border-red-400 shadow-[0_0_10px_rgba(220,38,38,0.7)] animate-pulse';
        } else if (asset.risk_category === 'HIGH') {
          colorClass = 'bg-orange-600 border-orange-400';
        } else if (asset.risk_category === 'MODERATE') {
          colorClass = 'bg-yellow-600 border-yellow-400';
        }

        let initial = asset.type.substring(0, 1).toUpperCase();
        if (asset.type === 'hospital') initial = '+';
        if (asset.type === 'power') initial = '⚡';
        if (asset.type === 'bridge') initial = '☵';
        if (asset.type === 'shelter') initial = '▲';
        if (asset.type === 'water') initial = '💧';

        const el = document.createElement('div');
        el.className = 'cursor-pointer';
        el.innerHTML = `
          <div class="w-6 h-6 rounded-full ${colorClass} border-2 text-white text-[11px] font-bold flex items-center justify-center cursor-pointer transform hover:scale-125 transition shadow-lg">
            ${initial}
          </div>
        `;

        el.addEventListener('click', () => {
          setSelectedAsset(asset);
        });

        const popup = new maplibregl.Popup({ offset: 14, maxWidth: '260px' }).setHTML(`
          <div class="p-2.5 space-y-1.5 font-sans">
            <div class="flex items-center justify-between border-b border-slate-700 pb-1">
              <span class="font-bold text-slate-100 text-xs">${asset.name}</span>
              <span class="text-[10px] px-1.5 py-0.5 rounded font-mono font-bold ${
                asset.risk_category === 'CRITICAL'
                  ? 'bg-red-950 text-red-300 border border-red-800'
                  : asset.risk_category === 'HIGH'
                  ? 'bg-orange-950 text-orange-300 border border-orange-800'
                  : 'bg-yellow-950 text-yellow-300 border border-yellow-800'
              }">${asset.risk_category} (${asset.risk_score})</span>
            </div>
            <div class="text-[11px] text-slate-300">Type: <span class="text-white capitalize">${asset.type}</span> | ${asset.district}</div>
            <div class="text-[11px] text-slate-300">Dist to Track: <span class="text-cyan-400 font-mono font-semibold">${asset.distance_from_track_km} km</span></div>
            <div class="text-[11px] text-slate-300">Dist to Landfall: <span class="text-rose-400 font-mono font-semibold">${asset.distance_from_landfall_km} km</span></div>
            <div class="text-[11px] text-slate-300">Wind Exposure: <span class="text-amber-400 font-mono font-bold">${asset.wind_exposure_kmh} km/h</span></div>
            <div class="text-[10px] text-slate-300 bg-slate-800/90 p-1.5 rounded border border-slate-700 mt-1">
              <span class="text-cyan-300 font-semibold">Priority Action:</span> ${asset.prototype_action}
            </div>
          </div>
        `);

        const marker = new maplibregl.Marker({ element: el })
          .setLngLat([asset.longitude, asset.latitude])
          .setPopup(popup)
          .addTo(map);

        markersRef.current.push(marker);
      });
    }
  }, [cycloneDetail, infrastructure, layers, mapLoaded, setSelectedAsset]);

  // 5. Animated Cyclone Eye Marker
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !mapLoaded) return;

    const pt =
      currentFramePoint ||
      (cycloneDetail?.observed_track && cycloneDetail.observed_track.length > 0
        ? cycloneDetail.observed_track[cycloneDetail.observed_track.length - 1]
        : null);

    if (!pt) {
      if (cycloneEyeMarkerRef.current) {
        cycloneEyeMarkerRef.current.remove();
        cycloneEyeMarkerRef.current = null;
      }
      return;
    }

    if (cycloneEyeMarkerRef.current) {
      cycloneEyeMarkerRef.current.remove();
    }

    const el = document.createElement('div');
    el.className = 'relative flex items-center justify-center cursor-pointer';
    el.innerHTML = `
      <div class="relative flex items-center justify-center">
        <div class="absolute -inset-4 bg-cyan-500/30 rounded-full radar-wave pointer-events-none"></div>
        <div class="w-10 h-10 rounded-full bg-slate-900 border-2 border-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.7)] flex items-center justify-center text-cyan-300 animate-spin-slow">
          <svg class="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 2a10 10 0 0 0-10 10c0 5.523 4.477 10 10 10s10-4.477 10-10a10 10 0 0 0-10-10z"/>
            <path d="M12 6a6 6 0 1 0 0 12 6 6 0 0 0 0-12z"/>
            <circle cx="12" cy="12" r="2" fill="currentColor"/>
          </svg>
        </div>
        <div class="absolute -bottom-6 whitespace-nowrap bg-slate-950/95 border border-cyan-500/80 text-[10px] font-mono text-cyan-200 px-2 py-0.5 rounded shadow-lg flex items-center gap-1.5 pointer-events-none">
          <span class="font-bold text-white">${pt.wind_speed} km/h</span>
          <span class="text-slate-400">|</span>
          <span class="text-cyan-400 font-semibold">${pt.movement_direction} @ ${pt.movement_speed}km/h</span>
        </div>
      </div>
    `;

    const eyeMarker = new maplibregl.Marker({ element: el })
      .setLngLat([pt.longitude, pt.latitude])
      .addTo(map);

    cycloneEyeMarkerRef.current = eyeMarker;

    if (isPlaying) {
      map.panTo([pt.longitude, pt.latitude], { duration: 900 });
    }
  }, [currentFramePoint, isPlaying, cycloneDetail, mapLoaded]);

  // Controls Callbacks
  const handleZoomIn = useCallback(() => {
    mapInstanceRef.current?.zoomIn();
  }, []);

  const handleZoomOut = useCallback(() => {
    mapInstanceRef.current?.zoomOut();
  }, []);

  const handleFitCyclonePath = useCallback(() => {
    const map = mapInstanceRef.current;
    if (!map || !cycloneDetail) return;

    const all = [...(cycloneDetail.observed_track || []), ...(cycloneDetail.forecast_track || [])];
    if (all.length > 0) {
      const lngs = all.map((p) => p.longitude);
      const lats = all.map((p) => p.latitude);
      if (cycloneDetail.landfall) {
        lngs.push(cycloneDetail.landfall.longitude);
        lats.push(cycloneDetail.landfall.latitude);
      }

      const bounds = new maplibregl.LngLatBounds(
        [Math.min(...lngs), Math.min(...lats)],
        [Math.max(...lngs), Math.max(...lats)]
      );

      map.fitBounds(bounds, { padding: 50, duration: 1000 });
    }
  }, [cycloneDetail]);

  const handleLocateCyclone = useCallback(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    const pt =
      currentFramePoint ||
      (cycloneDetail?.observed_track && cycloneDetail.observed_track.length > 0
        ? cycloneDetail.observed_track[cycloneDetail.observed_track.length - 1]
        : null);

    if (pt) {
      map.flyTo({ center: [pt.longitude, pt.latitude], zoom: 8, duration: 1200 });
    }
  }, [currentFramePoint, cycloneDetail]);

  const handleShowLandfall = useCallback(() => {
    const map = mapInstanceRef.current;
    if (map && cycloneDetail?.landfall) {
      map.flyTo({
        center: [cycloneDetail.landfall.longitude, cycloneDetail.landfall.latitude],
        zoom: 9.5,
        duration: 1200
      });
    }
  }, [cycloneDetail]);

  return (
    <div className="relative w-full h-full min-h-[520px] rounded-lg overflow-hidden border border-command-border shadow-2xl bg-command-surface">
      {/* Engine Status Ribbon (MapLibre GL JS + OSM) */}
      <div className="absolute top-3 left-1/2 -translate-x-1/2 z-[400] flex flex-col items-center pointer-events-none">
        <div className="flex items-center gap-2 bg-slate-900/95 backdrop-blur-md border border-cyan-500/40 text-xs px-3.5 py-1 rounded-full shadow-xl font-mono text-slate-200 pointer-events-auto">
          <MapIcon className="w-3.5 h-3.5 text-cyan-400" />
          <span className="font-semibold text-slate-100">ENGINE: MAPLIBRE GL JS</span>
          <span className="text-slate-500">|</span>
          <span className="flex items-center gap-1.5 text-[11px] text-emerald-400 font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            OPENSTREETMAP TACTICAL
          </span>
        </div>
      </div>

      {/* Map Container */}
      <div ref={mapContainerRef} className="w-full h-full z-0" />

      {/* Map Legend (Tactical Layer Toggles) */}
      <MapLegend />

      {/* Map Interactive Controls */}
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
