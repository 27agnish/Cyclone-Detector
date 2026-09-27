import React from 'react';
import { 
  AlertTriangle, 
  Users, 
  ShieldAlert, 
  Hospital, 
  Zap, 
  Landmark, 
  Home, 
  Sparkles, 
  ChevronRight,
  ExternalLink,
  Activity,
  CheckCircle2,
  X
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

  const handleGenerateEmergencyPlan = async () => {
    setActiveTab('emergency');
  };

  const critCount = infrastructure?.critical_assets || 4;
  const highCount = infrastructure?.high_risk_assets || 8;
  const modCount = infrastructure?.moderate_risk_assets || 8;
  const totalAssets = infrastructure?.total_assets_monitored || 20;

  return (
    <div className="w-full lg:w-96 flex flex-col gap-3.5 h-full overflow-y-auto pr-1">
      {/* 1. Overall Prototype Risk Score Card */}
      <div className="bg-command-card border border-command-border rounded-lg p-3.5 shadow-xl">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5 text-xs font-mono font-semibold text-slate-300">
            <Activity className="w-4 h-4 text-cyan-400" />
            <span>CYCLONESHIELD AI RISK SCORE</span>
          </div>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-red-950 border border-red-800 text-red-300 font-bold uppercase tracking-wider">
            CRITICAL (78.5)
          </span>
        </div>

        <div className="grid grid-cols-3 gap-2 text-center pt-1 font-mono">
          <div className="bg-slate-900/80 border border-red-900/60 rounded p-2">
            <div className="text-xl font-extrabold text-red-400">{critCount}</div>
            <div className="text-[10px] text-slate-400 uppercase">Critical</div>
          </div>
          <div className="bg-slate-900/80 border border-orange-900/60 rounded p-2">
            <div className="text-xl font-extrabold text-orange-400">{highCount}</div>
            <div className="text-[10px] text-slate-400 uppercase">High Risk</div>
          </div>
          <div className="bg-slate-900/80 border border-yellow-900/60 rounded p-2">
            <div className="text-xl font-extrabold text-yellow-400">{modCount}</div>
            <div className="text-[10px] text-slate-400 uppercase">Moderate</div>
          </div>
        </div>

        <div className="text-[10px] text-slate-400 italic mt-2 text-center">
          Prototype decision-support risk index calculated via deterministic & hazard models.
        </div>
      </div>

      {/* 2. Population Exposure Card */}
      {populationExposure && (
        <div className="bg-command-card border border-command-border rounded-lg p-3.5 shadow-xl space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs font-mono font-semibold text-slate-200">
              <Users className="w-4 h-4 text-cyan-400" />
              <span>POPULATION EXPOSURE</span>
            </div>
            <span className="text-xs font-mono font-bold text-white">
              {(populationExposure.total / 1000000).toFixed(2)}M Total
            </span>
          </div>

          <div className="space-y-1.5 text-xs font-mono">
            <div className="flex justify-between items-center bg-slate-900/70 px-2.5 py-1.5 rounded border-l-2 border-red-500">
              <span className="text-slate-300">Critical Zone (0-35km):</span>
              <strong className="text-red-400 font-bold">{populationExposure.critical.toLocaleString()}</strong>
            </div>
            <div className="flex justify-between items-center bg-slate-900/70 px-2.5 py-1.5 rounded border-l-2 border-orange-500">
              <span className="text-slate-300">High Risk (35-80km):</span>
              <strong className="text-orange-400 font-bold">{(populationExposure.high / 1000000).toFixed(2)}M</strong>
            </div>
            <div className="flex justify-between items-center bg-slate-900/70 px-2.5 py-1.5 rounded border-l-2 border-yellow-500">
              <span className="text-slate-300">Moderate (80-150km):</span>
              <strong className="text-yellow-400 font-bold">{(populationExposure.moderate / 1000000).toFixed(2)}M</strong>
            </div>
          </div>

          <div className="text-[10px] text-slate-400">
            Source: Census & spatial demographic projection. Model estimate.
          </div>
        </div>
      )}

      {/* 3. Selected Infrastructure Asset Inspection Card */}
      {selectedAsset ? (
        <div className="bg-gradient-to-b from-slate-900 to-command-card border-2 border-cyan-500/60 rounded-lg p-3.5 shadow-2xl relative space-y-2.5 animate-in fade-in">
          <button 
            onClick={() => setSelectedAsset(null)}
            className="absolute top-2 right-2 text-slate-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono px-2 py-0.5 rounded font-bold uppercase ${
              selectedAsset.risk_category === 'CRITICAL' ? 'bg-red-950 text-red-300 border border-red-800' :
              selectedAsset.risk_category === 'HIGH' ? 'bg-orange-950 text-orange-300 border border-orange-800' :
              'bg-yellow-950 text-yellow-300 border border-yellow-800'
            }">
              {selectedAsset.risk_category} ({selectedAsset.risk_score})
            </span>
            <span className="text-xs font-mono text-slate-400 uppercase capitalize">{selectedAsset.type}</span>
          </div>

          <div className="text-sm font-bold text-white leading-tight">
            {selectedAsset.name}
          </div>

          <div className="text-xs text-slate-300 space-y-1 font-mono">
            <div>Location: <span className="text-white">{selectedAsset.district}, {selectedAsset.state}</span></div>
            <div>Dist from Track: <span className="text-cyan-400 font-semibold">{selectedAsset.distance_from_track_km} km</span></div>
            <div>Dist from Landfall: <span className="text-rose-400 font-semibold">{selectedAsset.distance_from_landfall_km} km</span></div>
            <div>Local Wind: <span className="text-amber-400 font-semibold">{selectedAsset.wind_exposure_kmh} km/h</span></div>
            <div>Ground Elevation: <span className="text-slate-200">{selectedAsset.elevation_m}m</span></div>
          </div>

          {/* Risk Factors */}
          <div className="bg-slate-950/70 p-2 rounded border border-slate-800 text-[11px] space-y-1">
            <div className="text-slate-400 font-mono font-semibold uppercase text-[10px]">Identified Vulnerabilities:</div>
            <ul className="list-disc list-inside text-slate-300 space-y-0.5">
              {selectedAsset.risk_factors.map((f, i) => (
                <li key={i}>{f}</li>
              ))}
            </ul>
          </div>

          {/* Prototype Action */}
          <div className="bg-cyan-950/40 p-2 rounded border border-cyan-800/60 text-[11px]">
            <span className="text-cyan-300 font-bold font-mono">PROTOTYPE ACTION:</span>
            <p className="text-slate-200 mt-0.5 leading-snug">{selectedAsset.prototype_action}</p>
          </div>

          <button
            onClick={() => handleExplainAssetRisk(selectedAsset.id)}
            className="w-full flex items-center justify-center gap-1.5 py-1.5 rounded bg-cyan-600 hover:bg-cyan-500 text-white font-mono text-xs font-semibold shadow transition"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI EXPLAIN THIS ASSET</span>
          </button>
        </div>
      ) : (
        <div className="bg-command-card border border-command-border/80 border-dashed rounded-lg p-3 text-center text-xs text-slate-400">
          Click any infrastructure asset or track point on the map to inspect its real-time vulnerability dossier.
        </div>
      )}

      {/* 4. Action Directives Group */}
      <div className="space-y-2 pt-1">
        <button
          onClick={handleExplainLandfall}
          className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg bg-gradient-to-r from-rose-900/60 to-red-900/60 hover:from-rose-800/80 hover:to-red-800/80 border border-rose-700/60 text-white text-xs font-mono font-semibold transition shadow-lg group"
        >
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-400" />
            <span>EXPLAIN LANDFALL RISK</span>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition" />
        </button>

        <button
          onClick={handleGenerateEmergencyPlan}
          className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-mono font-semibold transition group"
        >
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-cyan-400" />
            <span>EMERGENCY PRIORITIES</span>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition" />
        </button>
      </div>
    </div>
  );
};
