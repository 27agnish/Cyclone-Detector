import React, { useState } from 'react';
import { 
  ShieldAlert, 
  RefreshCw, 
  Wind, 
  Compass, 
  Sparkles, 
  AlertTriangle, 
  Radio, 
  FileText,
  Clock,
  Key
} from 'lucide-react';
import { useCycloneStore } from '../../store/cycloneStore';
import { aiApi } from '../../services/aiApi';
import { ApiStatusModal } from './ApiStatusModal';

export const TopStatusBar: React.FC = () => {
  const {
    cycloneDetail,
    activeCyclones,
    selectedCycloneId,
    selectCyclone,
    refreshAllData,
    statusMessage,
    lastUpdated,
    isLoading,
    openAiModal,
    setIsAiLoading
  } = useCycloneStore();

  const [apiStatusOpen, setApiStatusOpen] = useState(false);

  const handleAiImpactAnalysis = async () => {
    if (!cycloneDetail) return;
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

  const handleAiReport = async () => {
    if (!cycloneDetail) return;
    setIsAiLoading(true);
    try {
      const res = await aiApi.generateReport(selectedCycloneId);
      openAiModal(res);
    } catch (e) {
      console.error(e);
    } finally {
      setIsAiLoading(false);
    }
  };

  return (
    <>
      <header className="w-full bg-command-surface border-b border-command-border px-4 py-2.5 shadow-md">
        {/* Top Banner & Status */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Left: Product Name, Tagline & Mode Status */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white shadow-lg shadow-cyan-500/20">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-extrabold text-base tracking-wider text-white">
                    CYCLONESHIELD<span className="text-cyan-400"> AI</span>
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-950 border border-cyan-800 text-cyan-300 font-semibold uppercase tracking-wider flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse"></span>
                    {statusMessage}
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-950/80 border border-amber-800/80 text-amber-300">
                    DEMO MODE — SIMULATED CYCLONE SCENARIO
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 font-sans hidden sm:block">
                  From Cyclone Track to Infrastructure Action | Decision-Support Command Platform
                </p>
              </div>
            </div>
          </div>

          {/* Right: Operational Controls & AI Actions */}
          <div className="flex items-center gap-2">
            {/* Active Cyclone Switcher */}
            {activeCyclones.length > 1 && (
              <select
                value={selectedCycloneId}
                onChange={(e) => selectCyclone(e.target.value)}
                className="bg-slate-900 border border-slate-700 text-xs font-mono text-cyan-300 px-2.5 py-1.5 rounded focus:outline-none focus:border-cyan-500"
              >
                {activeCyclones.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.category})
                  </option>
                ))}
              </select>
            )}

            {/* API Status Modal Trigger */}
            <button
              onClick={() => setApiStatusOpen(true)}
              title="View API Connectivity & Status"
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-cyan-300 border border-slate-700 font-mono text-xs transition"
            >
              <Key className="w-3.5 h-3.5 text-cyan-400" />
              <span className="hidden sm:inline">API STATUS</span>
            </button>

            {/* AI Impact Analysis Trigger */}
            <button
              onClick={handleAiImpactAnalysis}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-mono text-xs font-semibold shadow-md transition"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>AI IMPACT ANALYSIS</span>
            </button>

            {/* AI Disaster Briefing Report */}
            <button
              onClick={handleAiReport}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-mono text-xs font-medium transition"
            >
              <FileText className="w-3.5 h-3.5 text-cyan-400" />
              <span>DISASTER BRIEFING</span>
            </button>

            {/* Refresh Data Button */}
            <button
              onClick={refreshAllData}
              disabled={isLoading}
              title="Refresh Cyclone Telemetry"
              className="p-1.5 rounded bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 transition disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-cyan-400' : ''}`} />
            </button>
          </div>
        </div>

        {/* Live Cyclone Telemetry Strip */}
        {cycloneDetail && (
          <div className="mt-2.5 pt-2 border-t border-command-border/80 flex flex-wrap items-center justify-between text-xs font-mono gap-3">
            <div className="flex items-center gap-4 flex-wrap">
              <div className="flex items-center gap-1.5 text-white">
                <span className="text-slate-400">TARGET:</span>
                <strong className="text-cyan-300 font-bold">{cycloneDetail.name}</strong>
                <span className="text-[11px] text-yellow-400 bg-yellow-950/60 px-1.5 py-0.2 rounded border border-yellow-800">
                  {cycloneDetail.category}
                </span>
              </div>

              <div className="flex items-center gap-1.5 text-slate-300">
                <Wind className="w-3.5 h-3.5 text-amber-400" />
                <span>WIND: <strong className="text-white">{cycloneDetail.wind_speed} km/h</strong></span>
              </div>

              <div className="flex items-center gap-1.5 text-slate-300">
                <Compass className="w-3.5 h-3.5 text-cyan-400" />
                <span>MOVEMENT: <strong className="text-white">{cycloneDetail.movement_direction} @ {cycloneDetail.movement_speed} km/h</strong></span>
              </div>

              <div className="flex items-center gap-1.5 text-slate-300">
                <span className="text-slate-400">PRESSURE:</span>
                <strong className="text-sky-300">{cycloneDetail.central_pressure} hPa</strong>
              </div>

              {cycloneDetail.landfall && (
                <div className="flex items-center gap-1.5 text-rose-300 bg-rose-950/50 px-2 py-0.5 rounded border border-rose-900">
                  <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                  <span>LANDFALL ETA: <strong>{cycloneDetail.landfall.estimated_time}</strong> ({cycloneDetail.landfall.location_name})</span>
                </div>
              )}
            </div>

            <div className="flex items-center gap-3 text-slate-400 text-[11px]">
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3 text-slate-500" />
                Last Data Update: <span className="text-slate-300">{lastUpdated}</span>
              </span>
            </div>
          </div>
        )}
      </header>

      {/* API Status Modal */}
      <ApiStatusModal isOpen={apiStatusOpen} onClose={() => setApiStatusOpen(false)} />
    </>
  );
};
