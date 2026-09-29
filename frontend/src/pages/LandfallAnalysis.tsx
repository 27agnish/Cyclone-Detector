import React from 'react';
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
  TrendingUp,
  Compass,
  Radar,
  ArrowRight
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
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-3 font-telemetry">
        <AlertTriangle className="w-10 h-10 text-amber-400" />
        <div className="text-white text-sm font-bold">Landfall Data Not Available</div>
        <p className="text-xs text-slate-400 max-w-md">
          The selected cyclone is currently tracking over open waters without an imminent predicted coastline intersection.
        </p>
      </div>
    );
  }

  return (
    <div className="flex-1 p-4 lg:p-6 space-y-6 overflow-y-auto w-full bg-[#070d18] text-[#dee2f1] select-none">
      {/* Header Banner */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#1e293b] pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl lg:text-2xl font-headline font-bold text-white flex items-center gap-2.5">
              <MapPin className="w-6 h-6 text-rose-500 alert-beacon" />
              <span>LANDFALL SECTOR ANALYSIS & HAZARD CORRIDORS</span>
            </h2>
            <span className="font-telemetry text-[10px] px-2.5 py-0.5 rounded-full bg-red-950/90 text-rose-200 border border-red-500 font-bold uppercase shadow-[0_0_10px_rgba(255,51,102,0.4)]">
              {landfall.risk_category}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1 font-telemetry">
            Deterministic eye intersection projection, multi-tier impact buffer zones, tidal surge propagation, and estuary risk.
          </p>
        </div>

        {/* Explain Landfall Risk Button */}
        <button
          onClick={handleExplainLandfall}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-red-600 via-rose-600 to-red-500 hover:opacity-95 text-white font-headline text-xs font-bold tracking-wide uppercase shadow-[0_0_16px_rgba(255,51,102,0.4)] transition"
        >
          <Sparkles className="w-4 h-4 text-white" />
          <span>EXPLAIN LANDFALL RISK</span>
        </button>
      </div>

      {/* Primary Landfall Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 font-telemetry">
        <div className="bg-[#0d1527] border border-rose-500/40 rounded-xl p-4 shadow-xl">
          <div className="text-slate-400 text-[10px] uppercase font-bold tracking-wider">PROJECTED SECTOR</div>
          <div className="font-headline text-lg font-bold text-white mt-1 leading-snug">{landfall.location_name}</div>
          <div className="text-xs text-rose-300 mt-0.5">{landfall.district}, {landfall.state}</div>
          <div className="text-[11px] text-cyan-300 mt-2">
            Coords: {landfall.latitude}°N, {landfall.longitude}°E
          </div>
        </div>

        <div className="bg-[#0d1527] border border-[#1e293b] rounded-xl p-4 shadow-xl">
          <div className="text-slate-400 text-[10px] uppercase font-bold tracking-wider">ESTIMATED LANDFALL ETA</div>
          <div className="font-headline text-xl font-bold text-[#00e5ff] mt-1">{landfall.estimated_time}</div>
          <div className="text-xs text-amber-300 mt-0.5">T-13h 45m window</div>
          <div className="text-[11px] text-slate-400 mt-2">
            Confidence: <span className="text-emerald-400 font-bold">HIGH (91.8%)</span>
          </div>
        </div>

        <div className="bg-[#0d1527] border border-[#1e293b] rounded-xl p-4 shadow-xl">
          <div className="text-slate-400 text-[10px] uppercase font-bold tracking-wider">PEAK LANDFALL WIND</div>
          <div className="font-headline text-xl font-bold text-rose-400 mt-1">{landfall.expected_wind_speed} km/h</div>
          <div className="text-xs text-rose-300 mt-0.5">Gusts up to {Math.round(landfall.expected_wind_speed * 1.25)} km/h</div>
          <div className="text-[11px] text-slate-400 mt-2">
            Force: <span className="text-rose-400 font-bold">Category 4 Superstorm</span>
          </div>
        </div>

        <div className="bg-[#0d1527] border border-[#1e293b] rounded-xl p-4 shadow-xl">
          <div className="text-slate-400 text-[10px] uppercase font-bold tracking-wider">PROJECTED STORM SURGE</div>
          <div className="font-headline text-xl font-bold text-cyan-300 mt-1">4.2 meters</div>
          <div className="text-xs text-cyan-200 mt-0.5">Coincides with high astronomical tide</div>
          <div className="text-[11px] text-slate-400 mt-2">
            Inundation: <span className="text-cyan-300 font-bold">8.5 km inland</span>
          </div>
        </div>
      </div>

      {/* Geospatial Map + Tri-Tier Corridors */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Map Viewport (7 Cols) */}
        <div className="lg:col-span-7 bg-[#0d1527] border border-[#1e293b] rounded-xl p-4 shadow-xl flex flex-col">
          <div className="flex items-center justify-between pb-3 border-b border-[#1e293b] mb-3">
            <div className="flex items-center gap-2">
              <Radar className="w-5 h-5 text-[#00e5ff]" />
              <span className="font-headline text-sm font-semibold text-white">
                TACTICAL EYE-WALL INTERCEPT & RADAR SWEEP
              </span>
            </div>
            <span className="font-telemetry text-[10px] text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-500/40">
              SYNCHRONIZED
            </span>
          </div>
          <div className="flex-1 min-h-[420px] rounded-lg overflow-hidden border border-[#1e293b]">
            <CycloneMap />
          </div>
        </div>

        {/* Hazard Corridor Tri-Tier Buffers (5 Cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-[#0d1527] border border-[#1e293b] rounded-xl p-4 shadow-xl">
            <h3 className="font-headline text-sm font-bold text-white uppercase tracking-wider mb-3">
              TRI-TIER HAZARD BUFFER IMPACT
            </h3>

            <div className="space-y-3 font-telemetry">
              {/* Critical Corridor */}
              <div className="p-3 rounded-lg bg-[#0b1326] border-l-4 border-rose-500 border border-[#1e293b]">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs text-rose-400 font-bold">CRITICAL CORRIDOR (0–35 KM)</span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-rose-950 text-rose-300 font-bold">MANDATORY EVACUATION</span>
                </div>
                <p className="text-xs text-slate-300 font-sans">
                  Direct eye and eyewall impact zone. Catastrophic tree uprooting, power grid collapse, full surge inundation.
                </p>
                <div className="mt-2 flex justify-between text-[11px] text-slate-400 pt-1 border-t border-[#1e293b]">
                  <span>Population: <strong className="text-white">280,000</strong></span>
                  <span>Critical Lifelines: <strong className="text-rose-400">18</strong></span>
                </div>
              </div>

              {/* High Risk Perimeter */}
              <div className="p-3 rounded-lg bg-[#0b1326] border-l-4 border-amber-400 border border-[#1e293b]">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs text-amber-300 font-bold">HIGH RISK PERIMETER (35–80 KM)</span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-amber-950 text-amber-300 font-bold">SHELTER IN PLACE / PREPARE</span>
                </div>
                <p className="text-xs text-slate-300 font-sans">
                  Gale-force to hurricane-force squalls. Flash flooding in secondary tributaries, localized communication outages.
                </p>
                <div className="mt-2 flex justify-between text-[11px] text-slate-400 pt-1 border-t border-[#1e293b]">
                  <span>Population: <strong className="text-white">640,000</strong></span>
                  <span>Critical Lifelines: <strong className="text-amber-300">42</strong></span>
                </div>
              </div>

              {/* Moderate Impact Ribbon */}
              <div className="p-3 rounded-lg bg-[#0b1326] border-l-4 border-cyan-400 border border-[#1e293b]">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs text-cyan-300 font-bold">MODERATE IMPACT RIBBON (80–160 KM)</span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 font-bold">ADVISORY MONITOR</span>
                </div>
                <p className="text-xs text-slate-300 font-sans">
                  Heavy squalls, localized waterlogging, transport slowdowns.
                </p>
                <div className="mt-2 flex justify-between text-[11px] text-slate-400 pt-1 border-t border-[#1e293b]">
                  <span>Population: <strong className="text-white">1.1M</strong></span>
                  <span>Critical Lifelines: <strong className="text-cyan-300">82</strong></span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Action Navigation */}
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setActiveTab('infrastructure')}
              className="p-3 bg-[#0d1527] hover:bg-[#13223f] border border-[#1e293b] hover:border-cyan-500/40 rounded-xl transition-all flex flex-col gap-1 text-left group"
            >
              <span className="font-telemetry text-[10px] text-slate-400 uppercase font-semibold">Next Action</span>
              <span className="font-headline text-xs font-bold text-white group-hover:text-[#00e5ff] flex items-center justify-between">
                <span>View Infrastructure</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </button>

            <button
              onClick={() => setActiveTab('emergency')}
              className="p-3 bg-[#0d1527] hover:bg-[#13223f] border border-[#1e293b] hover:border-rose-500/40 rounded-xl transition-all flex flex-col gap-1 text-left group"
            >
              <span className="font-telemetry text-[10px] text-slate-400 uppercase font-semibold">Triage Plan</span>
              <span className="font-headline text-xs font-bold text-white group-hover:text-rose-400 flex items-center justify-between">
                <span>Emergency Orders</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandfallAnalysis;
