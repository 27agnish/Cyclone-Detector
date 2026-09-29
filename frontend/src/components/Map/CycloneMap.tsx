import React, { useEffect, useRef, useState, useCallback } from 'react';
import { MapContainer, TileLayer, ScaleControl, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

import { useCycloneStore } from '../../store/cycloneStore';
import { MapControls } from './MapControls';
import { MapLegend } from './MapLegend';
import { Map as MapIcon } from 'lucide-react';

// Configure Leaflet default icons to avoid missing asset issues in Vite
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow
});

interface LeafletTacticalControllerProps {
  onMapReady: (map: L.Map) => void;
}

const LeafletTacticalController: React.FC<LeafletTacticalControllerProps> = ({ onMapReady }) => {
  const map = useMap();
  const {
    cycloneDetail,
    infrastructure,
    layers,
    currentFramePoint,
    isPlaying,
    setSelectedAsset
  } = useCycloneStore();

  const vectorGroupRef = useRef<L.LayerGroup | null>(null);
  const markersGroupRef = useRef<L.LayerGroup | null>(null);
  const eyeMarkerRef = useRef<L.Marker | null>(null);

  // Initialize Layer Groups once on mount
  useEffect(() => {
    onMapReady(map);

    const vectorGroup = L.layerGroup().addTo(map);
    const markersGroup = L.layerGroup().addTo(map);
    vectorGroupRef.current = vectorGroup;
    markersGroupRef.current = markersGroup;

    return () => {
      vectorGroup.clearLayers();
      markersGroup.clearLayers();
      map.removeLayer(vectorGroup);
      map.removeLayer(markersGroup);
      if (eyeMarkerRef.current) {
        map.removeLayer(eyeMarkerRef.current);
        eyeMarkerRef.current = null;
      }
    };
  }, [map, onMapReady]);

  // Update Vector Layers (Forecast Cone, Landfall Hazard Zones, Observed and Forecast Paths)
  useEffect(() => {
    const vectorGroup = vectorGroupRef.current;
    if (!vectorGroup || !cycloneDetail) return;

    vectorGroup.clearLayers();

    const obsPoints = cycloneDetail.observed_track || [];
    const fcPoints = cycloneDetail.forecast_track || [];
    const cone = cycloneDetail.forecast_cone;
    const zone = cycloneDetail.landfall_zone;

    // 1. Forecast Uncertainty Cone (GeoJSON Polygon)
    if (layers.forecastCone && cone && cone.geometry && cone.geometry.coordinates) {
      try {
        const coneLayer = L.geoJSON(cone.geometry as any, {
          style: {
            color: '#0ea5e9',
            fillColor: '#38bdf8',
            fillOpacity: 0.16,
            weight: 2,
            dashArray: '4, 4'
          }
        }).bindTooltip(
          '<div class="p-1 font-mono text-xs"><b class="text-cyan-400">FORECAST UNCERTAINTY CONE</b><br/><span class="text-slate-300">Expanding track probability envelope</span></div>',
          { sticky: true, className: 'tactical-tooltip' }
        );
        coneLayer.addTo(vectorGroup);
      } catch (err) {
        console.warn('[Leaflet] Forecast cone render warning:', err);
      }
    }

    // 2. Landfall Hazard Zones (Polygons with Tooltips)
    if (layers.landfallZone && zone) {
      // Moderate Impact Zone (Yellow)
      if (zone.moderate_polygon) {
        try {
          const modLayer = L.geoJSON(zone.moderate_polygon as any, {
            style: {
              color: '#eab308',
              fillColor: '#eab308',
              fillOpacity: 0.08,
              weight: 1.5
            }
          }).bindTooltip(
            '<div class="p-1 font-mono text-xs text-yellow-400"><b>MODERATE IMPACT ZONE (80-150 km)</b><br/><span class="text-slate-300">Squally winds & localized alerts</span></div>',
            { sticky: true, className: 'tactical-tooltip' }
          );
          modLayer.addTo(vectorGroup);
        } catch (err) {
          console.warn('[Leaflet] Moderate zone render warning:', err);
        }
      }

      // High Risk Zone (Orange)
      if (zone.high_polygon) {
        try {
          const highLayer = L.geoJSON(zone.high_polygon as any, {
            style: {
              color: '#f97316',
              fillColor: '#f97316',
              fillOpacity: 0.16,
              weight: 2
            }
          }).bindTooltip(
            '<div class="p-1 font-mono text-xs text-orange-400"><b>HIGH RISK ZONE (35-80 km)</b><br/><span class="text-slate-300">Gale winds & surge warning</span></div>',
            { sticky: true, className: 'tactical-tooltip' }
          );
          highLayer.addTo(vectorGroup);
        } catch (err) {
          console.warn('[Leaflet] High zone render warning:', err);
        }
      }

      // Critical Landfall Zone (Red)
      if (zone.critical_polygon) {
        try {
          const critLayer = L.geoJSON(zone.critical_polygon as any, {
            style: {
              color: '#ef4444',
              fillColor: '#dc2626',
              fillOpacity: 0.28,
              weight: 2.5
            }
          }).bindTooltip(
            '<div class="p-1 font-mono text-xs text-red-400"><b>CRITICAL LANDFALL ZONE (0-35 km)</b><br/><span class="text-slate-300">Peak eyewall destructive winds & storm surge</span></div>',
            { sticky: true, className: 'tactical-tooltip' }
          );
          critLayer.addTo(vectorGroup);
        } catch (err) {
          console.warn('[Leaflet] Critical zone render warning:', err);
        }
      }
    }

    // 3. Observed Pathway Line (Solid Cyan)
    if (layers.observedPath && obsPoints.length > 1) {
      const obsLatLngs: [number, number][] = obsPoints.map((p) => [p.latitude, p.longitude]);
      const obsPolyline = L.polyline(obsLatLngs, {
        color: '#38bdf8',
        weight: 4,
        opacity: 0.95
      });
      obsPolyline.addTo(vectorGroup);
    }

    // 4. Forecast Pathway Line (Dashed Rose)
    if (layers.forecastPath && fcPoints.length > 0) {
      const lastObs = obsPoints.length > 0 ? obsPoints[obsPoints.length - 1] : null;
      const fcLatLngs: [number, number][] = [
        ...(lastObs ? [[lastObs.latitude, lastObs.longitude] as [number, number]] : []),
        ...fcPoints.map((p) => [p.latitude, p.longitude] as [number, number])
      ];

      const fcPolyline = L.polyline(fcLatLngs, {
        color: '#f43f5e',
        weight: 3.5,
        dashArray: '6, 6',
        opacity: 0.9
      });
      fcPolyline.addTo(vectorGroup);
    }
  }, [cycloneDetail, layers]);

  // Update HTML Markers (Observed, Forecast, Landfall, Infrastructure)
  useEffect(() => {
    const markersGroup = markersGroupRef.current;
    if (!markersGroup || !cycloneDetail) return;

    markersGroup.clearLayers();

    const obsPoints = cycloneDetail.observed_track || [];
    const fcPoints = cycloneDetail.forecast_track || [];
    const landfall = cycloneDetail.landfall;

    // A. Observed Track Point Markers
    if (layers.observedPath && obsPoints.length > 0) {
      obsPoints.forEach((pt, idx) => {
        const isCurrent = idx === obsPoints.length - 1;
        const size = isCurrent ? 14 : 10;
        const icon = L.divIcon({
          className: '',
          html: `
            <div class="relative flex items-center justify-center -translate-x-1/2 -translate-y-1/2 cursor-pointer group">
              <div class="${
                isCurrent ? 'w-3.5 h-3.5' : 'w-2.5 h-2.5'
              } rounded-full bg-cyan-400 border-2 border-slate-900 shadow-[0_0_8px_rgba(6,182,212,0.8)] transition transform group-hover:scale-150"></div>
            </div>
          `,
          iconSize: [size, size],
          iconAnchor: [size / 2, size / 2],
          popupAnchor: [0, -size / 2 - 4]
        });

        const popupContent = `
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
        `;

        const marker = L.marker([pt.latitude, pt.longitude], { icon }).bindPopup(popupContent, {
          maxWidth: 260
        });
        marker.addTo(markersGroup);
      });
    }

    // B. Forecast Track Point Markers
    if (layers.forecastPath && fcPoints.length > 0) {
      fcPoints.forEach((pt) => {
        const icon = L.divIcon({
          className: '',
          html: `
            <div class="relative flex items-center justify-center -translate-x-1/2 -translate-y-1/2 cursor-pointer group">
              <div class="w-2.5 h-2.5 rounded-full bg-rose-400 border-2 border-slate-900 shadow-[0_0_8px_rgba(244,63,94,0.8)] transition transform group-hover:scale-150"></div>
            </div>
          `,
          iconSize: [10, 10],
          iconAnchor: [5, 5],
          popupAnchor: [0, -9]
        });

        const popupContent = `
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
        `;

        const marker = L.marker([pt.latitude, pt.longitude], { icon }).bindPopup(popupContent, {
          maxWidth: 260
        });
        marker.addTo(markersGroup);
      });
    }

    // C. Predicted Landfall Marker (◆)
    if (landfall) {
      const icon = L.divIcon({
        className: '',
        html: `
          <div class="relative flex items-center justify-center -translate-x-1/2 -translate-y-1/2 cursor-pointer">
            <div class="absolute -inset-2 bg-rose-500/40 rounded-full animate-ping"></div>
            <div class="w-8 h-8 rotate-45 bg-rose-600 border-2 border-white shadow-2xl flex items-center justify-center text-white font-bold text-xs hover:scale-110 transition">
              <span class="-rotate-45">◆</span>
            </div>
            <div class="absolute -top-7 whitespace-nowrap bg-rose-950/95 border border-rose-500 text-[10px] font-mono text-rose-200 px-1.5 py-0.5 rounded shadow-lg pointer-events-none">
              PREDICTED LANDFALL
            </div>
          </div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
        popupAnchor: [0, -22]
      });

      const popupContent = `
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
      `;

      const marker = L.marker([landfall.latitude, landfall.longitude], { icon }).bindPopup(
        popupContent,
        { maxWidth: 280 }
      );
      marker.addTo(markersGroup);
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
          colorClass =
            'bg-red-600 border-red-400 shadow-[0_0_10px_rgba(220,38,38,0.7)] animate-pulse';
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

        const icon = L.divIcon({
          className: '',
          html: `
            <div class="relative flex items-center justify-center -translate-x-1/2 -translate-y-1/2 cursor-pointer">
              <div class="w-6 h-6 rounded-full ${colorClass} border-2 text-white text-[11px] font-bold flex items-center justify-center cursor-pointer transform hover:scale-125 transition shadow-lg">
                ${initial}
              </div>
            </div>
          `,
          iconSize: [24, 24],
          iconAnchor: [12, 12],
          popupAnchor: [0, -14]
        });

        const popupContent = `
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
        `;

        const marker = L.marker([asset.latitude, asset.longitude], { icon }).bindPopup(
          popupContent,
          { maxWidth: 260 }
        );
        marker.on('click', () => {
          setSelectedAsset(asset);
        });
        marker.addTo(markersGroup);
      });
    }
  }, [cycloneDetail, infrastructure, layers, setSelectedAsset]);

  // Animated Cyclone Eye Marker
  useEffect(() => {
    const pt =
      currentFramePoint ||
      (cycloneDetail?.observed_track && cycloneDetail.observed_track.length > 0
        ? cycloneDetail.observed_track[cycloneDetail.observed_track.length - 1]
        : null);

    if (!pt) {
      if (eyeMarkerRef.current) {
        map.removeLayer(eyeMarkerRef.current);
        eyeMarkerRef.current = null;
      }
      return;
    }

    const icon = L.divIcon({
      className: '',
      html: `
        <div class="relative flex items-center justify-center -translate-x-1/2 -translate-y-1/2 cursor-pointer">
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
      `,
      iconSize: [40, 40],
      iconAnchor: [20, 20]
    });

    if (eyeMarkerRef.current) {
      eyeMarkerRef.current.setLatLng([pt.latitude, pt.longitude]);
      eyeMarkerRef.current.setIcon(icon);
    } else {
      const marker = L.marker([pt.latitude, pt.longitude], {
        icon,
        zIndexOffset: 1000
      }).addTo(map);
      eyeMarkerRef.current = marker;
    }

    if (isPlaying) {
      map.panTo([pt.latitude, pt.longitude], { animate: true, duration: 0.9 });
    }
  }, [map, currentFramePoint, isPlaying, cycloneDetail]);

  return null;
};

export const CycloneMap: React.FC = () => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const [mapInstance, setMapInstance] = useState<L.Map | null>(null);

  const { cycloneDetail, currentFramePoint, isPlaying, mapViewMode } = useCycloneStore();

  const handleMapReady = useCallback((map: L.Map) => {
    setMapInstance(map);
  }, []);

  // ResizeObserver ensures Leaflet updates viewport when dashboard dimensions change
  useEffect(() => {
    if (!mapInstance || !mapContainerRef.current) return;

    const resizeObserver = new ResizeObserver(() => {
      mapInstance.invalidateSize();
    });

    resizeObserver.observe(mapContainerRef.current);

    return () => {
      resizeObserver.disconnect();
    };
  }, [mapInstance]);

  // Controls Callbacks
  const handleZoomIn = useCallback(() => {
    mapInstance?.zoomIn();
  }, [mapInstance]);

  const handleZoomOut = useCallback(() => {
    mapInstance?.zoomOut();
  }, [mapInstance]);

  const handleFitCyclonePath = useCallback(() => {
    if (!mapInstance || !cycloneDetail) return;

    const all = [...(cycloneDetail.observed_track || []), ...(cycloneDetail.forecast_track || [])];
    if (all.length > 0) {
      const latlngs = all.map((p) => [p.latitude, p.longitude] as [number, number]);
      if (cycloneDetail.landfall) {
        latlngs.push([cycloneDetail.landfall.latitude, cycloneDetail.landfall.longitude]);
      }

      const bounds = L.latLngBounds(latlngs);
      mapInstance.fitBounds(bounds, { padding: [50, 50], maxZoom: 12 });
    }
  }, [mapInstance, cycloneDetail]);

  const handleLocateCyclone = useCallback(() => {
    if (!mapInstance) return;

    const pt =
      currentFramePoint ||
      (cycloneDetail?.observed_track && cycloneDetail.observed_track.length > 0
        ? cycloneDetail.observed_track[cycloneDetail.observed_track.length - 1]
        : null);

    if (pt) {
      mapInstance.flyTo([pt.latitude, pt.longitude], 8, { duration: 1.2 });
    }
  }, [mapInstance, currentFramePoint, cycloneDetail]);

  const handleShowLandfall = useCallback(() => {
    if (mapInstance && cycloneDetail?.landfall) {
      mapInstance.flyTo(
        [cycloneDetail.landfall.latitude, cycloneDetail.landfall.longitude],
        9.5,
        { duration: 1.2 }
      );
    }
  }, [mapInstance, cycloneDetail]);

  return (
    <div
      ref={mapContainerRef}
      className="relative w-full h-full min-h-[520px] rounded-lg overflow-hidden border border-command-border shadow-2xl bg-command-surface"
    >
      {/* Engine Status Ribbon (Leaflet + OSM) */}
      <div className="absolute top-3 left-1/2 -translate-x-1/2 z-[400] flex flex-col items-center pointer-events-none">
        <div className="flex items-center gap-2 bg-slate-900/95 backdrop-blur-md border border-cyan-500/40 text-xs px-3.5 py-1 rounded-full shadow-xl font-mono text-slate-200 pointer-events-auto">
          <MapIcon className="w-3.5 h-3.5 text-cyan-400" />
          <span className="font-semibold text-slate-100">ENGINE: LEAFLET + OPENSTREETMAP</span>
          <span className="text-slate-500">|</span>
          <span className="flex items-center gap-1.5 text-[11px] text-emerald-400 font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            OPENSTREETMAP TACTICAL
          </span>
        </div>
      </div>

      {/* Leaflet React Map Container */}
      <MapContainer
        center={[20.2, 87.2]}
        zoom={6.5}
        minZoom={3}
        maxZoom={18}
        zoomControl={false}
        attributionControl={true}
        className="w-full h-full min-h-[520px]"
      >
        {/* OpenStreetMap Base Map (or Esri World Imagery when in satellite view) */}
        {mapViewMode === 'satellite' ? (
          <TileLayer
            key="esri-satellite"
            attribution="&copy; Esri, Maxar, Earthstar Geographics"
            url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
          />
        ) : (
          <TileLayer
            key="osm-tactical"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            className="osm-dark-tiles"
          />
        )}

        {/* Tactical Metric Scale Indicator */}
        <ScaleControl position="bottomleft" imperial={false} />

        {/* Tactical Controller managing GeoJSON polygons, polylines, and dynamic HTML markers */}
        <LeafletTacticalController onMapReady={handleMapReady} />
      </MapContainer>

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
