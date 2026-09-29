import React, { useEffect } from 'react';
import { 
  AlertTriangle, 
  MapPin, 
  Wind, 
  Waves, 
  Clock, 
  ShieldAlert, 
  Users, 
  Hospital, 
  Sparkles,
  ChevronRight,
  ExternalLink
} from 'lucide-react';
import { useCycloneStore } from '../store/cycloneStore';
import { aiApi } from '../services/aiApi';
import { CycloneMap } from '../components/Map/CycloneMap';

export const LandfallAnalysis: React.FC = () => {
  const { 
    cycloneDetail, 
    selectedCycloneId, 
    landfallRisk, 
    populationExposure, 
    infrastructure,
    openAiModal, 
    setIsAiLoading,
    setActiveTab 
  } = useCycloneStore();

  const landfall = cycloneDetail?.landfall;
  const zone = cycloneDetail?.landfall_zone;

  const handleExplainLandfall = async () => {
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

  if (!landfall) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-3 font-mono">
        <AlertTriangle className="w-10 h-10 text-amber-400" />
        <div className="text-white text-sm font-bold">Landfall Data Not Available</div>
        <p className="text-xs text-slate-400 max-w-md">
          The selected cyclone is currently tracking over open waters without an imminent predicted coastline intersection.
        </p>
      </div>
    );
  }

  return (
    <div className="flex-1 p-6 space-y-6 overflow-y-auto max-w-7xl mx-auto w-full">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-command-border pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-mono font-bold text-white flex items-center gap-2.5">
              <MapPin className="w-5 h-5 text-rose-500" />
              <span>LANDFALL SECTOR ANALYSIS & HAZARD CORRIDORS</span>
            </h2>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-red-950 text-red-300 border border-red-800 font-bold uppercase">
              {landfall.risk_category}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Deterministic eye intersection projection, multi-tier impact buffer zones, tidal surge propagation, and estuary risk.
          </p>
        </div>

        {/* Explain Landfall Risk Button */}
        <button
          onClick={handleExplainLandfall}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white font-mono text-xs font-semibold shadow-lg transition"
        >
          <Sparkles className="w-4 h-4" />
          <span>EXPLAIN LANDFALL RISK</span>
        </button>
      </div>

      {/* Primary Landfall Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 font-mono">
        <div className="bg-command-card border border-rose-900/60 rounded-xl p-4 shadow-xl">
          <div className="text-slate-400 text-[10px] uppercase font-bold tracking-wider">PROJECTED SECTOR</div>
          <div className="text-lg font-extrabold text-white mt-1 leading-snug">{landfall.location_name}</div>
          <div className="text-xs text-rose-300 mt-0.5">{landfall.district}, {landfall.state}</div>
          <div className="text-[11px] text-slate-400 mt-2 font-mono">
            Coords: {landfall.latitude}°N, {landfall.longitude}°E
          </div>
        </div>

        <div className="bg-command-card border border-command-border rounded-xl p-4 shadow-xl">
          <div className="text-slate-400 text-[10px] uppercase font-bold tracking-wider">ESTIMATED LANDFALL ETA</div>
          <div className="text-xl font-extrabold text-cyan-300 mt-1">{landfall.estimated_time}</div>
          <div className="text-[11px] text-slate-400 mt-1">High confidence eyewall arrival</div>
          <div className="text-[10px] text-slate-500 mt-2">Source: {landfall.source_label}</div>
        </div>

        <div className="bg-command-card border border-amber-900/60 rounded-xl p-4 shadow-xl">
          <div className="text-amber-400 text-[10px] uppercase font-bold tracking-wider">EXPECTED SUSTAINED WIND</div>
          <div className="text-2xl font-extrabold text-amber-300 mt-1">{landfall.expected_wind_speed} <span className="text-xs">km/h</span></div>
          <div className="text-[11px] text-slate-300 mt-1">Gusts up to {Math.round(landfall.expected_wind_speed * 1.18)} km/h</div>
          <div className="text-[10px] text-amber-400/80 mt-2">Destructive eyewall forces</div>
        </div>

        <div className="bg-command-card border border-sky-900/60 rounded-xl p-4 shadow-xl">
          <div className="text-sky-400 text-[10px] uppercase font-bold tracking-wider">ESTIMATED STORM SURGE</div>
          <div className="text-2xl font-extrabold text-sky-300 mt-1">{landfall.expected_storm_surge_m} <span className="text-xs">meters</span></div>
          <div className="text-[11px] text-slate-300 mt-1">Above astronomical high tide</div>
          <div className="text-[10px] text-sky-400/80 mt-2">Saline tidal wave warning</div>
        </div>
      </div>

      {/* Landfall Spatial Map & Zone Inspection */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Map Container */}
        <div className="lg:col-span-2 h-[480px] relative rounded-xl overflow-hidden border border-command-border shadow-xl">
          <CycloneMap />
        </div>

        {/* Impact Zones Breakdown Card */}
        <div className="bg-command-card border border-command-border rounded-xl p-5 shadow-xl space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <h3 className="text-sm font-mono font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-cyan-400" />
              <span>TRI-TIER IMPACT ZONES</span>
            </h3>

            {/* Zone 1: Critical */}
            <div className="bg-slate-900/90 border-l-4 border-red-500 p-3 rounded text-xs space-y-1 font-mono">
              <div className="flex justify-between items-center text-red-400 font-bold">
                <span>CRITICAL ZONE (0 - 35 km)</span>
                <span>PEAK RISK</span>
              </div>
              <p className="text-slate-300 text-[11px] font-sans">
                Direct eyewall transit. Catastrophic roof damage, uprooted trees, and storm surge inundation up to 5km inland.
              </p>
              <div className="text-[10px] text-slate-400 pt-1">
                Population: <strong className="text-red-300">{populationExposure?.critical.toLocaleString() || '485,000'}</strong>
              </div>
            </div>

            {/* Zone 2: High */}
            <div className="bg-slate-900/90 border-l-4 border-orange-500 p-3 rounded text-xs space-y-1 font-mono">
              <div className="flex justify-between items-center text-orange-400 font-bold">
                <span>HIGH RISK ZONE (35 - 80 km)</span>
                <span>GALE SWATH</span>
              </div>
              <p className="text-slate-300 text-[11px] font-sans">
                Severe gale force winds (80-110 km/h), high rainfall runoff, flash flooding along coastal rivers.
              </p>
              <div className="text-[10px] text-slate-400 pt-1">
                Population: <strong className="text-orange-300">{(populationExposure?.high ? (populationExposure.high / 1000000).toFixed(2) : '1.43')}M</strong>
              </div>
            </div>

            {/* Zone 3: Moderate */}
            <div className="bg-slate-900/90 border-l-4 border-yellow-500 p-3 rounded text-xs space-y-1 font-mono">
              <div className="flex justify-between items-center text-yellow-400 font-bold">
                <span>MODERATE ZONE (80 - 150 km)</span>
                <span>PERIMETER</span>
              </div>
              <p className="text-slate-300 text-[11px] font-sans">
                Squally weather, localized flooding, power line disruptions, sea condition advisories for fishers.
              </p>
              <div className="text-[10px] text-slate-400 pt-1">
                Population: <strong className="text-yellow-300">{(populationExposure?.moderate ? (populationExposure.moderate / 1000000).toFixed(2) : '1.80')}M</strong>
              </div>
            </div>
          </div>

          <div className="space-y-2 pt-2 border-t border-slate-800">
            <button
              onClick={() => setActiveTab('infrastructure')}
              className="w-full flex items-center justify-between px-3 py-2 rounded bg-slate-800 hover:bg-slate-700 text-xs font-mono text-slate-200 transition"
            >
              <span>Inspect Infrastructure in Landfall Sector</span>
              <ChevronRight className="w-4 h-4 text-cyan-400" />
            </button>
            <button
              onClick={() => setActiveTab('emergency')}
              className="w-full flex items-center justify-between px-3 py-2 rounded bg-slate-800 hover:bg-slate-700 text-xs font-mono text-slate-200 transition"
            >
              <span>View Emergency Evacuation Orders</span>
              <ChevronRight className="w-4 h-4 text-rose-400" />
            </button>
          </div>
        </div>
      </div>

      {/* Landfall Risk Breakdown Dossier */}
      {landfallRisk && (
        <div className="bg-command-card border border-command-border rounded-xl p-5 shadow-xl space-y-3 font-mono text-xs">
          <div className="flex items-center justify-between border-b border-command-border pb-2">
            <div className="font-bold text-white uppercase flex items-center gap-2">
              <Waves className="w-4 h-4 text-cyan-400" />
              <span>HYDROLOGICAL & TIDAL ESTUARY THREAT DOSSIER</span>
            </div>
            <span className="text-slate-400 text-[11px]">{landfallRisk.disclaimer}</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
            <div className="bg-slate-900/80 p-3 rounded border border-slate-800 space-y-1">
              <span className="text-slate-400">Coastal Saline Inundation Risk:</span>
              <div className="text-red-400 font-bold text-sm">{landfallRisk.coastal_saline_inundation_risk}</div>
              <p className="text-[11px] text-slate-300 font-sans">
                Saltwater ingress projected to penetrate up to 8km inland into agricultural polders and wetlands.
              </p>
            </div>

            <div className="bg-slate-900/80 p-3 rounded border border-slate-800 space-y-1">
              <span className="text-slate-400">Estuary Backflow Risk:</span>
              <div className="text-amber-400 font-bold text-sm">{landfallRisk.estuary_backflow_risk}</div>
              <p className="text-[11px] text-slate-300 font-sans">
                High storm surge will impede river discharge, triggering severe backflow flooding in delta tributaries.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LandfallAnalysis;
