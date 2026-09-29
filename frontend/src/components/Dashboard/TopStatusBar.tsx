import React, { useState } from 'react';
import { 
  ShieldAlert, 
  RefreshCw, 
  Wind, 
  Compass, 
  Sparkles, 
  AlertTriangle, 
  Bell, 
  Search,
  FileText,
  Clock,
  Key,
  X,
  CheckCircle2,
  Settings as SettingsIcon,
  ChevronDown
} from 'lucide-react';
import { useCycloneStore } from '../../store/cycloneStore';
import { aiApi } from '../../services/aiApi';
import { ApiStatusModal } from './ApiStatusModal';
import { env } from '../../config/env';

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
    setIsAiLoading,
    setActiveTab,
    notifications,
    dismissNotification,
    healthStatus
  } = useCycloneStore();

  const [apiStatusOpen, setApiStatusOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

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

  // Filtered cyclones or shortcuts based on search
  const filteredCyclones = activeCyclones.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.basin.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (c.estimated_landfall_location && c.estimated_landfall_location.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <>
      <header className="w-full bg-command-surface border-b border-command-border px-4 py-2 shadow-md z-20">
        {/* Top Operational Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Left: Tagline & Status Indicators */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-950 border border-cyan-800 text-cyan-300 font-semibold uppercase tracking-wider flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse"></span>
                {statusMessage}
              </span>

              {env.DEMO_MODE ? (
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-950/80 border border-amber-800/80 text-amber-300 font-semibold flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3 text-amber-400" />
                  DEMO MODE — SIMULATED CYCLONE SCENARIO
                </span>
              ) : (
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-950/80 border border-emerald-800/80 text-emerald-300 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                  LIVE MODE — MONITORED OCEAN BASIN
                </span>
              )}
            </div>

            <span className="text-slate-500 hidden lg:inline">|</span>

            <span className="text-xs text-slate-400 hidden lg:inline font-sans">
              "Predict the Path. Protect What Matters."
            </span>
          </div>

          {/* Right: Search, Notifications, Selectors, AI Triggers */}
          <div className="flex items-center gap-2">
            {/* Global Search Button */}
            <div className="relative">
              <button
                onClick={() => setSearchOpen(!searchOpen)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700 text-xs font-mono transition"
                title="Global Search"
              >
                <Search className="w-3.5 h-3.5 text-cyan-400" />
                <span className="hidden sm:inline">SEARCH</span>
              </button>

              {searchOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-slate-900 border border-command-border rounded-xl shadow-2xl p-3 z-50 space-y-2 font-mono">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <span className="text-xs font-bold text-white">GLOBAL SEARCH</span>
                    <button onClick={() => setSearchOpen(false)} className="text-slate-400 hover:text-white">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <input
                    type="text"
                    placeholder="Search cyclone, district, or sector..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    autoFocus
                    className="w-full bg-slate-950 border border-slate-700 text-xs text-white px-2.5 py-1.5 rounded focus:outline-none focus:border-cyan-500"
                  />
                  <div className="max-h-48 overflow-y-auto space-y-1 text-xs">
                    {filteredCyclones.map(c => (
                      <button
                        key={c.id}
                        onClick={() => {
                          selectCyclone(c.id);
                          setSearchOpen(false);
                        }}
                        className="w-full text-left p-2 rounded hover:bg-slate-800 text-slate-200 flex justify-between items-center transition"
                      >
                        <span className="font-bold text-white">{c.name}</span>
                        <span className="text-[10px] text-cyan-400">{c.category}</span>
                      </button>
                    ))}
                    {filteredCyclones.length === 0 && (
                      <div className="text-slate-400 text-[11px] p-2 text-center">No matching records found.</div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Notifications Center */}
            <div className="relative">
              <button
                onClick={() => setNotifOpen(!notifOpen)}
                className="relative p-1.5 rounded bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700 transition"
                title="Operational Notifications"
              >
                <Bell className="w-3.5 h-3.5 text-slate-300" />
                {notifications.length > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-600 text-white font-mono text-[9px] font-bold flex items-center justify-center animate-pulse">
                    {notifications.length}
                  </span>
                )}
              </button>

              {notifOpen && (
                <>
                  {/* Backdrop overlay for closing on outside click */}
                  <div 
                    className="fixed inset-0 z-[9998] cursor-default" 
                    onClick={() => setNotifOpen(false)}
                    aria-hidden="true"
                  />

                  {/* Fixed top-right notification panel */}
                  <div 
                    className="fixed top-[70px] right-[10px] sm:right-[20px] w-[min(400px,calc(100vw-20px))] max-h-[calc(100vh-90px)] overflow-y-auto bg-slate-900/98 backdrop-blur-xl border border-command-border rounded-xl shadow-2xl p-3.5 z-[9999] space-y-2.5 font-mono animate-in fade-in slide-in-from-top-2 duration-150"
                    style={{
                      position: 'fixed',
                      top: '70px',
                      zIndex: 9999
                    }}
                  >
                    <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                      <span className="text-xs font-bold text-white flex items-center gap-1.5">
                        <Bell className="w-3.5 h-3.5 text-cyan-400" />
                        <span>OPERATIONAL ALERTS ({notifications.length})</span>
                      </span>
                      <button 
                        onClick={() => setNotifOpen(false)} 
                        className="text-slate-400 hover:text-white p-1 rounded hover:bg-slate-800 transition"
                        title="Close alerts"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="space-y-2 text-xs">
                      {notifications.map(n => (
                        <div key={n.id} className="p-2.5 rounded bg-slate-950/90 border border-slate-800/90 hover:border-slate-700 space-y-1 relative transition">
                          <div className="flex justify-between items-start gap-2">
                            <span className={`font-bold text-[11px] ${
                              n.type === 'critical' ? 'text-red-400' :
                              n.type === 'warning' ? 'text-amber-400' : 'text-cyan-400'
                            }`}>
                              {n.title}
                            </span>
                            <button 
                              onClick={() => dismissNotification(n.id)}
                              className="text-slate-500 hover:text-slate-300 p-0.5 rounded hover:bg-slate-800 shrink-0"
                              title="Dismiss notification"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                          <p className="text-[11px] text-slate-300 font-sans leading-relaxed">{n.message}</p>
                          <span className="text-[9px] text-slate-500 block pt-0.5">{n.timestamp}</span>
                        </div>
                      ))}
                      {notifications.length === 0 && (
                        <div className="text-slate-400 text-[11px] p-6 text-center">No active alerts.</div>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Active Cyclone Switcher */}
            {activeCyclones.length > 0 && (
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

            {/* AI Impact Analysis Trigger */}
            <button
              onClick={handleAiImpactAnalysis}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-mono text-xs font-semibold shadow-md transition"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">AI IMPACT BRIEFING</span>
            </button>

            {/* Settings & API Health Shortcut */}
            <button
              onClick={() => setActiveTab('settings')}
              title="System Settings & Live Diagnostics"
              className="p-1.5 rounded bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-cyan-300 border border-slate-700 transition"
            >
              <SettingsIcon className="w-3.5 h-3.5" />
            </button>

            {/* Refresh Data Button */}
            <button
              onClick={refreshAllData}
              disabled={isLoading}
              title="Refresh Cyclone Telemetry"
              className="p-1.5 rounded bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700 transition disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-cyan-400' : ''}`} />
            </button>
          </div>
        </div>

        {/* Live Cyclone Telemetry Strip */}
        {cycloneDetail && (
          <div className="mt-2 pt-2 border-t border-command-border/80 flex flex-wrap items-center justify-between text-xs font-mono gap-3">
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
                Last Update: <span className="text-slate-300">{lastUpdated}</span>
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

export default TopStatusBar;
