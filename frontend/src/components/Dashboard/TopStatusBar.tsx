import React, { useState, useEffect } from 'react';
import { 
  Wind, 
  Compass, 
  Sparkles, 
  AlertTriangle, 
  Bell, 
  Search, 
  X, 
  RefreshCw,
  Volume2,
  VolumeX,
  Radio,
  Settings as SettingsIcon,
  ChevronDown,
  Terminal,
  Activity,
  Layers,
  MapPin,
  Hospital
} from 'lucide-react';
import { useCycloneStore } from '../../store/cycloneStore';
import { aiApi } from '../../services/aiApi';
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

  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [notificationDrawerOpen, setNotificationDrawerOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [audioEnabled, setAudioEnabled] = useState(true);

  // Command palette keyboard shortcut (Ctrl+K or Cmd+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setCommandPaletteOpen(prev => !prev);
      } else if (e.key === 'Escape') {
        setCommandPaletteOpen(false);
        setNotificationDrawerOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

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

  const filteredCyclones = activeCyclones.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.basin.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (c.estimated_landfall_location && c.estimated_landfall_location.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const activeName = cycloneDetail ? cycloneDetail.name.toUpperCase() : (activeCyclones[0]?.name.toUpperCase() || 'CYCLONE DANA');
  const activeCat = cycloneDetail?.category || 'CAT 4';
  const activeWind = cycloneDetail?.wind_speed || 215;
  const activePressure = cycloneDetail?.central_pressure || 942;
  const activeDir = cycloneDetail?.movement_direction || 'NW';
  const activeSpeed = cycloneDetail?.movement_speed || 18;

  return (
    <>
      <header className="sticky top-0 z-30 shrink-0 h-16 min-h-[4rem] w-full bg-surface-container-lowest/95 backdrop-blur-2xl px-3 sm:px-space-md lg:px-space-lg flex items-center justify-between gap-2 border-b border-outline-variant/30 shadow-[0_4px_20px_rgba(0,0,0,0.6)] select-none overflow-hidden">
        {/* Left: Active Cyclone Telemetry Pill */}
        <div className="flex items-center gap-2 min-w-0 shrink-0">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface-container-low border border-rose-500/40 shadow-[0_0_12px_rgba(255,51,102,0.2)] whitespace-nowrap">
            <span className="w-2 h-2 rounded-full bg-rose-500 alert-beacon shadow-[0_0_8px_#ff3366] shrink-0"></span>
            <span className="font-badge text-badge text-rose-300 tracking-wider uppercase font-bold whitespace-nowrap">
              {activeName}
              <span className="hidden 2xl:inline"> ({activeCat})</span>
            </span>
            <span className="text-outline text-body-sm">•</span>
            <span className="font-data-value text-data-label text-cyan-300 font-bold whitespace-nowrap">
              {activeWind} KM/H
            </span>
            <span className="text-outline text-body-sm hidden sm:inline">•</span>
            <span className="font-data-value text-data-label text-secondary font-semibold hidden sm:inline whitespace-nowrap">
              {activePressure} HPA
            </span>
            <span className="text-outline text-body-sm hidden xl:inline">•</span>
            <span className="font-data-label text-[10px] text-amber-300 font-semibold uppercase hidden xl:inline whitespace-nowrap">
              TRACKING {activeDir} @ {activeSpeed} KM/H
            </span>
          </div>

          {/* Active Cyclone Switcher Dropdown */}
          {activeCyclones.length > 1 && (
            <select
              value={selectedCycloneId}
              onChange={(e) => selectCyclone(e.target.value)}
              className="hidden xl:inline-block bg-surface-container-high border border-cyan-500/40 text-[11px] font-data-label text-cyan-300 px-2 py-1 rounded-md focus:outline-none focus:border-cyan-400 shrink-0"
            >
              {activeCyclones.map(c => (
                <option key={c.id} value={c.id} className="bg-surface-container-lowest text-on-surface">
                  Switch to {c.name}
                </option>
              ))}
            </select>
          )}
        </div>

        {/* Center: Command Palette Trigger */}
        <div className="flex-1 max-w-xs 2xl:max-w-md mx-2 hidden xl:block min-w-[180px]">
          <button
            onClick={() => setCommandPaletteOpen(true)}
            type="button"
            className="w-full h-9 flex items-center justify-between px-space-sm bg-surface-container-low/80 border border-outline-variant/40 hover:border-primary-container/40 rounded-lg text-outline hover:text-on-surface hover:bg-surface-container transition-all font-body-sm shadow-inner group"
          >
            <div className="flex items-center gap-space-xs overflow-hidden">
              <span className="material-symbols-outlined text-[18px] text-primary shrink-0">search</span>
              <span className="truncate text-xs text-outline group-hover:text-on-surface">Search cyclones, coordinates, radar towers...</span>
            </div>
            <kbd className="font-data-label text-badge px-space-xs py-space-2xs rounded bg-surface-container-highest border border-outline-variant/40 text-primary-fixed-dim font-bold shrink-0 ml-2">
              ⌘K
            </kbd>
          </button>
        </div>

        {/* Right Action Icons & Emergency Triggers */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
          {/* Status Indicator */}
          <div className="hidden 2xl:flex items-center gap-3 text-slate-400 font-telemetry text-[11px] whitespace-nowrap">
            <span className="flex items-center gap-1.5 text-cyan-300">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 pulse-beacon"></span>
              {statusMessage || 'REALTIME SYNC'}
            </span>
            <span className="flex items-center gap-1.5 text-emerald-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
              FASTAPI v1.0 LIVE
            </span>
          </div>

          {/* Audio Warning Toggle */}
          <button 
            type="button"
            onClick={() => setAudioEnabled(!audioEnabled)}
            className="p-2 rounded-lg text-slate-400 hover:text-cyan-300 hover:bg-[#0b1326] border border-transparent hover:border-[#1e293b] transition-colors"
            title={audioEnabled ? "Audio Warning Systems Active" : "Audio Warning Systems Muted"}
          >
            {audioEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
          </button>

          {/* Notifications Drawer Toggle */}
          <button 
            type="button"
            onClick={() => setNotificationDrawerOpen(true)}
            className="relative p-2 rounded-lg text-slate-400 hover:text-cyan-300 hover:bg-[#0b1326] border border-transparent hover:border-[#1e293b] transition-colors"
            title="Threat Advisories & Alerts"
          >
            <Bell className="w-4 h-4" />
            {notifications.length > 0 && (
              <span className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-rose-500 text-white font-telemetry text-[9px] flex items-center justify-center font-bold shadow-[0_0_8px_rgba(244,63,94,0.6)]">
                {notifications.length}
              </span>
            )}
          </button>

          {/* Refresh Data */}
          <button
            onClick={refreshAllData}
            disabled={isLoading}
            title="Sync Satellite & Radar Telemetry"
            className="p-2 rounded-lg text-slate-400 hover:text-cyan-300 hover:bg-[#0b1326] border border-transparent hover:border-[#1e293b] transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-cyan-400' : ''}`} />
          </button>

          {/* Broadcast Advisory Kinetic Button */}
          <button 
            type="button"
            onClick={handleAiImpactAnalysis}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-red-600 via-rose-600 to-red-500 hover:opacity-95 text-white font-headline text-xs font-bold tracking-wide uppercase shadow-[0_0_16px_rgba(255,51,102,0.5)] transition-all hover:scale-[1.02]"
          >
            <Radio className="w-4 h-4 animate-pulse" />
            <span className="hidden sm:inline">BROADCAST ADVISORY</span>
          </button>
        </div>
      </header>

      {/* Command Palette Modal (Ctrl/Cmd+K) */}
      {commandPaletteOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-start justify-center pt-24 bg-[#070d18]/80 backdrop-blur-md animate-in fade-in duration-150"
          onClick={() => setCommandPaletteOpen(false)}
        >
          <div 
            className="w-full max-w-2xl bg-[#0b1326] rounded-xl shadow-[0_20px_40px_-8px_rgba(0,0,0,0.85)] border border-[#1e293b] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center px-4 py-3 border-b border-[#1e293b]">
              <Terminal className="w-5 h-5 text-[#00e5ff] mr-3 shrink-0" />
              <input 
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                autoFocus
                placeholder="Search cyclones, radar telemetry, hospitals, evacuation corridors..."
                className="w-full bg-transparent font-telemetry text-xs text-white outline-none placeholder:text-slate-500"
              />
              <button 
                onClick={() => setCommandPaletteOpen(false)}
                className="text-slate-400 hover:text-white font-telemetry text-[10px] px-2 py-0.5 rounded bg-[#0f1a30] border border-[#1e293b]"
              >
                ESC
              </button>
            </div>

            <div className="p-3 max-h-80 overflow-y-auto space-y-3 font-telemetry">
              {/* Active Systems */}
              <div className="space-y-1">
                <span className="px-2 text-[10px] text-slate-500 uppercase tracking-wider font-bold">Active Cyclones</span>
                {filteredCyclones.map(c => (
                  <button
                    key={c.id}
                    onClick={() => {
                      selectCyclone(c.id);
                      setCommandPaletteOpen(false);
                      setActiveTab('cyclone-details');
                    }}
                    className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-[#0f1a30] transition-colors text-left"
                  >
                    <div className="flex items-center gap-2.5">
                      <AlertTriangle className="w-4 h-4 text-rose-400" />
                      <span className="text-xs text-white font-semibold">{c.name} — {c.category} tracking {c.basin}</span>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-950/80 border border-rose-500 text-rose-300 font-bold">
                      {c.wind_speed} KM/H
                    </span>
                  </button>
                ))}
              </div>

              {/* Navigation Shortcuts */}
              <div className="space-y-1 pt-1 border-t border-[#1e293b]">
                <span className="px-2 text-[10px] text-slate-500 uppercase tracking-wider font-bold">Quick Navigation</span>
                <button
                  onClick={() => { setActiveTab('analysis'); setCommandPaletteOpen(false); }}
                  className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-[#0f1a30] transition-colors text-left"
                >
                  <div className="flex items-center gap-2.5">
                    <Layers className="w-4 h-4 text-[#00e5ff]" />
                    <span className="text-xs text-white">Multi-Hazard Risk Breakdown Matrix</span>
                  </div>
                  <span className="text-[10px] text-cyan-400 uppercase">ANALYSIS</span>
                </button>
                <button
                  onClick={() => { setActiveTab('landfall'); setCommandPaletteOpen(false); }}
                  className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-[#0f1a30] transition-colors text-left"
                >
                  <div className="flex items-center gap-2.5">
                    <MapPin className="w-4 h-4 text-amber-400" />
                    <span className="text-xs text-white">Eye-wall Landfall Intercept & Buffer Zones</span>
                  </div>
                  <span className="text-[10px] text-amber-400 uppercase">LANDFALL</span>
                </button>
                <button
                  onClick={() => { setActiveTab('infrastructure'); setCommandPaletteOpen(false); }}
                  className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-[#0f1a30] transition-colors text-left"
                >
                  <div className="flex items-center gap-2.5">
                    <Hospital className="w-4 h-4 text-cyan-300" />
                    <span className="text-xs text-white">Lifeline Infrastructure Exposure Catalog</span>
                  </div>
                  <span className="text-[10px] text-cyan-300 uppercase">INFRASTRUCTURE</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Advisory Stream / Notification Slide-Out Drawer */}
      <div 
        className={`fixed top-0 right-0 h-full w-96 max-w-full bg-[#070d18] z-50 shadow-[0_8px_32px_rgba(0,0,0,0.8)] border-l border-[#1e293b] transform transition-transform duration-300 flex flex-col justify-between ${
          notificationDrawerOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="p-4 border-b border-[#1e293b] flex items-center justify-between bg-[#0b1326]">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-[#00e5ff]" />
            <h3 className="font-headline text-sm font-semibold text-white">Advisory Stream & Alerts</h3>
          </div>
          <button 
            onClick={() => setNotificationDrawerOpen(false)}
            className="text-slate-400 hover:text-white p-1 rounded hover:bg-[#0f1a30]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-2.5 font-telemetry">
          {notifications.map(n => (
            <div 
              key={n.id}
              className={`p-3 rounded-lg bg-[#0d1527] border flex flex-col gap-1 transition-all ${
                n.type === 'critical' ? 'border-rose-500/50 shadow-[0_0_12px_rgba(255,51,102,0.15)]' :
                n.type === 'warning' ? 'border-amber-500/40' : 'border-[#1e293b]'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className={`text-[10px] uppercase font-bold ${
                  n.type === 'critical' ? 'text-rose-300' :
                  n.type === 'warning' ? 'text-amber-300' : 'text-[#00e5ff]'
                }`}>
                  {n.title}
                </span>
                <span className="text-[9px] text-slate-500">{n.timestamp}</span>
              </div>
              <p className="text-xs text-slate-200 font-sans leading-relaxed">{n.message}</p>
              <button 
                onClick={() => dismissNotification(n.id)}
                className="self-end text-[10px] text-slate-400 hover:text-cyan-300 pt-1"
              >
                Dismiss
              </button>
            </div>
          ))}

          {notifications.length === 0 && (
            <div className="p-8 text-center text-slate-500 text-xs">
              All meteorological corridors nominal. Zero urgent advisories.
            </div>
          )}
        </div>

        <div className="p-3 border-t border-[#1e293b] bg-[#0b1326]">
          <button 
            onClick={() => setNotificationDrawerOpen(false)}
            className="w-full py-2 rounded bg-gradient-to-r from-cyan-400 to-[#00e5ff] text-[#070d18] font-headline font-bold text-xs uppercase tracking-wider shadow-[0_0_16px_rgba(0,229,255,0.4)]"
          >
            ACKNOWLEDGE ALL
          </button>
        </div>
      </div>
    </>
  );
};

export default TopStatusBar;
