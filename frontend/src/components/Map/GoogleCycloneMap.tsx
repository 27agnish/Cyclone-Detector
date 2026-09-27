import React, { useEffect, useRef, useState } from 'react';
import { useCycloneStore } from '../../store/cycloneStore';
import { env } from '../../config/env';
import { MapControls } from './MapControls';
import { MapLegend } from './MapLegend';
import { TrackPoint, InfrastructureAsset } from '../../types/cyclone';

// Google Maps Dark Command Center Style
const DARK_MAP_STYLE = [
  { elementType: "geometry", stylers: [{ color: "#0b111e" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#0b111e" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#94a3b8" }] },
  { featureType: "administrative.locality", elementType: "labels.text.fill", stylers: [{ color: "#38bdf8" }] },
  { featureType: "poi", elementType: "labels.text.fill", stylers: [{ color: "#64748b" }] },
  { featureType: "poi.park", elementType: "geometry", stylers: [{ color: "#111f33" }] },
  { featureType: "road", elementType: "geometry", stylers: [{ color: "#1e293b" }] },
  { featureType: "road", elementType: "geometry.stroke", stylers: [{ color: "#0f172a" }] },
  { featureType: "road", elementType: "labels.text.fill", stylers: [{ color: "#94a3b8" }] },
  { featureType: "road.highway", elementType: "geometry", stylers: [{ color: "#334155" }] },
  { featureType: "road.highway", elementType: "geometry.stroke", stylers: [{ color: "#1e293b" }] },
  { featureType: "water", elementType: "geometry", stylers: [{ color: "#070b13" }] },
  { featureType: "water", elementType: "labels.text.fill", stylers: [{ color: "#0ea5e9" }] },
];

export const GoogleCycloneMap: React.FC<{ onError?: (err: string) => void }> = ({ onError }) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const overlaysRef = useRef<any[]>([]);
  const currentEyeMarkerRef = useRef<any>(null);
  const infoWindowRef = useRef<any>(null);

  const [mapLoaded, setMapLoaded] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  const {
    cycloneDetail,
    infrastructure,
    layers,
    currentFramePoint,
    isPlaying,
    mapViewMode,
    setSelectedAsset
  } = useCycloneStore();

  // Load Google Maps JavaScript API script
  useEffect(() => {
    if (!env.GOOGLE_MAPS_API_KEY) {
      setLoadError("Google Maps API key is not configured.");
      onError?.("Google Maps API key is not configured.");
      return;
    }

    if ((window as any).google?.maps) {
      setMapLoaded(true);
      return;
    }

    const scriptId = 'google-maps-script-cycloneshield';
    if (document.getElementById(scriptId)) {
      const checkInterval = setInterval(() => {
        if ((window as any).google?.maps) {
          clearInterval(checkInterval);
          setMapLoaded(true);
        }
      }, 100);
      return;
    }

    const script = document.createElement('script');
    script.id = scriptId;
    script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(env.GOOGLE_MAPS_API_KEY)}&libraries=geometry`;
    script.async = true;
    script.defer = true;

    script.onload = () => {
      setMapLoaded(true);
    };

    script.onerror = () => {
      const msg = "Failed to load Google Maps JavaScript API (Check key restrictions or quota).";
      setLoadError(msg);
      onError?.(msg);
    };

    document.head.appendChild(script);
  }, []);

  // Initialize Google Map instance
  useEffect(() => {
    if (!mapLoaded || !mapContainerRef.current || mapInstanceRef.current) return;

    try {
      const g = (window as any).google.maps;
      const map = new g.Map(mapContainerRef.current, {
        center: { lat: 20.2, lng: 87.2 },
        zoom: 7,
        styles: mapViewMode === 'satellite' ? [] : DARK_MAP_STYLE,
        mapTypeId: mapViewMode === 'satellite' ? g.MapTypeId.HYBRID : g.MapTypeId.ROADMAP,
        disableDefaultUI: true,
        backgroundColor: '#0a0e17'
      });

      mapInstanceRef.current = map;
      infoWindowRef.current = new g.InfoWindow();
    } catch (e: any) {
      console.error("Google Maps initialization error:", e);
      setLoadError(e.message || "Failed to initialize Google Maps.");
      onError?.(e.message || "Failed to initialize Google Maps.");
    }
  }, [mapLoaded]);

  // Update Map Type (Satellite vs Tactical Road)
  useEffect(() => {
    if (!mapInstanceRef.current || !(window as any).google?.maps) return;
    const g = (window as any).google.maps;
    const map = mapInstanceRef.current;
    if (mapViewMode === 'satellite') {
      map.setMapTypeId(g.MapTypeId.HYBRID);
      map.setOptions({ styles: [] });
    } else {
      map.setMapTypeId(g.MapTypeId.ROADMAP);
      map.setOptions({ styles: DARK_MAP_STYLE });
    }
  }, [mapViewMode]);

  // Render Cyclone Pathways, Cones, Landfall & Infrastructure
  useEffect(() => {
    if (!mapInstanceRef.current || !(window as any).google?.maps || !cycloneDetail) return;
    const g = (window as any).google.maps;
    const map = mapInstanceRef.current;

    // Clear previous overlays
    overlaysRef.current.forEach(ov => ov.setMap(null));
    overlaysRef.current = [];

    const obsPoints = cycloneDetail.observed_track || [];
    const fcPoints = cycloneDetail.forecast_track || [];
    const landfall = cycloneDetail.landfall;
    const cone = cycloneDetail.forecast_cone;
    const zone = cycloneDetail.landfall_zone;

    // 1. FORECAST UNCERTAINTY CONE (Google Maps Polygon)
    if (layers.forecastCone && cone && cone.geometry && cone.geometry.coordinates) {
      try {
        const rings = cone.geometry.coordinates;
        const outerCoords = rings[0].map((coord: number[]) => ({ lat: coord[1], lng: coord[0] }));
        
        const conePolygon = new g.Polygon({
          paths: outerCoords,
          strokeColor: '#0ea5e9',
          strokeOpacity: 0.8,
          strokeWeight: 2,
          fillColor: '#38bdf8',
          fillOpacity: 0.16,
          map: map
        });
        overlaysRef.current.push(conePolygon);
      } catch (e) {
        console.error("Error drawing cone on Google Maps:", e);
      }
    }

    // 2. LANDFALL HAZARD IMPACT ZONES (Concentric Polygons)
    if (layers.landfallZone && zone) {
      const renderZonePoly = (geoJsonPoly: any, strokeColor: string, fillColor: string, opacity: number) => {
        if (!geoJsonPoly || !geoJsonPoly.coordinates) return;
        const coords = geoJsonPoly.coordinates[0].map((c: number[]) => ({ lat: c[1], lng: c[0] }));
        const poly = new g.Polygon({
          paths: coords,
          strokeColor,
          strokeOpacity: 0.9,
          strokeWeight: 2,
          fillColor,
          fillOpacity: opacity,
          map: map
        });
        overlaysRef.current.push(poly);
      };

      renderZonePoly(zone.moderate_polygon, '#eab308', '#eab308', 0.08);
      renderZonePoly(zone.high_polygon, '#f97316', '#f97316', 0.16);
      renderZonePoly(zone.critical_polygon, '#ef4444', '#dc2626', 0.28);
    }

    // 3. OBSERVED PATHWAY (Solid Cyan Polyline with symbols)
    if (layers.observedPath && obsPoints.length > 0) {
      const obsPath = obsPoints.map(p => ({ lat: p.latitude, lng: p.longitude }));
      const obsPolyline = new g.Polyline({
        path: obsPath,
        geodesic: true,
        strokeColor: '#38bdf8',
        strokeOpacity: 0.95,
        strokeWeight: 4,
        icons: [{
          icon: { path: g.SymbolPath.FORWARD_CLOSED_ARROW, scale: 2.5, strokeColor: '#0284c7', fillColor: '#38bdf8', fillOpacity: 1 },
          offset: '50%',
          repeat: '80px'
        }],
        map: map
      });
      overlaysRef.current.push(obsPolyline);

      // Observed Point Nodes
      obsPoints.forEach((pt) => {
        const marker = new g.Marker({
          position: { lat: pt.latitude, lng: pt.longitude },
          map: map,
          icon: {
            path: g.SymbolPath.CIRCLE,
            scale: 5,
            fillColor: '#38bdf8',
            fillOpacity: 1,
            strokeColor: '#0284c7',
            strokeWeight: 2
          }
        });

        marker.addListener('click', () => {
          infoWindowRef.current.setContent(`
            <div style="color: #0f172a; font-family: monospace; font-size: 11px; padding: 4px;">
              <strong style="color: #0284c7;">OBSERVED POINT</strong><br/>
              <b>Time:</b> ${pt.timestamp}<br/>
              <b>Wind:</b> ${pt.wind_speed} km/h | <b>Pres:</b> ${pt.pressure} hPa<br/>
              <b>Movement:</b> ${pt.movement_direction} @ ${pt.movement_speed} km/h
            </div>
          `);
          infoWindowRef.current.open(map, marker);
        });

        overlaysRef.current.push(marker);
      });
    }

    // 4. FORECAST PATHWAY (Dashed Rose Polyline)
    if (layers.forecastPath && fcPoints.length > 0) {
      const lastObs = obsPoints.length > 0 ? obsPoints[obsPoints.length - 1] : null;
      const fcPath = lastObs 
        ? [{ lat: lastObs.latitude, lng: lastObs.longitude }, ...fcPoints.map(p => ({ lat: p.latitude, lng: p.longitude }))]
        : fcPoints.map(p => ({ lat: p.latitude, lng: p.longitude }));

      const fcPolyline = new g.Polyline({
        path: fcPath,
        geodesic: true,
        strokeColor: '#f43f5e',
        strokeOpacity: 0.9,
        strokeWeight: 3.5,
        icons: [{
          icon: { path: 'M 0,-1 0,1', strokeOpacity: 1, scale: 3 },
          offset: '0',
          repeat: '15px'
        }],
        map: map
      });
      overlaysRef.current.push(fcPolyline);

      // Forecast Point Nodes
      fcPoints.forEach((pt) => {
        const marker = new g.Marker({
          position: { lat: pt.latitude, lng: pt.longitude },
          map: map,
          icon: {
            path: g.SymbolPath.CIRCLE,
            scale: 5,
            fillColor: '#fb7185',
            fillOpacity: 1,
            strokeColor: '#be123c',
            strokeWeight: 2
          }
        });

        marker.addListener('click', () => {
          infoWindowRef.current.setContent(`
            <div style="color: #0f172a; font-family: monospace; font-size: 11px; padding: 4px;">
              <strong style="color: #e11d48;">FORECAST POINT</strong><br/>
              <b>Time:</b> ${pt.timestamp}<br/>
              <b>Expected Wind:</b> ${pt.wind_speed} km/h | <b>Pres:</b> ${pt.pressure} hPa<br/>
              <b>Category:</b> ${pt.category}
            </div>
          `);
          infoWindowRef.current.open(map, marker);
        });

        overlaysRef.current.push(marker);
      });
    }

    // 5. PREDICTED LANDFALL MARKER (◆ Diamond)
    if (landfall) {
      const lfMarker = new g.Marker({
        position: { lat: landfall.latitude, lng: landfall.longitude },
        map: map,
        icon: {
          path: 'M 0 -12 L 12 0 L 0 12 L -12 0 Z',
          fillColor: '#e11d48',
          fillOpacity: 1,
          strokeColor: '#ffffff',
          strokeWeight: 2,
          scale: 1.2
        },
        title: `PREDICTED LANDFALL: ${landfall.location_name}`
      });

      lfMarker.addListener('click', () => {
        infoWindowRef.current.setContent(`
          <div style="color: #0f172a; font-family: monospace; font-size: 11px; padding: 6px;">
            <strong style="color: #be123c;">◆ PREDICTED LANDFALL</strong><br/>
            <b>Location:</b> ${landfall.location_name} (${landfall.district})<br/>
            <b>ETA:</b> ${landfall.estimated_time}<br/>
            <b>Expected Wind:</b> ${landfall.expected_wind_speed} km/h<br/>
            <b>Storm Surge:</b> ${landfall.expected_storm_surge_m} meters<br/>
            <b>Status:</b> ${landfall.risk_category}
          </div>
        `);
        infoWindowRef.current.open(map, lfMarker);
      });

      overlaysRef.current.push(lfMarker);
    }

    // 6. INFRASTRUCTURE ASSET MARKERS
    if (layers.infrastructure && infrastructure?.assets) {
      infrastructure.assets.forEach((asset) => {
        if (asset.type === 'hospital' && !layers.hospitals) return;
        if (asset.type === 'power' && !layers.power) return;
        if (asset.type === 'bridge' && !layers.bridges) return;
        if (asset.type === 'shelter' && !layers.shelters) return;
        if (asset.type === 'water' && !layers.water) return;

        let pinColor = '#10b981';
        if (asset.risk_category === 'CRITICAL') pinColor = '#ef4444';
        else if (asset.risk_category === 'HIGH') pinColor = '#f97316';
        else if (asset.risk_category === 'MODERATE') pinColor = '#eab308';

        const marker = new g.Marker({
          position: { lat: asset.latitude, lng: asset.longitude },
          map: map,
          icon: {
            path: g.SymbolPath.CIRCLE,
            scale: 6,
            fillColor: pinColor,
            fillOpacity: 0.9,
            strokeColor: '#ffffff',
            strokeWeight: 1.5
          }
        });

        marker.addListener('click', () => {
          setSelectedAsset(asset);
          infoWindowRef.current.setContent(`
            <div style="color: #0f172a; font-family: monospace; font-size: 11px; padding: 4px;">
              <strong>${asset.name}</strong><br/>
              <b>Type:</b> ${asset.type} | <b>Risk:</b> ${asset.risk_category} (${asset.risk_score})<br/>
              <b>Dist from Landfall:</b> ${asset.distance_from_landfall_km} km<br/>
              <b>Wind:</b> ${asset.wind_exposure_kmh} km/h
            </div>
          `);
          infoWindowRef.current.open(map, marker);
        });

        overlaysRef.current.push(marker);
      });
    }

  }, [cycloneDetail, infrastructure, layers]);

  // Handle Animated Cyclone Eye Marker
  useEffect(() => {
    if (!mapInstanceRef.current || !(window as any).google?.maps) return;
    const g = (window as any).google.maps;
    const map = mapInstanceRef.current;

    const pt = currentFramePoint || (cycloneDetail?.observed_track ? cycloneDetail.observed_track[cycloneDetail.observed_track.length - 1] : null);
    if (!pt) return;

    if (currentEyeMarkerRef.current) {
      currentEyeMarkerRef.current.setMap(null);
    }

    const eyeMarker = new g.Marker({
      position: { lat: pt.latitude, lng: pt.longitude },
      map: map,
      icon: {
        path: 'M -10,0 A 10,10 0 1,0 10,0 A 10,10 0 1,0 -10,0',
        fillColor: '#06b6d4',
        fillOpacity: 0.9,
        strokeColor: '#ffffff',
        strokeWeight: 2.5,
        scale: 1.4
      },
      title: `CYCLONE POSITION: ${pt.wind_speed} km/h`
    });

    currentEyeMarkerRef.current = eyeMarker;

    if (isPlaying) {
      map.panTo({ lat: pt.latitude, lng: pt.longitude });
    }
  }, [currentFramePoint, isPlaying, cycloneDetail]);

  // Controls
  const handleZoomIn = () => mapInstanceRef.current?.setZoom((mapInstanceRef.current.getZoom() || 7) + 1);
  const handleZoomOut = () => mapInstanceRef.current?.setZoom((mapInstanceRef.current.getZoom() || 7) - 1);
  
  const handleFitCyclonePath = () => {
    if (!mapInstanceRef.current || !cycloneDetail || !(window as any).google?.maps) return;
    const g = (window as any).google.maps;
    const bounds = new g.LatLngBounds();
    const all = [...cycloneDetail.observed_track, ...cycloneDetail.forecast_track];
    all.forEach(p => bounds.extend({ lat: p.latitude, lng: p.longitude }));
    if (cycloneDetail.landfall) {
      bounds.extend({ lat: cycloneDetail.landfall.latitude, lng: cycloneDetail.landfall.longitude });
    }
    mapInstanceRef.current.fitBounds(bounds);
  };

  const handleLocateCyclone = () => {
    const pt = currentFramePoint || (cycloneDetail?.observed_track ? cycloneDetail.observed_track[cycloneDetail.observed_track.length - 1] : null);
    if (pt && mapInstanceRef.current) {
      mapInstanceRef.current.panTo({ lat: pt.latitude, lng: pt.longitude });
      mapInstanceRef.current.setZoom(8);
    }
  };

  const handleShowLandfall = () => {
    if (cycloneDetail?.landfall && mapInstanceRef.current) {
      mapInstanceRef.current.panTo({ lat: cycloneDetail.landfall.latitude, lng: cycloneDetail.landfall.longitude });
      mapInstanceRef.current.setZoom(9);
    }
  };

  if (loadError) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center p-8 text-center bg-command-surface border border-command-border rounded-lg space-y-3">
        <div className="text-amber-400 font-mono text-sm font-semibold">{loadError}</div>
        <p className="text-xs text-slate-400 max-w-md">
          To enable Google Maps, add your restricted key to <code className="text-cyan-400">frontend/.env.local</code> as <code className="text-cyan-400">VITE_GOOGLE_MAPS_API_KEY</code>.
        </p>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full min-h-[520px] rounded-lg overflow-hidden border border-command-border shadow-2xl bg-command-surface">
      <div ref={mapContainerRef} className="w-full h-full" />
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
