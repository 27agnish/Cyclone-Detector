import React from 'react';
import { 
  Wind, 
  Compass, 
  AlertTriangle, 
  ShieldCheck, 
  ArrowRight, 
  RefreshCw, 
  Radar, 
  Activity,
  Layers,
  MapPin
} from 'lucide-react';
import { useCycloneStore } from '../store/cycloneStore';

export const Cyclones: React.FC = () => {
  const { 
    activeCyclones, 
    selectedCycloneId, 
    selectCyclone, 
    cycloneDetail, 
    refreshAllData, 
    isLoading,
    setActiveTab 
  } = useCycloneStore();

  const handleSelectAndInspect = async (id: string) => {
    await selectCyclone(id);
    setActiveTab('dashboard');
  };

  return (
    <div className="flex-1 p-4 lg:p-6 space-y-6 overflow-y-auto w-full bg-[#070d18] text-[#dee2f1] select-none font-telemetry">
      {/* Page Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#1e293b] pb-4">
        <div>
          <h2 className="text-xl lg:text-2xl font-headline font-bold text-white flex items-center gap-2.5">
            <Wind className="w-6 h-6 text-[#00e5ff]" />
            <span>AUTOMATIC CYCLONE DETECTION & FLEET REGISTRY</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Real-time multi-provider synoptic monitoring across the North Indian Ocean basin (Bay of Bengal & Arabian Sea).
          </p>
        </div>

        <button
          onClick={refreshAllData}
          disabled={isLoading}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-cyan-400 to-[#00e5ff] text-[#070d18] font-headline text-xs font-bold shadow-[0_0_16px_rgba(0,229,255,0.4)] transition hover:opacity-95 disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          <span>RE-SCAN BASIN (FASTAPI)</span>
        </button>
      </div>

      {/* Active Cyclones Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#00e5ff] pulse-beacon" />
            <span className="text-xs uppercase tracking-wider text-slate-300 font-bold">
              Detected Active Systems ({activeCyclones.length})
            </span>
          </div>
          <span className="text-xs text-cyan-300">
            PROVIDER: IMD / IBTRACS / METEOROLOGICAL ENSEMBLE
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {activeCyclones.map((c) => {
            const isSelected = c.id === selectedCycloneId;
            return (
              <div
                key={c.id}
                className={`bg-[#0d1527] border rounded-xl p-5 shadow-xl transition space-y-4 relative overflow-hidden ${
                  isSelected 
                    ? 'border-cyan-400 ring-2 ring-cyan-500/30 shadow-[0_0_24px_rgba(0,229,255,0.2)]' 
                    : 'border-[#1e293b] hover:border-cyan-500/40'
                }`}
              >
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#0f1a30] border border-cyan-500/40 flex items-center justify-center text-[#00e5ff] shadow-sm">
                      <Wind className="w-5 h-5 text-[#00e5ff]" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-headline text-lg font-bold text-white">{c.name}</span>
                        {isSelected && (
                          <span className="px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-400 text-[10px] font-bold">
                            ACTIVE FOCUS
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-slate-400">
                        Basin: <span className="text-cyan-300 font-bold">{c.basin}</span> • ID: {c.id}
                      </div>
                    </div>
                  </div>

                  <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase shadow-sm ${
                    c.category.includes('Super') || c.category.includes('Extremely')
                      ? 'bg-rose-950/90 text-rose-300 border border-rose-500 alert-beacon'
                      : 'bg-amber-950/90 text-amber-300 border border-amber-500'
                  }`}>
                    {c.category}
                  </span>
                </div>

                {/* Metrics Breakdown */}
                <div className="grid grid-cols-3 gap-2.5 pt-1 text-center">
                  <div className="bg-[#0f1a30] border border-[#1e293b] p-2.5 rounded-lg">
                    <div className="text-[10px] text-slate-400 uppercase">Wind Speed</div>
                    <div className="font-headline text-lg font-bold text-white mt-0.5">
                      {c.wind_speed} <span className="text-[10px] font-normal text-slate-400">km/h</span>
                    </div>
                  </div>

                  <div className="bg-[#0f1a30] border border-[#1e293b] p-2.5 rounded-lg">
                    <div className="text-[10px] text-slate-400 uppercase">Min Pressure</div>
                    <div className="font-headline text-lg font-bold text-cyan-300 mt-0.5">
                      {c.central_pressure} <span className="text-[10px] font-normal text-slate-400">hPa</span>
                    </div>
                  </div>

                  <div className="bg-[#0f1a30] border border-[#1e293b] p-2.5 rounded-lg">
                    <div className="text-[10px] text-slate-400 uppercase">Movement</div>
                    <div className="font-headline text-lg font-bold text-amber-300 mt-0.5">
                      {c.movement_direction} @ {c.movement_speed}
                    </div>
                  </div>
                </div>

                {/* Location / Landfall Details */}
                <div className="bg-[#0b1326] p-3 rounded-lg border border-[#1e293b] text-xs space-y-1">
                  <div className="flex justify-between items-center text-slate-300">
                    <span>Current Eye Position:</span>
                    <strong className="text-white font-mono">{c.current_latitude.toFixed(2)}°N, {c.current_longitude.toFixed(2)}°E</strong>
                  </div>
                  {c.estimated_landfall_location && (
                    <div className="flex justify-between items-center text-rose-300 pt-1 border-t border-[#1e293b]">
                      <span>Projected Landfall:</span>
                      <strong className="text-rose-400">{c.estimated_landfall_location}</strong>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2.5 pt-1">
                  <button
                    onClick={() => selectCyclone(c.id)}
                    className={`flex-1 py-2 rounded-lg font-headline text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                      isSelected
                        ? 'bg-cyan-950/70 border border-cyan-400 text-cyan-200'
                        : 'bg-[#0f1a30] hover:bg-[#13223f] border border-[#1e293b] text-slate-200'
                    }`}
                  >
                    <span>{isSelected ? 'CURRENTLY SELECTED' : 'SELECT CYCLONE'}</span>
                  </button>

                  <button
                    onClick={() => handleSelectAndInspect(c.id)}
                    className="flex-1 py-2 rounded-lg bg-gradient-to-r from-cyan-400 to-[#00e5ff] text-[#070d18] font-headline text-xs font-bold shadow-[0_0_12px_rgba(0,229,255,0.3)] transition flex items-center justify-center gap-1.5 hover:opacity-95"
                  >
                    <span>LAUNCH COMMAND HUD</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Cyclones;
