import React from 'react';
import { 
  AlertTriangle, 
  Users, 
  ShieldAlert, 
  Hospital, 
  Sparkles, 
  ChevronRight, 
  Activity, 
  CheckCircle2, 
  X,
  Radar,
  Waves,
  Wind
} from 'lucide-react';
import { useCycloneStore } from '../../store/cycloneStore';
import { aiApi } from '../../services/aiApi';

export const RiskSummaryPanel: React.FC = () => {
  const {
    cycloneDetail,
    infrastructure,
    populationExposure,
    selectedAsset,
    setSelectedAsset,
    selectedCycloneId,
    riskAssessment,
    openAiModal,
    setIsAiLoading,
    setActiveTab
  } = useCycloneStore();

  const handleExplainAssetRisk = async (assetId: string) => {
    setIsAiLoading(true);
    try {
      const res = await aiApi.explainRisk(selectedCycloneId, assetId);
      openAiModal(res);
    } catch (e) {
      console.error(e);
    } finally {
      setIsAiLoading(false);
    }
  };

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

  const critCount = infrastructure?.critical_assets || 4;
  const highCount = infrastructure?.high_risk_assets || 8;
  const modCount = infrastructure?.moderate_risk_assets || 8;
  const compositeScore = riskAssessment?.overall_cyclone_risk_score ? Math.round(riskAssessment.overall_cyclone_risk_score) : 88;

  // SVG Gauge calculations
  const radius = 48;
  const circumference = 2 * Math.PI * radius; // ~301.6
  const dashOffset = circumference - (compositeScore / 100) * circumference;

  return (
    <div className="w-full lg:w-96 flex flex-col gap-3.5 h-full overflow-y-auto pr-1 select-none font-telemetry">
      {/* 1. Overall Prototype Risk Score Card with Gauge */}
      <div className="bg-[#0d1527] border border-rose-500/30 rounded-xl p-4 shadow-xl relative overflow-hidden">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-200">
            <Activity className="w-4 h-4 text-[#00e5ff]" />
            <span>CYCLONESHIELD AI RISK SCORE</span>
          </div>
          <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-red-950/90 border border-red-500 text-white font-bold uppercase alert-beacon shadow-[0_0_10px_rgba(255,51,102,0.4)]">
            CRITICAL ({compositeScore})
          </span>
        </div>

        {/* Circular Dial Mini Preview */}
        <div className="flex items-center justify-center py-2">
          <div className="relative w-32 h-32 flex items-center justify-center filter drop-shadow-[0_0_16px_rgba(255,51,102,0.5)]">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 120 120">
              <defs>
                <linearGradient id="gaugeGradientMini" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#00e5ff" />
                  <stop offset="50%" stopColor="#ff5370" />
                  <stop offset="100%" stopColor="#ff3366" />
                </linearGradient>
              </defs>
              <circle
                cx="60"
                cy="60"
                r={radius}
                fill="transparent"
                stroke="#1e293b"
                strokeWidth="10"
              />
              <circle
                cx="60"
                cy="60"
                r={radius}
                fill="transparent"
                stroke="url(#gaugeGradientMini)"
                strokeWidth="10"
                strokeDasharray={circumference}
                strokeDashoffset={dashOffset}
                strokeLinecap="round"
                className="transition-all duration-1000 ease-out"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <span className="font-headline text-2xl text-white font-black drop-shadow-[0_0_8px_rgba(255,51,102,0.8)]">
                {compositeScore}
              </span>
              <span className="text-[10px] text-cyan-300 uppercase tracking-widest -mt-1 font-semibold">
                / 100
              </span>
            </div>
          </div>
        </div>

        {/* Threat Level Triage Badges */}
        <div className="grid grid-cols-3 gap-2 text-center pt-2">
          <div className="bg-[#0f1a30] border border-rose-500/40 rounded-lg p-2">
            <div className="text-lg font-bold text-rose-400 font-headline">{critCount}</div>
            <div className="text-[9px] text-slate-400 uppercase font-semibold">Critical</div>
          </div>
          <div className="bg-[#0f1a30] border border-amber-500/40 rounded-lg p-2">
            <div className="text-lg font-bold text-amber-400 font-headline">{highCount}</div>
            <div className="text-[9px] text-slate-400 uppercase font-semibold">High Risk</div>
          </div>
          <div className="bg-[#0f1a30] border border-cyan-500/40 rounded-lg p-2">
            <div className="text-lg font-bold text-cyan-400 font-headline">{modCount}</div>
            <div className="text-[9px] text-slate-400 uppercase font-semibold">Moderate</div>
          </div>
        </div>
      </div>

      {/* 2. Population Exposure Card */}
      {populationExposure && (
        <div className="bg-[#0d1527] border border-[#1e293b] rounded-xl p-4 shadow-xl space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-200">
              <Users className="w-4 h-4 text-[#00e5ff]" />
              <span>POPULATION EXPOSURE</span>
            </div>
            <span className="text-xs font-bold text-white">
              {(populationExposure.total / 1000000).toFixed(2)}M Total
            </span>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex justify-between items-center bg-[#0f1a30] px-2.5 py-1.5 rounded-lg border-l-4 border-rose-500 border border-[#1e293b]">
              <span className="text-slate-300">Critical Zone (0–35km):</span>
              <strong className="text-rose-400 font-bold">{populationExposure.critical.toLocaleString()}</strong>
            </div>
            <div className="flex justify-between items-center bg-[#0f1a30] px-2.5 py-1.5 rounded-lg border-l-4 border-amber-400 border border-[#1e293b]">
              <span className="text-slate-300">High Risk (35–80km):</span>
              <strong className="text-amber-300 font-bold">{(populationExposure.high / 1000000).toFixed(2)}M</strong>
            </div>
            <div className="flex justify-between items-center bg-[#0f1a30] px-2.5 py-1.5 rounded-lg border-l-4 border-cyan-400 border border-[#1e293b]">
              <span className="text-slate-300">Moderate (80–160km):</span>
              <strong className="text-cyan-300 font-bold">{(populationExposure.moderate / 1000000).toFixed(2)}M</strong>
            </div>
          </div>
        </div>
      )}

      {/* 3. Selected Infrastructure Asset Inspection Card */}
      {selectedAsset ? (
        <div className="bg-[#0d1527] border-2 border-cyan-500/60 rounded-xl p-4 shadow-2xl relative space-y-2.5 animate-in fade-in">
          <button 
            onClick={() => setSelectedAsset(null)}
            className="absolute top-2.5 right-2.5 text-slate-400 hover:text-white p-1"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-2">
            <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase ${
              selectedAsset.risk_category === 'CRITICAL' ? 'bg-red-950 text-rose-300 border border-rose-500' :
              selectedAsset.risk_category === 'HIGH' ? 'bg-amber-950 text-amber-300 border border-amber-500' :
              'bg-cyan-950 text-cyan-300 border border-cyan-500'
            }`}>
              {selectedAsset.risk_category} ({selectedAsset.risk_score})
            </span>
            <span className="text-xs text-slate-400 uppercase">{selectedAsset.type}</span>
          </div>

          <div className="text-sm font-headline font-bold text-white leading-tight">
            {selectedAsset.name}
          </div>

          <div className="text-xs text-slate-300 space-y-1">
            <div>Location: <span className="text-white">{selectedAsset.district}, {selectedAsset.state}</span></div>
            <div>Dist from Track: <span className="text-[#00e5ff] font-semibold">{selectedAsset.distance_from_track_km} km</span></div>
            <div>Dist from Landfall: <span className="text-rose-400 font-semibold">{selectedAsset.distance_from_landfall_km} km</span></div>
            <div>Wind Exposure: <span className="text-amber-400 font-semibold">{selectedAsset.wind_exposure_kmh} km/h</span></div>
            <div>Elevation: <span className="text-slate-200">{selectedAsset.elevation_m}m</span></div>
          </div>

          <div className="bg-[#0b1326] p-2.5 rounded-lg border border-[#1e293b] text-[11px] space-y-1">
            <div className="text-slate-400 font-semibold uppercase text-[10px]">Identified Vulnerabilities:</div>
            <ul className="list-disc list-inside text-slate-300 space-y-0.5 font-sans">
              {selectedAsset.risk_factors.map((f, i) => (
                <li key={i}>{f}</li>
              ))}
            </ul>
          </div>

          <button
            onClick={() => handleExplainAssetRisk(selectedAsset.id)}
            className="w-full flex items-center justify-center gap-1.5 py-2 rounded-lg bg-gradient-to-r from-cyan-400 to-[#00e5ff] text-[#070d18] font-headline text-xs font-bold shadow-[0_0_12px_rgba(0,229,255,0.4)] transition"
          >
            <Sparkles className="w-4 h-4" />
            <span>AI EXPLAIN THIS ASSET</span>
          </button>
        </div>
      ) : (
        <div className="bg-[#0d1527]/70 border border-[#1e293b] border-dashed rounded-xl p-4 text-center text-xs text-slate-400">
          Click any infrastructure asset or track point on the map to inspect its real-time vulnerability dossier.
        </div>
      )}

      {/* 4. Action Directives Group */}
      <div className="space-y-2 pt-1">
        <button
          onClick={handleExplainLandfall}
          className="w-full flex items-center justify-between px-4 py-2.5 rounded-lg bg-gradient-to-r from-rose-950/70 to-red-950/70 hover:from-rose-900 hover:to-red-900 border border-rose-500/50 text-white text-xs font-headline font-bold transition shadow-lg group"
        >
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-400 alert-beacon" />
            <span>EXPLAIN LANDFALL RISK</span>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition" />
        </button>

        <button
          onClick={() => setActiveTab('emergency')}
          className="w-full flex items-center justify-between px-4 py-2.5 rounded-lg bg-[#0f1a30] hover:bg-[#13223f] border border-[#1e293b] text-slate-200 text-xs font-headline font-bold transition group"
        >
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#00e5ff]" />
            <span>EMERGENCY PRIORITIES</span>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition" />
        </button>
      </div>
    </div>
  );
};

export default RiskSummaryPanel;
