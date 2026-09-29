import React, { useState } from 'react';
import { 
  Sparkles, 
  MapPin, 
  ShieldAlert, 
  Satellite, 
  AlertOctagon, 
  FileText, 
  Copy, 
  Check, 
  RefreshCw,
  Terminal,
  Send,
  Brain,
  Layers
} from 'lucide-react';
import { useCycloneStore } from '../store/cycloneStore';
import { aiApi } from '../services/aiApi';
import { AIResponse, EmergencyPriorityResponse } from '../types/cyclone';

export const AIIntelligence: React.FC = () => {
  const { 
    selectedCycloneId, 
    cycloneDetail, 
    infrastructure,
    healthStatus
  } = useCycloneStore();

  const [activeModule, setActiveModule] = useState<'landfall' | 'risk' | 'satellite' | 'emergency' | 'report'>('landfall');
  const [selectedAssetId, setSelectedAssetId] = useState<string>('hosp_1');
  const [loading, setLoading] = useState(false);
  const [aiResponse, setAiResponse] = useState<AIResponse | null>(null);
  const [emergencyResponse, setEmergencyResponse] = useState<EmergencyPriorityResponse | null>(null);
  const [copied, setCopied] = useState(false);

  const handleRunAi = async () => {
    setLoading(true);
    setAiResponse(null);
    setEmergencyResponse(null);
    try {
      if (activeModule === 'landfall') {
        const res = await aiApi.explainLandfall(selectedCycloneId);
        setAiResponse(res);
      } else if (activeModule === 'risk') {
        const res = await aiApi.explainRisk(selectedCycloneId, selectedAssetId);
        setAiResponse(res);
      } else if (activeModule === 'satellite') {
        const res = await aiApi.analyzeSatellite(selectedCycloneId);
        setAiResponse(res);
      } else if (activeModule === 'emergency') {
        const res = await aiApi.generateEmergencyPlan(selectedCycloneId);
        setEmergencyResponse(res);
      } else if (activeModule === 'report') {
        const res = await aiApi.generateReport(selectedCycloneId);
        setAiResponse(res);
      }
    } catch (e) {
      console.error('[CycloneShield AI Studio Error]:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    const text = aiResponse?.content || JSON.stringify(emergencyResponse, null, 2);
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const assets = infrastructure?.assets || [];

  return (
    <div className="flex-1 p-4 lg:p-6 space-y-6 overflow-y-auto w-full bg-[#070d18] text-[#dee2f1] select-none font-telemetry">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#1e293b] pb-4">
        <div>
          <h2 className="text-xl lg:text-2xl font-headline font-bold text-white flex items-center gap-2.5">
            <Brain className="w-6 h-6 text-[#00e5ff]" />
            <span>AI REASONING & EXPLAINABLE INTELLIGENCE STUDIO</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Google Gemini Pro / Flash synthesis engine with heuristic deterministic meteorological fallback.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-400">AI Core Status:</span>
          <span className="px-2.5 py-1 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-400/50 font-bold flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-cyan-400 pulse-beacon" />
            ONLINE (GEMINI + DETERMINISTIC)
          </span>
        </div>
      </div>

      {/* Module Selector Toolbar */}
      <div className="flex flex-wrap items-center gap-2.5 bg-[#0d1527] p-2 rounded-xl border border-[#1e293b]">
        <button
          onClick={() => setActiveModule('landfall')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-headline font-bold transition ${
            activeModule === 'landfall'
              ? 'bg-gradient-to-r from-cyan-400 to-[#00e5ff] text-[#070d18] shadow-[0_0_12px_rgba(0,229,255,0.4)]'
              : 'text-slate-300 hover:bg-[#0f1a30]'
          }`}
        >
          <MapPin className="w-4 h-4" />
          <span>Explain Landfall</span>
        </button>

        <button
          onClick={() => setActiveModule('risk')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-headline font-bold transition ${
            activeModule === 'risk'
              ? 'bg-gradient-to-r from-cyan-400 to-[#00e5ff] text-[#070d18] shadow-[0_0_12px_rgba(0,229,255,0.4)]'
              : 'text-slate-300 hover:bg-[#0f1a30]'
          }`}
        >
          <ShieldAlert className="w-4 h-4" />
          <span>Explain Asset Risk</span>
        </button>

        <button
          onClick={() => setActiveModule('satellite')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-headline font-bold transition ${
            activeModule === 'satellite'
              ? 'bg-gradient-to-r from-cyan-400 to-[#00e5ff] text-[#070d18] shadow-[0_0_12px_rgba(0,229,255,0.4)]'
              : 'text-slate-300 hover:bg-[#0f1a30]'
          }`}
        >
          <Satellite className="w-4 h-4" />
          <span>Multimodal SAR Flood</span>
        </button>

        <button
          onClick={() => setActiveModule('emergency')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-headline font-bold transition ${
            activeModule === 'emergency'
              ? 'bg-gradient-to-r from-cyan-400 to-[#00e5ff] text-[#070d18] shadow-[0_0_12px_rgba(0,229,255,0.4)]'
              : 'text-slate-300 hover:bg-[#0f1a30]'
          }`}
        >
          <AlertOctagon className="w-4 h-4" />
          <span>Emergency Priorities</span>
        </button>

        <button
          onClick={() => setActiveModule('report')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-headline font-bold transition ${
            activeModule === 'report'
              ? 'bg-gradient-to-r from-cyan-400 to-[#00e5ff] text-[#070d18] shadow-[0_0_12px_rgba(0,229,255,0.4)]'
              : 'text-slate-300 hover:bg-[#0f1a30]'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Incident Action Report</span>
        </button>
      </div>

      {/* Main Studio Viewport */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Controls & Configuration (4 Cols) */}
        <div className="lg:col-span-4 bg-[#0d1527] border border-[#1e293b] rounded-xl p-5 shadow-xl space-y-4">
          <h3 className="font-headline text-sm font-bold text-white uppercase tracking-wider">
            INFERENCE PARAMETERS
          </h3>

          <div className="space-y-3 text-xs">
            <div>
              <label className="text-slate-400 block mb-1">Target Active Cyclone</label>
              <input
                type="text"
                readOnly
                value={`${cycloneDetail?.name || selectedCycloneId} (${cycloneDetail?.category || 'Active'})`}
                className="w-full bg-[#0f1a30] border border-[#1e293b] rounded-lg p-2 text-white font-mono"
              />
            </div>

            {activeModule === 'risk' && (
              <div>
                <label className="text-slate-400 block mb-1">Target Infrastructure Asset</label>
                <select
                  value={selectedAssetId}
                  onChange={(e) => setSelectedAssetId(e.target.value)}
                  className="w-full bg-[#0f1a30] border border-[#1e293b] rounded-lg p-2 text-cyan-300"
                >
                  {assets.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.name} ({a.type} • {a.risk_category})
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="p-3 bg-[#0b1326] rounded-lg border border-[#1e293b] space-y-1">
              <span className="text-[10px] text-slate-400 uppercase font-bold">FastAPI Endpoint</span>
              <div className="text-cyan-300 font-mono text-[11px]">
                {activeModule === 'landfall' && 'POST /api/v1/ai/explain-landfall'}
                {activeModule === 'risk' && 'POST /api/v1/ai/explain-risk'}
                {activeModule === 'satellite' && 'POST /api/v1/ai/analyze-satellite'}
                {activeModule === 'emergency' && 'POST /api/v1/ai/generate-emergency-plan'}
                {activeModule === 'report' && 'POST /api/v1/ai/generate-report'}
              </div>
            </div>
          </div>

          <button
            onClick={handleRunAi}
            disabled={loading}
            className="w-full py-2.5 rounded-lg bg-gradient-to-r from-cyan-400 to-[#00e5ff] text-[#070d18] font-headline text-xs font-bold shadow-[0_0_16px_rgba(0,229,255,0.4)] transition hover:opacity-95 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <Send className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span>{loading ? 'EXECUTING INFERENCE...' : 'SUBMIT REASONING REQUEST'}</span>
          </button>
        </div>

        {/* Output Console (8 Cols) */}
        <div className="lg:col-span-8 bg-[#0d1527] border border-[#1e293b] rounded-xl p-5 shadow-xl flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#1e293b]">
            <div className="flex items-center gap-2 text-white font-headline text-sm font-bold">
              <Terminal className="w-5 h-5 text-[#00e5ff]" />
              <span>NEURAL SYNTHESIS DOSSIER</span>
            </div>
            {(aiResponse || emergencyResponse) && (
              <button
                onClick={handleCopy}
                className="flex items-center gap-1.5 px-3 py-1 rounded bg-[#0f1a30] hover:bg-[#13223f] border border-[#1e293b] text-xs text-slate-300 hover:text-white transition"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'COPIED' : 'COPY'}</span>
              </button>
            )}
          </div>

          {loading ? (
            <div className="flex-1 flex flex-col items-center justify-center p-12 space-y-3">
              <div className="w-10 h-10 rounded-full border-4 border-cyan-500/20 border-t-[#00e5ff] animate-spin" />
              <div className="text-xs text-cyan-300">FastAPI AI Engine synthesizing situational brief...</div>
            </div>
          ) : aiResponse ? (
            <div className="space-y-4 text-xs font-sans leading-relaxed">
              <div className="p-3.5 rounded-lg bg-[#0b1326] border border-cyan-500/30">
                <span className="text-[10px] font-telemetry uppercase font-bold text-[#00e5ff] block mb-1">
                  EXECUTIVE BRIEF
                </span>
                <p className="text-slate-100 font-semibold">{aiResponse.content}</p>
              </div>

              {aiResponse.key_findings && aiResponse.key_findings.length > 0 && (
                <div className="space-y-2">
                  <span className="text-[10px] font-telemetry uppercase text-slate-400 font-bold block">
                    TACTICAL REASONING POINTS
                  </span>
                  <div className="space-y-2">
                    {aiResponse.key_findings.map((d: string, i: number) => (
                      <div key={i} className="p-3 rounded-lg bg-[#0f1a30] border border-[#1e293b] text-slate-200">
                        {d}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {aiResponse.recommended_actions && aiResponse.recommended_actions.length > 0 && (
                <div className="p-3 rounded-lg bg-emerald-950/40 border border-emerald-500/40 text-emerald-200">
                  <span className="text-[10px] font-telemetry uppercase font-bold block mb-1">
                    OPERATIONAL DIRECTIVES
                  </span>
                  <ul className="list-disc list-inside space-y-1">
                    {aiResponse.recommended_actions.map((r: string, i: number) => (
                      <li key={i}>{r}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ) : emergencyResponse ? (
            <div className="space-y-3">
              {emergencyResponse.priorities.map((p, i) => (
                <div key={i} className="p-3 rounded-lg bg-[#0f1a30] border border-[#1e293b] space-y-1 text-xs">
                  <div className="flex justify-between font-bold text-white">
                    <span>{p.priority_action}</span>
                    <span className="text-rose-400 font-telemetry uppercase">{p.urgency}</span>
                  </div>
                  <p className="text-slate-300 font-sans">{p.rationale}</p>
                  <div className="text-[10px] text-cyan-300 font-telemetry pt-1">
                    Target: {p.name} ({p.type}) • District: {p.district}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-12 text-center text-slate-400 text-xs">
              Select an AI module and click "Submit Reasoning Request" to query the live FastAPI AI endpoint.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AIIntelligence;
