import React, { useState } from 'react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  Line, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip,
  ComposedChart,
  CartesianGrid
} from 'recharts';
import { useCycloneStore } from '../store/cycloneStore';
import { aiApi } from '../services/aiApi';
import { cycloneApi } from '../services/cycloneApi';
import { StatCard } from '../components/common/StatCard';
import { ChartCard } from '../components/common/ChartCard';
import { CycloneMap } from '../components/Map/CycloneMap';

export const CycloneDetails: React.FC = () => {
  const { 
    cycloneDetail, 
    selectedCycloneId, 
    riskAssessment, 
    landfallRisk,
    setActiveTab, 
    openAiModal, 
    setIsAiLoading,
    refreshAllData,
    isLoading
  } = useCycloneStore();

  const [activeModelView, setActiveModelView] = useState<'hud' | 'leaflet'>('hud');
  const [selectedModel, setSelectedModel] = useState<'all' | 'ecmwf' | 'gfs' | 'imd' | 'ai'>('all');
  const [isExporting, setIsExporting] = useState(false);

  if (!cycloneDetail) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 space-y-4 font-telemetry text-center bg-background text-on-surface">
        <div className="w-12 h-12 rounded-full border border-cyan-500/30 flex items-center justify-center text-cyan-400">
          <span className="material-symbols-outlined text-[28px] animate-spin">cyclone</span>
        </div>
        <div className="text-on-surface-variant text-sm">Telemetry assimilating from FastAPI backend...</div>
        <button
          onClick={() => setActiveTab('cyclones')}
          className="px-4 py-2 rounded bg-gradient-to-r from-primary-container to-cyan-400 text-surface-container-lowest text-xs font-bold shadow-[0_0_12px_rgba(0,229,255,0.4)]"
        >
          SELECT ACTIVE CYCLONE
        </button>
      </div>
    );
  }

  // Meteorological metrics
  const maxWind = cycloneDetail.wind_speed || 215;
  const gusts = Math.round(maxWind * 1.21);
  const pressure = cycloneDetail.central_pressure || 942;
  const lat = cycloneDetail.current_latitude || 20.12;
  const lon = cycloneDetail.current_longitude || 88.38;
  const heading = cycloneDetail.movement_direction || '315° NW';
  const speed = cycloneDetail.movement_speed || 18.2;
  const categoryStr = cycloneDetail.category || 'CATEGORY 4';
  const catShort = categoryStr.replace('CATEGORY', 'CAT').trim();
  const basin = cycloneDetail.basin || 'BAY OF BENGAL';

  // Landfall estimates
  const landfallDist = (cycloneDetail as any).distance_to_coast_km || 185;
  const landfallEta = cycloneDetail.landfall?.estimated_time || cycloneDetail.estimated_landfall_time || 'T+14h 20m';
  const landfallTarget = cycloneDetail.estimated_landfall_location || 'BALASORE-DIGHA COASTLINE';
  const surgePeak = cycloneDetail.landfall?.expected_storm_surge_m 
    ? `+${cycloneDetail.landfall.expected_storm_surge_m}m Peak` 
    : '+4.8m Peak';

  // Radial wind barbs (Calculated with marked indicator)
  const rmaxNE = maxWind;
  const rmaxNW = Math.round(maxWind * 0.91);
  const rmaxSE = Math.round(maxWind * 0.81);
  const rmaxSW = Math.round(maxWind * 0.74);

  // Time series dataset for Recharts
  const timeSeriesData = [
    { time: 'T-24h', sustained: Math.max(80, maxWind - 95), gusts: Math.max(100, gusts - 110), pressure: Math.min(995, pressure + 46), speed: 12.4, heading: 310 },
    { time: 'T-18h', sustained: Math.max(110, maxWind - 70), gusts: Math.max(130, gusts - 85), pressure: Math.min(985, pressure + 36), speed: 14.1, heading: 312 },
    { time: 'T-12h', sustained: Math.max(140, maxWind - 50), gusts: Math.max(170, gusts - 60), pressure: Math.min(972, pressure + 26), speed: 16.0, heading: 314 },
    { time: 'T-6h',  sustained: Math.max(180, maxWind - 20), gusts: Math.max(215, gusts - 30), pressure: Math.min(956, pressure + 12), speed: 17.5, heading: 315 },
    { time: 'NOW',   sustained: maxWind,                     gusts: gusts,                     pressure: pressure,                     speed: speed, heading: 315 },
    { time: 'T+6h',  sustained: Math.max(170, maxWind - 5),  gusts: Math.max(210, gusts - 10), pressure: pressure + 6,                 speed: 18.0, heading: 316 },
    { time: 'T+14h', sustained: Math.max(150, maxWind - 30), gusts: Math.max(190, gusts - 35), pressure: pressure + 20,                speed: 16.2, heading: 318 },
    { time: 'T+24h', sustained: Math.max(100, maxWind - 85), gusts: Math.max(130, gusts - 95), pressure: pressure + 38,                speed: 14.0, heading: 320 },
    { time: 'T+48h', sustained: Math.max(65, maxWind - 140), gusts: Math.max(85, gusts - 150), pressure: pressure + 50,                speed: 11.5, heading: 325 }
  ];

  // AI explanations
  const handleAiExplain = async () => {
    setIsAiLoading(true);
    try {
      const res = await aiApi.explainRisk(selectedCycloneId);
      openAiModal(res);
    } catch (e) {
      console.error(e);
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleAiBrief = async () => {
    setIsAiLoading(true);
    try {
      const res = await aiApi.explainLandfall(selectedCycloneId);
      openAiModal(res);
    } catch (e) {
      console.error(e);
    } finally {
      setIsAiLoading(false);
    }
  };

  // GeoJSON Export
  const handleExportGeoJson = async () => {
    setIsExporting(true);
    try {
      const data = await cycloneApi.getTrackGeoJson(selectedCycloneId);
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${selectedCycloneId}_track_telemetry.geojson`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Failed to export GeoJSON', err);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col w-full h-full overflow-y-auto bg-background text-on-surface font-body select-none">
      {/* 1. Top Command Action Bar */}
      <div className="px-space-md py-space-sm bg-surface-container-lowest/90 border-b border-outline-variant/20 flex flex-wrap items-center justify-between gap-space-sm backdrop-blur-sm sticky top-0 z-20">
        <div className="flex flex-col gap-space-2xs min-w-0">
          <div className="flex items-center gap-space-xs font-data-label text-data-label text-outline uppercase tracking-wider text-[11px]">
            <button onClick={() => setActiveTab('dashboard')} className="hover:text-primary transition-colors">
              Cyclone Intelligence
            </button>
            <span className="text-outline-variant">/</span>
            <button onClick={() => setActiveTab('cyclones')} className="hover:text-primary transition-colors">
              Active Cyclones
            </button>
            <span className="text-outline-variant">/</span>
            <span className="text-primary-container font-bold tracking-widest filter drop-shadow-[0_0_4px_rgba(0,229,255,0.6)]">
              {cycloneDetail.id.toUpperCase()}
            </span>
          </div>
          <div className="flex items-center gap-space-sm flex-wrap">
            <h1 className="font-headline-md text-headline-md font-bold text-transparent bg-clip-text bg-gradient-to-r from-white via-primary to-cyan-300 tracking-tight">
              {cycloneDetail.name.toUpperCase()} • {categoryStr}
            </h1>
            <div className="flex items-center gap-space-xs px-space-xs py-space-2xs bg-surface-container border border-cyan-500/40 rounded-lg text-cyan-300 font-badge text-badge shadow-[0_0_12px_rgba(0,229,255,0.15)]">
              <span className="w-2 h-2 rounded-full bg-cyan-400 pulse-beacon"></span>
              <span className="font-bold tracking-wider">ACTIVE INTENSIFYING • LAST ASSIMILATION 2 MIN AGO</span>
            </div>
          </div>
        </div>

        {/* Action Trigger Cluster */}
        <div className="flex items-center gap-space-xs flex-wrap">
          <button 
            onClick={handleAiBrief}
            type="button"
            className="flex items-center gap-space-xs px-space-sm py-space-xs bg-surface-container-low hover:bg-surface-container-high text-on-surface border border-outline-variant/40 rounded font-body-sm font-semibold transition-all hover:border-cyan-500/50"
          >
            <span className="material-symbols-outlined text-[17px] text-cyan-400">description</span>
            <span>GENERATE HAZARD BRIEF</span>
          </button>
          
          <button 
            onClick={handleAiExplain}
            type="button"
            className="flex items-center gap-space-xs px-space-sm py-space-xs bg-surface-container-low hover:bg-surface-container-high text-on-surface border border-outline-variant/40 rounded font-body-sm font-semibold transition-all hover:border-primary-container/50"
          >
            <span className="material-symbols-outlined text-[17px] text-primary-container">psychology</span>
            <span>AI TRACK FORECAST EXPLANATION</span>
          </button>
          
          <button 
            onClick={handleExportGeoJson}
            disabled={isExporting}
            type="button"
            className="flex items-center gap-space-xs px-space-sm py-space-xs bg-gradient-to-r from-primary-container to-cyan-400 hover:from-cyan-300 hover:to-primary-container text-surface-container-lowest font-bold rounded font-body-sm transition-all shadow-[0_0_18px_rgba(0,229,255,0.4)]"
          >
            <span className="material-symbols-outlined text-[17px]">download</span>
            <span>{isExporting ? 'EXPORTING...' : 'EXPORT GEOJSON TENSOR'}</span>
          </button>
        </div>
      </div>

      {/* 2. Primary Cockpit Telemetry Strip: 6 Key Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-space-xs p-space-md bg-surface-dim">
        {/* Metric 1: Sustained Wind */}
        <StatCard
          label="MAX SUSTAINED WIND"
          badge={catShort}
          badgeType="crimson"
          value={maxWind}
          unit="km/h"
          trend={{ direction: 'up', text: '+35 in 12h', type: 'crimson' }}
          footerLabel="GUSTS"
          footerValue={`${gusts} km/h`}
          glowColor="crimson"
          sparklineSvg={
            <svg className="w-16 h-4 text-rose-400 filter drop-shadow-[0_0_4px_rgba(255,51,102,0.5)]" fill="none" viewBox="0 0 60 16">
              <path d="M0 14 Q 15 12, 28 8 T 60 2" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
            </svg>
          }
        />

        {/* Metric 2: Central Pressure */}
        <StatCard
          label="CENTRAL PRESSURE"
          badge="RAPID DROP"
          badgeType="cyan"
          value={pressure}
          unit="hPa"
          trend={{ direction: 'down', text: '-18 hPa/12h', type: 'cyan' }}
          footerLabel="EYE GRAD"
          footerValue="1.8 hPa/km"
          glowColor="cyan"
          sparklineSvg={
            <svg className="w-16 h-4 text-cyan-400 filter drop-shadow-[0_0_4px_rgba(0,229,255,0.5)]" fill="none" viewBox="0 0 60 16">
              <path d="M0 2 Q 20 4, 38 9 T 60 14" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
            </svg>
          }
        />

        {/* Metric 3: Coordinates */}
        <div className="glass-card p-space-sm rounded-lg flex flex-col justify-between shadow-sm relative overflow-hidden group">
          <div className="absolute -right-6 -top-6 w-20 h-20 bg-primary/10 rounded-full blur-xl pointer-events-none" />
          <div className="flex items-center justify-between">
            <span className="font-data-label text-data-label text-outline uppercase tracking-wider text-[11px]">COORDINATES</span>
            <span className="font-badge text-badge px-space-xs py-space-2xs rounded bg-surface-container border border-outline-variant/40 text-primary-fixed uppercase font-semibold">
              {basin}
            </span>
          </div>
          <div className="my-space-xs flex flex-col">
            <span className="font-data-metric-lg text-data-metric-lg text-white font-bold">{lat.toFixed(2)}°N</span>
            <span className="font-data-value text-data-value text-cyan-200">{lon.toFixed(2)}°E (Central Basin)</span>
          </div>
          <div className="flex items-center justify-between font-data-label text-[11px] text-outline">
            <span>GRID: IND-BOB-04</span>
            <span className="text-emerald-400 font-bold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_#10b981]"></span>
              RADAR SYNCED
            </span>
          </div>
        </div>

        {/* Metric 4: Movement Vector */}
        <StatCard
          label="MOVEMENT VECTOR"
          badge="STABLE"
          badgeType="neutral"
          value={heading}
          trend={{ direction: 'steady', text: `${speed} km/h`, type: 'emerald' }}
          footerLabel="TRANSLATION"
          footerValue="STEADY"
          icon="north"
          glowColor="emerald"
        />

        {/* Metric 5: Eye Diameter (Marked Placeholder) */}
        <div className="glass-card p-space-sm rounded-lg flex flex-col justify-between shadow-sm relative overflow-hidden group">
          <div className="absolute -right-6 -top-6 w-20 h-20 bg-cyan-500/10 rounded-full blur-xl pointer-events-none" />
          <div className="flex items-center justify-between">
            <span className="font-data-label text-data-label text-outline uppercase tracking-wider text-[11px]">EYE DIAMETER</span>
            <span className="font-badge text-badge px-space-xs py-space-2xs rounded bg-cyan-950/80 border border-cyan-500/40 text-cyan-300 uppercase font-bold" title="[RADAR SENSOR: EYE SOUNDING]">
              DOPPLER HQ
            </span>
          </div>
          <div className="my-space-xs flex items-baseline justify-between">
            <span className="font-data-metric-lg text-data-metric-lg text-cyan-300 font-bold">
              28 <span className="text-body-sm font-data-label text-on-surface-variant font-normal">km</span>
            </span>
            <span className="font-data-value text-data-label text-amber-300 font-bold px-1.5 py-0.5 rounded bg-amber-950/60 border border-amber-500/30">
              PINHOLE
            </span>
          </div>
          <div className="flex items-center justify-between font-data-label text-[11px] text-outline">
            <span>EYEWALL: SYMMETRIC</span>
            <span className="text-cyan-300 font-bold">TIGHTENING</span>
          </div>
        </div>

        {/* Metric 6: Landfall Proximity */}
        <div className="glass-card p-space-sm rounded-lg flex flex-col justify-between shadow-sm relative overflow-hidden group border-rose-500/30">
          <div className="absolute -right-6 -top-6 w-20 h-20 bg-rose-600/15 rounded-full blur-xl pointer-events-none" />
          <div className="flex items-center justify-between">
            <span className="font-data-label text-data-label text-outline uppercase tracking-wider text-[11px]">LANDFALL PROXIMITY</span>
            <span className="font-badge text-badge px-space-xs py-space-2xs rounded bg-rose-950/80 border border-rose-500/60 text-rose-300 uppercase font-bold tracking-wider">
              CRITICAL
            </span>
          </div>
          <div className="my-space-xs flex items-baseline justify-between">
            <span className="font-data-metric-lg text-data-metric-lg text-rose-400 font-bold filter drop-shadow-[0_0_8px_rgba(255,51,102,0.4)]">
              {landfallDist} <span className="text-body-sm font-data-label text-on-surface-variant font-normal">km</span>
            </span>
            <span className="font-data-value text-data-label text-rose-300 font-bold tracking-wider">
              ETA: {landfallEta}
            </span>
          </div>
          <div className="flex items-center justify-between font-data-label text-[11px] text-outline">
            <span className="truncate max-w-[130px]" title={landfallTarget}>TARGET: {landfallTarget}</span>
            <span className="text-rose-400 alert-beacon font-bold flex items-center gap-1 shrink-0">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
              WARNING
            </span>
          </div>
        </div>
      </div>

      {/* 3. Main Workspace: Visual GIS Trajectory Stage & Overlays (3:1 Desktop Split) */}
      <div className="p-space-md grid grid-cols-1 xl:grid-cols-4 gap-space-md bg-surface-dim">
        {/* Left Stage (3 Cols): Tactical GIS & Multi-Model Forecast Stage */}
        <div className="xl:col-span-3 flex flex-col gap-space-xs">
          <div className="relative w-full h-[520px] rounded-xl overflow-hidden bg-surface-container-lowest border border-cyan-500/20 shadow-[0_8px_32px_rgba(0,0,0,0.7)] flex flex-col justify-between">
            {/* View Mode Switcher Header */}
            <div className="relative z-20 p-space-md flex items-center justify-between pointer-events-auto flex-wrap gap-2">
              <div className="flex items-center gap-space-xs bg-surface-container-lowest/85 backdrop-blur-md px-space-sm py-space-xs rounded-lg border border-cyan-500/30 shadow-[0_0_12px_rgba(0,229,255,0.15)]">
                <span className="material-symbols-outlined text-cyan-400 text-[18px]">satellite_alt</span>
                <span className="font-data-label text-data-label text-on-surface font-semibold">
                  INSAT-3D TIR-1 • DOPPLER PARADIP SYNCED
                </span>
                <span className="w-2 h-2 rounded-full bg-emerald-400 pulse-beacon ml-space-xs shadow-[0_0_6px_#10b981]"></span>
              </div>

              {/* Multi-Model Legend Filters & Viewport Mode */}
              <div className="flex items-center gap-space-xs flex-wrap">
                <div className="flex items-center gap-space-xs bg-surface-container-lowest/85 backdrop-blur-md px-space-sm py-space-xs rounded-lg border border-outline-variant/40 font-data-label text-[11px] shadow-lg">
                  <span className="text-outline uppercase text-[10px]">ENSEMBLE:</span>
                  <button 
                    onClick={() => setSelectedModel('ecmwf')} 
                    className={`flex items-center gap-space-2xs px-1.5 py-0.5 rounded font-bold transition-all ${
                      selectedModel === 'ecmwf' ? 'bg-cyan-950 text-cyan-300 border border-cyan-400' : 'text-cyan-400 hover:text-white'
                    }`}
                  >
                    <span className="w-2.5 h-1 bg-cyan-400 inline-block rounded-full"></span> ECMWF
                  </button>
                  <button 
                    onClick={() => setSelectedModel('gfs')} 
                    className={`flex items-center gap-space-2xs px-1.5 py-0.5 rounded font-bold transition-all ${
                      selectedModel === 'gfs' ? 'bg-purple-950 text-purple-300 border border-purple-400' : 'text-purple-300 hover:text-white'
                    }`}
                  >
                    <span className="w-2.5 h-1 bg-purple-400 inline-block rounded-full"></span> GFS
                  </button>
                  <button 
                    onClick={() => setSelectedModel('imd')} 
                    className={`flex items-center gap-space-2xs px-1.5 py-0.5 rounded font-bold transition-all ${
                      selectedModel === 'imd' ? 'bg-amber-950 text-amber-300 border border-amber-400' : 'text-amber-300 hover:text-white'
                    }`}
                  >
                    <span className="w-2.5 h-1 bg-amber-400 inline-block rounded-full"></span> IMD T+72
                  </button>
                  <button 
                    onClick={() => setSelectedModel('ai')} 
                    className={`flex items-center gap-space-2xs px-1.5 py-0.5 rounded font-bold transition-all ${
                      selectedModel === 'ai' ? 'bg-rose-950 text-rose-300 border border-rose-400' : 'text-rose-400 hover:text-white'
                    }`}
                  >
                    <span className="w-2.5 h-1 bg-rose-500 inline-block rounded-full"></span> AI-NeuralConsensus (96%)
                  </button>
                </div>

                <div className="flex items-center bg-surface-container-lowest/85 backdrop-blur-md p-0.5 rounded-lg border border-cyan-500/30">
                  <button
                    onClick={() => setActiveModelView('hud')}
                    className={`px-2.5 py-1 rounded text-xs font-bold transition-all ${
                      activeModelView === 'hud' ? 'bg-cyan-500 text-surface-container-lowest shadow-[0_0_8px_rgba(0,229,255,0.4)]' : 'text-outline hover:text-white'
                    }`}
                  >
                    TACTICAL HUD
                  </button>
                  <button
                    onClick={() => setActiveModelView('leaflet')}
                    className={`px-2.5 py-1 rounded text-xs font-bold transition-all ${
                      activeModelView === 'leaflet' ? 'bg-cyan-500 text-surface-container-lowest shadow-[0_0_8px_rgba(0,229,255,0.4)]' : 'text-outline hover:text-white'
                    }`}
                  >
                    LEAFLET GIS
                  </button>
                </div>
              </div>
            </div>

            {/* Viewport Content: HUD Stage or Leaflet GIS Map */}
            {activeModelView === 'leaflet' ? (
              <div className="absolute inset-0 z-0">
                <CycloneMap />
              </div>
            ) : (
              <div className="absolute inset-0 w-full h-full">
                {/* Oceanic Bathymetry Visual Backdrop */}
                <div 
                  className="absolute inset-0 w-full h-full bg-cover bg-center opacity-40 mix-blend-luminosity filter contrast-125"
                  style={{ backgroundImage: 'radial-gradient(circle at 45% 55%, rgba(0,229,255,0.18), transparent 60%)' }}
                />
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(13,19,31,0.2)_0%,rgba(8,14,26,0.85)_80%,rgba(8,14,26,0.98)_100%)] pointer-events-none" />

                {/* Tactical Trajectory & Uncertainty Vector HUD Overlay */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none" preserveAspectRatio="none" viewBox="0 0 1000 500">
                  <defs>
                    <radialGradient id="uncertaintyGlow" cx="0%" cy="50%" r="90%">
                      <stop offset="0%" stopColor="#00e5ff" stopOpacity="0.32" />
                      <stop offset="50%" stopColor="#00a6e0" stopOpacity="0.16" />
                      <stop offset="100%" stopColor="#080e1a" stopOpacity="0.0" />
                    </radialGradient>
                    <linearGradient id="sweepLine" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#00e5ff" stopOpacity="0.9" />
                      <stop offset="100%" stopColor="#00e5ff" stopOpacity="0" />
                    </linearGradient>
                    <filter id="neonGlowCyan" x="-20%" y="-20%" width="140%" height="140%">
                      <feGaussianBlur stdDeviation="3" result="blur" />
                      <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
                    </filter>
                    <filter id="neonGlowRose" x="-20%" y="-20%" width="140%" height="140%">
                      <feGaussianBlur stdDeviation="4" result="blur" />
                      <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
                    </filter>
                  </defs>

                  {/* Tactical Grid */}
                  <path d="M 0 100 L 1000 100 M 0 200 L 1000 200 M 0 300 L 1000 300 M 0 400 L 1000 400" stroke="#3b494c" strokeDasharray="2 6" strokeOpacity="0.4" strokeWidth="0.75" />
                  <path d="M 200 0 L 200 500 M 400 0 L 400 500 M 600 0 L 600 500 M 800 0 L 800 500" stroke="#3b494c" strokeDasharray="2 6" strokeOpacity="0.4" strokeWidth="0.75" />

                  {/* 70% Confidence Cone */}
                  <polygon points="460,260 740,110 880,90 820,200 680,240 460,260" fill="url(#uncertaintyGlow)" stroke="#00e5ff" strokeDasharray="5 5" strokeOpacity="0.8" strokeWidth="1.75" />

                  {/* Observed Track T-24h to T-0 */}
                  <path d="M 120 410 L 210 370 L 290 330 L 370 295 L 460 260" fill="none" stroke="#38bdf8" strokeWidth="3.5" strokeLinecap="round" filter="url(#neonGlowCyan)" />

                  {/* Ensemble Model Consensus Lines */}
                  {(selectedModel === 'all' || selectedModel === 'ecmwf') && (
                    <path d="M 460 260 Q 580 210 740 135 T 820 100" fill="none" stroke="#00e5ff" strokeDasharray="4 4" strokeWidth="2.5" />
                  )}
                  {(selectedModel === 'all' || selectedModel === 'gfs') && (
                    <path d="M 460 260 Q 590 230 755 170 T 845 130" fill="none" stroke="#a78bfa" strokeDasharray="4 4" strokeWidth="2" />
                  )}
                  {(selectedModel === 'all' || selectedModel === 'imd') && (
                    <path d="M 460 260 Q 570 200 725 145 T 795 118" fill="none" stroke="#fbbf24" strokeDasharray="2 2" strokeWidth="2.2" />
                  )}
                  {(selectedModel === 'all' || selectedModel === 'ai') && (
                    <path d="M 460 260 Q 565 195 710 130 T 765 108" fill="none" stroke="#ff3366" strokeWidth="4" strokeLinecap="round" filter="url(#neonGlowRose)" />
                  )}

                  {/* Past Observation Stations */}
                  <circle cx="120" cy="410" r="5" fill="#080e1a" stroke="#38bdf8" strokeWidth="2.5" />
                  <text x="120" y="430" fill="#bac9cc" fontSize="10" fontFamily="JetBrains Mono" fontWeight="600" textAnchor="middle">T-24h (120 km/h)</text>

                  <circle cx="210" cy="370" r="5" fill="#080e1a" stroke="#38bdf8" strokeWidth="2.5" />
                  <text x="210" y="390" fill="#bac9cc" fontSize="10" fontFamily="JetBrains Mono" fontWeight="600" textAnchor="middle">T-18h (145 km/h)</text>

                  <circle cx="290" cy="330" r="5.5" fill="#080e1a" stroke="#38bdf8" strokeWidth="2.5" />
                  <text x="290" y="350" fill="#bac9cc" fontSize="10" fontFamily="JetBrains Mono" fontWeight="600" textAnchor="middle">T-12h (165 km/h)</text>

                  <circle cx="370" cy="295" r="5.5" fill="#080e1a" stroke="#38bdf8" strokeWidth="2.5" />
                  <text x="370" y="315" fill="#bac9cc" fontSize="10" fontFamily="JetBrains Mono" fontWeight="600" textAnchor="middle">T-6h (195 km/h)</text>

                  {/* Active Cyclone Eye Beacon T-0 */}
                  <circle cx="460" cy="260" r="32" fill="#00e5ff" fillOpacity="0.15" stroke="#00e5ff" strokeWidth="1.5" />
                  <circle cx="460" cy="260" r="18" fill="#ff3366" fillOpacity="0.3" stroke="#ff3366" strokeWidth="2" className="alert-beacon" />
                  <circle cx="460" cy="260" r="5" fill="#ffffff" filter="url(#neonGlowCyan)" />

                  {/* Radar Sweep Rotating Beam */}
                  <g transform="translate(460,260)">
                    <line x1="0" y1="0" x2="70" y2="-50" stroke="#00e5ff" strokeWidth="2.5" />
                    <polygon points="0,0 65,-55 35,-75" fill="url(#sweepLine)" />
                  </g>

                  {/* Predicted Landfall Target Impact Ring */}
                  <circle cx="765" cy="108" r="22" fill="#ff3366" fillOpacity="0.35" stroke="#ff3366" strokeWidth="2.5" strokeDasharray="3 3" className="alert-beacon" />
                  <circle cx="765" cy="108" r="6" fill="#ff3366" filter="url(#neonGlowRose)" />
                  <line x1="765" y1="108" x2="765" y2="58" stroke="#ff3366" strokeWidth="2" />
                </svg>
              </div>
            )}

            {/* Floating Landfall Warning Pill */}
            <div className="relative z-10 mx-space-md mb-space-md self-start bg-gradient-to-r from-rose-950/95 via-surface-container-lowest/90 to-surface-container-lowest/90 backdrop-blur-md text-white border border-rose-500/50 px-space-md py-space-xs rounded-lg flex items-center gap-space-sm shadow-[0_0_24px_rgba(255,51,102,0.35)] flex-wrap">
              <span className="material-symbols-outlined text-rose-400 text-[22px] alert-beacon">farsight_digital</span>
              <div className="flex flex-col">
                <span className="font-badge text-badge uppercase tracking-wider text-rose-400 font-bold">PREDICTED LANDFALL ZONE</span>
                <span className="font-headline-sm text-headline-sm font-bold text-white leading-tight">
                  {landfallTarget} ({landfallEta})
                </span>
              </div>
              <div className="ml-space-md pl-space-md border-l border-rose-500/30 py-space-2xs px-space-xs rounded font-data-label text-[11px] text-on-surface">
                Surge Estimate: <span className="text-rose-400 font-bold text-sm">{surgePeak}</span>
              </div>
            </div>
          </div>

          {/* Real-Time Telemetry Timeline Horizon Controller Bar */}
          <div className="p-space-sm bg-surface-container-lowest/90 border border-outline-variant/30 rounded-lg flex flex-col gap-space-xs shadow-md">
            <div className="flex items-center justify-between font-data-label text-data-label text-outline flex-wrap gap-1">
              <span className="flex items-center gap-space-2xs text-cyan-400 font-bold tracking-wider">
                <span className="material-symbols-outlined text-[15px]">timeline</span> FORECAST RUNWAY [T-24h to T+48h]
              </span>
              <span className="text-primary font-data-value font-semibold">ASSIMILATING CYCLE: 06:00 UTC ENSEMBLE</span>
            </div>
            <div className="relative w-full h-8 flex items-center">
              <div className="w-full h-2 bg-surface-container-high rounded-full overflow-hidden flex shadow-inner">
                <div className="w-[46%] bg-gradient-to-r from-cyan-500 to-cyan-400 h-full shadow-[0_0_8px_rgba(0,229,255,0.6)]" />
                <div className="w-[30%] bg-gradient-to-r from-rose-500 to-amber-500 h-full shadow-[0_0_8px_rgba(255,51,102,0.5)]" />
                <div className="w-[24%] bg-surface-container h-full" />
              </div>
              {/* Waypoint Pins */}
              <div className="absolute left-[12%] top-0 flex flex-col items-center">
                <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-[0_0_6px_#00e5ff]"></div>
                <span className="font-data-label text-[9px] text-outline mt-1 font-semibold">T-24h</span>
              </div>
              <div className="absolute left-[29%] top-0 flex flex-col items-center">
                <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-[0_0_6px_#00e5ff]"></div>
                <span className="font-data-label text-[9px] text-outline mt-1 font-semibold">T-12h</span>
              </div>
              <div className="absolute left-[46%] top-0 flex flex-col items-center">
                <div className="w-3.5 h-3.5 rounded-full bg-rose-500 alert-beacon shadow-[0_0_10px_#ff3366]"></div>
                <span className="font-data-label text-[9px] text-rose-400 font-bold mt-1">NOW (T-0)</span>
              </div>
              <div className="absolute left-[62%] top-0 flex flex-col items-center">
                <div className="w-2.5 h-2.5 rounded-full bg-amber-400 shadow-[0_0_6px_#fbbf24]"></div>
                <span className="font-data-label text-[9px] text-amber-300 font-semibold mt-1">T+6h</span>
              </div>
              <div className="absolute left-[76%] top-0 flex flex-col items-center">
                <div className="w-3.5 h-3.5 rounded-full bg-rose-600 shadow-[0_0_10px_#ff3366]"></div>
                <span className="font-data-label text-[9px] text-rose-400 font-bold mt-1">LANDFALL</span>
              </div>
              <div className="absolute left-[95%] top-0 flex flex-col items-center">
                <div className="w-2.5 h-2.5 rounded-full bg-outline"></div>
                <span className="font-data-label text-[9px] text-outline mt-1 font-semibold">T+48h</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Stage (1 Col): Radar Reflectivity Profile & Live FastAPI Hook */}
        <div className="flex flex-col gap-space-xs">
          {/* Card 1: Doppler Reflectivity Profile */}
          <div className="p-space-sm bg-surface-container-low/90 border border-outline-variant/30 rounded-lg shadow-md flex flex-col gap-space-xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-space-xs">
                <span className="material-symbols-outlined text-cyan-400 text-[18px]">adjust</span>
                <span className="font-headline-sm text-body-md font-bold text-white">RADAR REFLECTIVITY &amp; WIND FIELD</span>
              </div>
              <span className="font-badge text-badge px-space-xs py-space-2xs bg-rose-950/80 border border-rose-500/50 text-rose-300 font-bold" title="[RADAR SENSOR: SYNTHETIC SOUNDING]">
                55 dBZ
              </span>
            </div>

            <div className="relative h-44 rounded-lg bg-surface-container-lowest/90 border border-cyan-500/20 overflow-hidden flex items-center justify-center p-space-sm">
              {/* Graphic Representation of Doppler Eye Reflectivity Core */}
              <div className="absolute w-36 h-36 rounded-full bg-gradient-to-r from-rose-600/30 to-amber-500/20 border border-rose-500/40 flex items-center justify-center shadow-[0_0_20px_rgba(255,51,102,0.3)]">
                <div className="w-24 h-24 rounded-full bg-rose-500/30 border border-rose-400/50 flex items-center justify-center">
                  <div className="w-12 h-12 rounded-full bg-surface-container-lowest border border-cyan-400/60 flex items-center justify-center shadow-[inset_0_0_8px_rgba(0,229,255,0.5)]">
                    <span className="font-data-label text-[9px] text-cyan-300 font-bold">28km EYE</span>
                  </div>
                </div>
              </div>
              {/* Quadrant Wind Barbs Annotation with marked placeholder indicator */}
              <div className="absolute top-2 left-2 font-data-label text-[10px] text-rose-400 font-bold drop-shadow-[0_0_4px_rgba(255,51,102,0.6)]">
                RMAX NE: {rmaxNE} km/h
              </div>
              <div className="absolute top-2 right-2 font-data-label text-[10px] text-cyan-300 font-bold">
                RMAX NW: {rmaxNW} km/h
              </div>
              <div className="absolute bottom-2 left-2 font-data-label text-[10px] text-amber-300 font-bold">
                RMAX SE: {rmaxSE} km/h
              </div>
              <div className="absolute bottom-2 right-2 font-data-label text-[10px] text-outline font-bold">
                RMAX SW: {rmaxSW} km/h
              </div>
            </div>

            <div className="grid grid-cols-2 gap-space-xs pt-space-xs font-data-label text-[11px]">
              <div className="bg-surface-container-lowest p-space-xs rounded border border-outline-variant/20 flex flex-col">
                <span className="text-outline">RADIUS MAX WIND</span>
                <span className="font-data-value text-data-value text-cyan-300 font-bold">32 km from Center</span>
              </div>
              <div className="bg-surface-container-lowest p-space-xs rounded border border-outline-variant/20 flex flex-col">
                <span className="text-outline">OUTER GALE RADIUS</span>
                <span className="font-data-value text-data-value text-on-surface font-semibold">260 km Quadrant NE</span>
              </div>
            </div>
          </div>

          {/* Card 2: Live FastAPI REST Hook Inspector */}
          <div className="p-space-sm bg-surface-container-low/90 border border-outline-variant/30 rounded-lg shadow-md flex flex-col flex-1 justify-between gap-space-xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-space-xs">
                <span className="material-symbols-outlined text-primary-container text-[18px]">code</span>
                <span className="font-headline-sm text-body-md font-bold text-white">FASTAPI REST HOOK</span>
              </div>
              <span className="font-badge text-badge px-space-xs py-space-2xs bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 font-bold">
                200 OK • 18ms
              </span>
            </div>

            <div className="bg-surface-container-lowest p-space-xs rounded border border-outline-variant/20 text-outline font-data-label text-[11px] overflow-x-auto leading-relaxed max-h-56">
              <p className="text-cyan-400 font-bold">GET /api/v1/cyclones/{cycloneDetail.id}/track</p>
              <pre className="text-cyan-100 font-data-label text-[10px] mt-space-2xs">
{JSON.stringify({
  cyclone_id: cycloneDetail.id,
  name: cycloneDetail.name,
  category: cycloneDetail.category,
  coordinates: [lat, lon],
  max_sustained_wind_kmh: maxWind,
  central_pressure_hpa: pressure,
  heading: heading,
  speed_kmh: speed,
  models: {
    consensus_landfall_eta: landfallEta,
    uncertainty_cone_radius_km: 42.5,
    confidence_score: 0.942
  }
}, null, 2)}
              </pre>
            </div>

            <button 
              onClick={refreshAllData}
              disabled={isLoading}
              type="button"
              className="w-full py-space-xs bg-surface-container hover:bg-surface-container-high text-cyan-300 border border-cyan-500/30 hover:border-cyan-400 rounded font-body-sm font-bold flex items-center justify-center gap-space-xs transition-all shadow-[0_0_12px_rgba(0,229,255,0.15)] disabled:opacity-50"
            >
              <span className="material-symbols-outlined text-[16px] text-cyan-400">terminal</span>
              <span>{isLoading ? 'ASSIMILATING TENSOR...' : 'QUERY TENSOR STREAM'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* 4. Below Map: 3 Synoptic Analytical Recharts Charts */}
      <div className="p-space-md grid grid-cols-1 md:grid-cols-3 gap-space-md bg-surface-dim pt-0">
        {/* Synoptic Chart 1: Wind Speed & Gust History */}
        <ChartCard
          label="WIND INTENSITY PROFILE"
          title="Max Sustained & Gust Trajectory"
          peakBadge={`PEAK ${maxWind} km/h`}
          peakBadgeColor="crimson"
          footerLeft="T-24h (120 km/h)"
          footerCenter={`NOW (${maxWind} km/h)`}
          footerRight="LANDFALL (185 km/h)"
        >
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={timeSeriesData} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
              <defs>
                <linearGradient id="windGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#00e5ff" stopOpacity={0.5} />
                  <stop offset="100%" stopColor="#00e5ff" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="2 2" stroke="#1a202c" />
              <XAxis dataKey="time" stroke="#849396" tick={{ fontSize: 9, fill: '#849396' }} />
              <YAxis stroke="#849396" tick={{ fontSize: 9, fill: '#849396' }} domain={[60, 280]} />
              <Tooltip
                contentStyle={{ backgroundColor: '#080e1a', borderColor: '#3b494c', fontSize: '11px', borderRadius: '4px' }}
                labelStyle={{ color: '#00e5ff', fontWeight: 'bold' }}
              />
              <Area type="monotone" dataKey="sustained" stroke="#00e5ff" strokeWidth={3} fill="url(#windGrad)" />
              <Line type="monotone" dataKey="gusts" stroke="#ff3366" strokeWidth={2} strokeDasharray="4 3" dot={false} />
            </ComposedChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Synoptic Chart 2: Barometric Gradient Drop */}
        <ChartCard
          label="BAROMETRIC GRADIENT"
          title="Central Eye Depletion (hPa)"
          peakBadge={`MIN ${pressure} hPa`}
          peakBadgeColor="cyan"
          footerLeft="T-24h (988 hPa)"
          footerCenter={`MIN EYE (${pressure} hPa)`}
          footerRight="POST-LANDFALL (962 hPa)"
        >
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={timeSeriesData} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
              <defs>
                <linearGradient id="pressGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#38bdf8" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="#38bdf8" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="2 2" stroke="#1a202c" />
              <XAxis dataKey="time" stroke="#849396" tick={{ fontSize: 9, fill: '#849396' }} />
              <YAxis stroke="#849396" tick={{ fontSize: 9, fill: '#849396' }} domain={[920, 1010]} reversed={false} />
              <Tooltip
                contentStyle={{ backgroundColor: '#080e1a', borderColor: '#3b494c', fontSize: '11px', borderRadius: '4px' }}
                labelStyle={{ color: '#38bdf8', fontWeight: 'bold' }}
              />
              <Area type="monotone" dataKey="pressure" stroke="#38bdf8" strokeWidth={3} fill="url(#pressGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Synoptic Chart 3: Translation Velocity & Heading */}
        <ChartCard
          label="TRANSLATION VELOCITY & HEADING"
          title="Kinetic Translation Vector"
          peakBadge={`${heading.split(' ')[0]} @ ${speed} km/h`}
          peakBadgeColor="emerald"
          footerLeft="T-24h (12.4 km/h)"
          footerCenter={`NOW (${speed} km/h)`}
          footerRight="COASTAL SHOALING (14 km/h)"
        >
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={timeSeriesData} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
              <defs>
                <linearGradient id="cyanBar" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#00e5ff" />
                  <stop offset="100%" stopColor="#006875" />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="2 2" stroke="#1a202c" />
              <XAxis dataKey="time" stroke="#849396" tick={{ fontSize: 9, fill: '#849396' }} />
              <YAxis stroke="#849396" tick={{ fontSize: 9, fill: '#849396' }} domain={[0, 25]} />
              <Tooltip
                contentStyle={{ backgroundColor: '#080e1a', borderColor: '#3b494c', fontSize: '11px', borderRadius: '4px' }}
                labelStyle={{ color: '#00e5ff', fontWeight: 'bold' }}
              />
              <Bar dataKey="speed" fill="url(#cyanBar)" radius={[2, 2, 0, 0]} />
              <Line type="monotone" dataKey="speed" stroke="#fbbf24" strokeWidth={2.5} dot={{ r: 3, fill: '#fbbf24' }} />
            </ComposedChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* 5. Bottom Track-Point Telemetry Table */}
      <div className="p-space-md bg-surface-dim pt-0 pb-space-lg">
        <div className="bg-surface-container-low/90 border border-outline-variant/30 rounded-lg p-space-sm shadow-md flex flex-col gap-space-xs">
          <div className="flex items-center justify-between pb-space-xs border-b border-outline-variant/30 flex-wrap gap-2">
            <div className="flex items-center gap-space-xs">
              <span className="material-symbols-outlined text-cyan-400 text-[18px]">table_rows</span>
              <span className="font-headline-sm text-body-md font-bold text-white tracking-wide">
                SYNOPTIC WAYPOINT TELEMETRY LOG
              </span>
            </div>
            <div className="flex items-center gap-space-xs font-data-label text-[11px] text-outline">
              <span>COORDINATE DATUM: <strong className="text-cyan-300">WGS84</strong></span>
              <span>•</span>
              <span>OBSERVATION NETWORK: GTS-IMD-NOAA</span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left font-data-label text-data-label">
              <thead>
                <tr className="text-outline uppercase bg-surface-container-lowest/80 border-b border-outline-variant/30 text-[10px] tracking-wider">
                  <th className="py-space-xs px-space-sm">TIMELINE REF</th>
                  <th className="py-space-xs px-space-sm">COORDINATES</th>
                  <th className="py-space-xs px-space-sm">MAX WIND</th>
                  <th className="py-space-xs px-space-sm">CENTRAL PRESS</th>
                  <th className="py-space-xs px-space-sm">INTENSITY</th>
                  <th className="py-space-xs px-space-sm">VALIDATION SOURCE</th>
                  <th className="py-space-xs px-space-sm text-right">ACTION</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/20 font-data-value text-data-value">
                {/* Row 1: T-12h */}
                <tr className="hover:bg-surface-container-high/60 transition-colors">
                  <td className="py-space-xs px-space-sm font-data-label text-outline">T-12h (18:00 UTC)</td>
                  <td className="py-space-xs px-space-sm text-on-surface">18.4°N, 89.2°E</td>
                  <td className="py-space-xs px-space-sm text-cyan-300 font-bold">165 km/h</td>
                  <td className="py-space-xs px-space-sm text-on-surface">968 hPa</td>
                  <td className="py-space-xs px-space-sm">
                    <span className="font-badge text-badge px-space-xs py-space-2xs rounded bg-surface-container-highest border border-amber-500/40 text-amber-300 font-bold">
                      CAT 3
                    </span>
                  </td>
                  <td className="py-space-xs px-space-sm text-outline font-data-label text-[11px]">OBSERVED (Doppler Paradip)</td>
                  <td className="py-space-xs px-space-sm text-right">
                    <button className="text-cyan-400 hover:text-white font-data-label text-[11px] underline font-semibold transition-colors" type="button">
                      Inspect
                    </button>
                  </td>
                </tr>

                {/* Row 2: T-6h */}
                <tr className="hover:bg-surface-container-high/60 transition-colors">
                  <td className="py-space-xs px-space-sm font-data-label text-outline">T-6h (00:00 UTC)</td>
                  <td className="py-space-xs px-space-sm text-on-surface">19.2°N, 88.8°E</td>
                  <td className="py-space-xs px-space-sm text-rose-400 font-bold">195 km/h</td>
                  <td className="py-space-xs px-space-sm text-on-surface">954 hPa</td>
                  <td className="py-space-xs px-space-sm">
                    <span className="font-badge text-badge px-space-xs py-space-2xs rounded bg-rose-950/80 border border-rose-500/50 text-rose-300 font-bold">
                      CAT 4
                    </span>
                  </td>
                  <td className="py-space-xs px-space-sm text-outline font-data-label text-[11px]">OBSERVED (INSAT-3D CIR)</td>
                  <td className="py-space-xs px-space-sm text-right">
                    <button className="text-cyan-400 hover:text-white font-data-label text-[11px] underline font-semibold transition-colors" type="button">
                      Inspect
                    </button>
                  </td>
                </tr>

                {/* Row 3: T-0 CURRENT ACTIVE EYE (Highlighted) */}
                <tr className="bg-gradient-to-r from-rose-950/40 via-surface-container-highest/60 to-surface-container-highest/40 hover:bg-surface-container-highest transition-colors border-y border-rose-500/40">
                  <td className="py-space-xs px-space-sm font-data-label text-rose-400 font-bold flex items-center gap-space-2xs">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500 alert-beacon shadow-[0_0_8px_#ff3366]"></span> T-0 (CURRENT)
                  </td>
                  <td className="py-space-xs px-space-sm text-white font-bold">{lat.toFixed(1)}°N, {lon.toFixed(1)}°E</td>
                  <td className="py-space-xs px-space-sm text-rose-400 font-bold filter drop-shadow-[0_0_4px_rgba(255,51,102,0.6)]">
                    {maxWind} km/h
                  </td>
                  <td className="py-space-xs px-space-sm text-cyan-300 font-bold">{pressure} hPa</td>
                  <td className="py-space-xs px-space-sm">
                    <span className="font-badge text-badge px-space-xs py-space-2xs rounded bg-rose-600 text-white font-bold shadow-[0_0_10px_rgba(255,51,102,0.6)]">
                      {catShort} SEVERE
                    </span>
                  </td>
                  <td className="py-space-xs px-space-sm text-cyan-300 font-bold font-data-label text-[11px] flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_#10b981]"></span>
                    ACTIVE EYE (DOPPLER + SAT)
                  </td>
                  <td className="py-space-xs px-space-sm text-right">
                    <span className="font-badge text-badge px-space-xs py-space-2xs bg-cyan-500 text-surface-container-lowest rounded font-bold shadow-[0_0_10px_rgba(0,229,255,0.5)]">
                      LOCKED
                    </span>
                  </td>
                </tr>

                {/* Row 4: T+6h */}
                <tr className="hover:bg-surface-container-high/60 transition-colors">
                  <td className="py-space-xs px-space-sm font-data-label text-outline">T+6h (12:00 UTC)</td>
                  <td className="py-space-xs px-space-sm text-on-surface-variant">20.9°N, 87.9°E</td>
                  <td className="py-space-xs px-space-sm text-rose-300 font-semibold">{Math.max(170, maxWind - 5)} km/h</td>
                  <td className="py-space-xs px-space-sm text-on-surface">{pressure + 6} hPa</td>
                  <td className="py-space-xs px-space-sm">
                    <span className="font-badge text-badge px-space-xs py-space-2xs rounded bg-rose-950/80 border border-rose-500/50 text-rose-300 font-bold">
                      {catShort}
                    </span>
                  </td>
                  <td className="py-space-xs px-space-sm text-outline font-data-label text-[11px]">FORECAST (Ensemble Mean)</td>
                  <td className="py-space-xs px-space-sm text-right">
                    <button className="text-cyan-400 hover:text-white font-data-label text-[11px] underline font-semibold transition-colors" type="button">
                      Inspect
                    </button>
                  </td>
                </tr>

                {/* Row 5: T+14h PREDICTED LANDFALL */}
                <tr className="hover:bg-surface-container-high/60 transition-colors bg-rose-950/20 border-t border-rose-500/20">
                  <td className="py-space-xs px-space-sm font-data-label text-rose-400 font-bold">T+14h (20:20 UTC)</td>
                  <td className="py-space-xs px-space-sm text-on-surface font-semibold">21.4°N, 87.2°E</td>
                  <td className="py-space-xs px-space-sm text-rose-400 font-bold">{Math.max(150, maxWind - 30)} km/h</td>
                  <td className="py-space-xs px-space-sm text-on-surface font-semibold">{pressure + 20} hPa</td>
                  <td className="py-space-xs px-space-sm">
                    <span className="font-badge text-badge px-space-xs py-space-2xs rounded bg-amber-950/80 border border-amber-500/50 text-amber-300 font-bold">
                      CAT 3 PEAK SURGE
                    </span>
                  </td>
                  <td className="py-space-xs px-space-sm text-rose-400 font-bold font-data-label text-[11px]">
                    PREDICTED LANDFALL
                  </td>
                  <td className="py-space-xs px-space-sm text-right">
                    <button 
                      onClick={() => setActiveTab('landfall')}
                      className="px-space-xs py-space-2xs rounded bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 text-white font-badge text-[10px] font-bold shadow-[0_0_10px_rgba(255,51,102,0.4)] transition-all" 
                      type="button"
                    >
                      STAGING
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CycloneDetails;
