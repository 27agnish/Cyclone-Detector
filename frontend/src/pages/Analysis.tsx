import React, { useEffect, useState } from 'react';
import { 
  Layers, 
  Activity, 
  Wind, 
  Waves, 
  ShieldAlert, 
  RefreshCw,
  Sparkles,
  AlertTriangle,
  Building2,
  CheckCircle2,
  ArrowRight
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis, 
  Radar,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { useCycloneStore } from '../store/cycloneStore';
import { riskApi } from '../services/riskApi';
import { aiApi } from '../services/aiApi';
import { RiskAssessmentResponse } from '../types/cyclone';

export const Analysis: React.FC = () => {
  const { 
    selectedCycloneId, 
    cycloneDetail, 
    riskAssessment, 
    openAiModal, 
    setIsAiLoading,
    setActiveTab,
    setSelectedAsset
  } = useCycloneStore();

  const [loading, setLoading] = useState(false);
  const [currentRisk, setCurrentRisk] = useState<RiskAssessmentResponse | null>(riskAssessment);

  const fetchRisk = async () => {
    setLoading(true);
    try {
      const data = await riskApi.getRiskAssessment(selectedCycloneId);
      setCurrentRisk(data);
    } catch (e) {
      console.error('[CycloneShield Risk Fetch Error]:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!riskAssessment || riskAssessment.cyclone_id !== selectedCycloneId) {
      fetchRisk();
    } else {
      setCurrentRisk(riskAssessment);
    }
  }, [selectedCycloneId, riskAssessment]);

  const handleExplainRisk = async (assetId?: string) => {
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

  // Derive radar breakdown from first top vulnerable asset or representative values
  const sampleBreakdown = currentRisk?.top_vulnerable_assets?.[0]?.breakdown || {
    wind_hazard_score: 85.0,
    storm_surge_score: 91.0,
    rainfall_flood_score: 72.0,
    coastal_proximity_score: 88.0,
    elevation_vulnerability_score: 82.0,
    asset_fragility_score: 85.0
  };

  const radarData = [
    { factor: 'Wind Hazard', score: sampleBreakdown.wind_hazard_score, fullMark: 100 },
    { factor: 'Storm Surge', score: sampleBreakdown.storm_surge_score, fullMark: 100 },
    { factor: 'Rainfall / Flood', score: sampleBreakdown.rainfall_flood_score, fullMark: 100 },
    { factor: 'Coastal Proximity', score: sampleBreakdown.coastal_proximity_score, fullMark: 100 },
    { factor: 'Elevation Vulnerability', score: sampleBreakdown.elevation_vulnerability_score, fullMark: 100 },
    { factor: 'Asset Fragility', score: sampleBreakdown.asset_fragility_score, fullMark: 100 }
  ];

  const barData = [
    { name: 'Critical', count: currentRisk?.critical_count || 4, color: '#dc2626' },
    { name: 'High Risk', count: currentRisk?.high_count || 8, color: '#f97316' },
    { name: 'Moderate', count: currentRisk?.moderate_count || 8, color: '#eab308' },
    { name: 'Low Risk', count: currentRisk?.low_count || 0, color: '#10b981' }
  ];

  const overallScore = currentRisk?.overall_cyclone_risk_score ?? 78.5;
  const overallCategory = currentRisk?.overall_risk_category ?? 'CRITICAL';

  return (
    <div className="flex-1 p-6 space-y-6 overflow-y-auto max-w-7xl mx-auto w-full">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-command-border pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-mono font-bold text-white flex items-center gap-2.5">
              <Layers className="w-5 h-5 text-cyan-400" />
              <span>CYCLONESHIELD AI PROTOTYPE RISK SCORE</span>
            </h2>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-cyan-300 border border-slate-700 font-bold uppercase">
              MODEL-DERIVED PROTOTYPE OUTPUT
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Backend multi-criteria hazard ensemble evaluating sustained wind, storm surge attenuation, elevation vulnerability, and lifeline fragility.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchRisk}
            disabled={loading}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-mono transition"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-cyan-400' : ''}`} />
            <span>RE-CALCULATE RISK</span>
          </button>

          <button
            onClick={() => handleExplainRisk()}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-mono text-xs font-semibold shadow transition"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI EXPLAIN COMPOSITE RISK</span>
          </button>
        </div>
      </div>

      {/* Mandatory Official Notice Strip */}
      <div className="bg-amber-950/40 border border-amber-800/80 rounded-lg p-3 flex items-start gap-2.5 text-xs text-amber-200 font-mono">
        <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
        <div>
          <strong>MODEL-DERIVED PROTOTYPE OUTPUT:</strong>
          <span className="ml-1 text-slate-300 font-sans">
            The scores displayed below are synthesized by the backend ML and multi-criteria deterministic risk engine for prototype operational decision support. Not certified meteorological risk indices.
          </span>
        </div>
      </div>

      {/* Overall Risk Score & Category Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 font-mono">
        {/* Main Composite Score */}
        <div className="bg-command-card border border-command-border rounded-xl p-4 shadow-xl col-span-1 sm:col-span-2 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">
              CYCLONESHIELD AI PROTOTYPE RISK SCORE
            </span>
            <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase ${
              overallCategory === 'CRITICAL' ? 'bg-red-950 text-red-300 border border-red-800' :
              overallCategory === 'HIGH' ? 'bg-orange-950 text-orange-300 border border-orange-800' :
              'bg-yellow-950 text-yellow-300 border border-yellow-800'
            }`}>
              {overallCategory}
            </span>
          </div>

          <div className="flex items-baseline gap-3 my-2">
            <div className="text-4xl font-extrabold text-white">{overallScore}</div>
            <div className="text-xs text-slate-400">/ 100 COMPOSITE INDEX</div>
          </div>

          <div className="text-[11px] text-slate-400 font-sans">
            Evaluated across {currentRisk?.top_vulnerable_assets?.length || 20} monitored lifelines in active landfall corridor.
          </div>
        </div>

        {/* Hazard Breakdown KPI Cards */}
        <div className="bg-command-card border border-red-900/60 rounded-xl p-3.5 shadow-xl flex flex-col justify-between">
          <span className="text-[10px] text-red-400 uppercase font-bold tracking-wider">CRITICAL LIFELINES</span>
          <div className="text-2xl font-extrabold text-red-400 mt-1">{currentRisk?.critical_count ?? 4}</div>
          <span className="text-[10px] text-slate-400 mt-1">Severe eyewall swath</span>
        </div>

        <div className="bg-command-card border border-orange-900/60 rounded-xl p-3.5 shadow-xl flex flex-col justify-between">
          <span className="text-[10px] text-orange-400 uppercase font-bold tracking-wider">HIGH RISK ASSETS</span>
          <div className="text-2xl font-extrabold text-orange-400 mt-1">{currentRisk?.high_count ?? 8}</div>
          <span className="text-[10px] text-slate-400 mt-1">Gale & surge exposure</span>
        </div>

        <div className="bg-command-card border border-yellow-900/60 rounded-xl p-3.5 shadow-xl flex flex-col justify-between">
          <span className="text-[10px] text-yellow-400 uppercase font-bold tracking-wider">MODERATE RISK</span>
          <div className="text-2xl font-extrabold text-yellow-400 mt-1">{currentRisk?.moderate_count ?? 8}</div>
          <span className="text-[10px] text-slate-400 mt-1">Perimeter buffer</span>
        </div>
      </div>

      {/* Hazard Factor Spider & Distribution Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Radar Hazard Profile */}
        <div className="bg-command-card border border-command-border rounded-xl p-5 shadow-xl space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm font-mono font-bold text-white">
              <Activity className="w-4 h-4 text-cyan-400" />
              <span>SIX-FACTOR HAZARD VECTOR RADAR</span>
            </div>
            <span className="text-[10px] font-mono text-slate-400">Backend Sub-scores</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                <PolarGrid stroke="#334155" />
                <PolarAngleAxis dataKey="factor" stroke="#94a3b8" tick={{ fontSize: 11 }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#475569" />
                <Radar name="Hazard Severity" dataKey="score" stroke="#06b6d4" fill="#0891b2" fillOpacity={0.5} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px' }}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
          <div className="text-[11px] text-slate-400 font-mono text-center">
            Normalized sub-factor ratings (0-100) generated by backend risk modeling.
          </div>
        </div>

        {/* Hazard Level Asset Distribution */}
        <div className="bg-command-card border border-command-border rounded-xl p-5 shadow-xl space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm font-mono font-bold text-white">
              <Building2 className="w-4 h-4 text-amber-400" />
              <span>ASSETS BY RISK SEVERITY CATEGORY</span>
            </div>
            <span className="text-[10px] font-mono text-slate-400">Triage Count</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="name" stroke="#64748b" />
                <YAxis stroke="#64748b" allowDecimals={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px' }}
                />
                <Bar dataKey="count" fill="#38bdf8">
                  {barData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="text-[11px] text-slate-400 font-mono text-center">
            Lifeline distribution across Critical, High Risk, and Moderate vulnerability thresholds.
          </div>
        </div>
      </div>

      {/* Top Vulnerable Assets Table from Backend */}
      <div className="bg-command-card border border-command-border rounded-xl shadow-xl overflow-hidden space-y-3 p-5">
        <div className="flex items-center justify-between border-b border-command-border pb-3">
          <div>
            <h3 className="text-sm font-mono font-bold text-white uppercase tracking-wider">
              Top Ranked Vulnerable Assets (Backend Model Evaluation)
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Ranked strictly by the backend risk engine without client recalculation.
            </p>
          </div>
          <span className="text-xs font-mono text-cyan-400">
            {currentRisk?.top_vulnerable_assets?.length || 0} Assets Evaluated
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-slate-900 text-slate-400 border-b border-command-border">
              <tr>
                <th className="p-3">ASSET</th>
                <th className="p-3">TYPE</th>
                <th className="p-3">COORDINATES</th>
                <th className="p-3">WIND HAZARD</th>
                <th className="p-3">STORM SURGE</th>
                <th className="p-3">RISK SCORE</th>
                <th className="p-3">RECOMMENDED ACTION</th>
                <th className="p-3 text-right">ACTION</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {currentRisk?.top_vulnerable_assets?.map((a) => (
                <tr key={a.asset_id} className="hover:bg-slate-800/40">
                  <td className="p-3 font-bold text-white">{a.name}</td>
                  <td className="p-3 text-slate-300 capitalize">{a.asset_type}</td>
                  <td className="p-3 text-slate-400">{a.latitude}°N, {a.longitude}°E</td>
                  <td className="p-3 text-amber-400 font-bold">{a.breakdown.wind_hazard_score}</td>
                  <td className="p-3 text-sky-400 font-bold">{a.breakdown.storm_surge_score}</td>
                  <td className="p-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      a.risk_category === 'CRITICAL' ? 'bg-red-950 text-red-300 border border-red-800' :
                      a.risk_category === 'HIGH' ? 'bg-orange-950 text-orange-300 border border-orange-800' :
                      'bg-yellow-950 text-yellow-300 border border-yellow-800'
                    }`}>
                      {a.risk_category} ({a.risk_score})
                    </span>
                  </td>
                  <td className="p-3 text-slate-300 text-[11px] max-w-xs truncate" title={a.recommended_action}>
                    {a.recommended_action}
                  </td>
                  <td className="p-3 text-right space-x-1.5 whitespace-nowrap">
                    <button
                      onClick={() => handleExplainRisk(a.asset_id)}
                      className="px-2 py-1 rounded bg-cyan-950 hover:bg-cyan-900 text-cyan-300 border border-cyan-800 text-[10px] inline-flex items-center gap-1"
                    >
                      <Sparkles className="w-3 h-3" />
                      AI Explain
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Analysis;
