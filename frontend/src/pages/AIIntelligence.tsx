import React, { useState } from 'react';
import { 
  Sparkles, 
  MapPin, 
  ShieldAlert, 
  Satellite, 
  AlertOctagon, 
  FileText, 
  Copy, 
  CheckCircle2, 
  RefreshCw,
  Terminal,
  Send
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
    if (aiResponse?.content) {
      navigator.clipboard.writeText(aiResponse.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const isGeminiConfigured = healthStatus?.services?.gemini === 'configured';

  return (
    <div className="flex-1 p-6 space-y-6 overflow-y-auto max-w-7xl mx-auto w-full">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-command-border pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-mono font-bold text-white flex items-center gap-2.5">
              <Sparkles className="w-5 h-5 text-cyan-400" />
              <span>AI INTELLIGENCE & NATURAL LANGUAGE ENGINE</span>
            </h2>
            <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold uppercase ${
              isGeminiConfigured 
                ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                : 'bg-cyan-950 text-cyan-300 border border-cyan-800'
            }`}>
              {isGeminiConfigured ? 'GEMINI 2.5 ACTIVE' : 'EXPERT DETERMINISTIC FALLBACK READY'}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Zero-credential client architecture: All prompts are processed server-side through FastAPI with deterministic fallback.
          </p>
        </div>

        <button
          onClick={handleRunAi}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-mono text-xs font-semibold shadow-lg transition"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>{loading ? 'PROCESSING ON BACKEND...' : 'RUN AI INFERENCE'}</span>
        </button>
      </div>

      {/* Module Selector Ribbon */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 font-mono text-xs">
        <button
          onClick={() => { setActiveModule('landfall'); setAiResponse(null); setEmergencyResponse(null); }}
          className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition whitespace-nowrap ${
            activeModule === 'landfall'
              ? 'bg-cyan-950/80 border-cyan-500 text-cyan-300 shadow'
              : 'bg-command-card border-command-border text-slate-400 hover:text-white'
          }`}
        >
          <MapPin className="w-4 h-4 text-rose-400" />
          <span>Explain Landfall Risk</span>
        </button>

        <button
          onClick={() => { setActiveModule('risk'); setAiResponse(null); setEmergencyResponse(null); }}
          className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition whitespace-nowrap ${
            activeModule === 'risk'
              ? 'bg-cyan-950/80 border-cyan-500 text-cyan-300 shadow'
              : 'bg-command-card border-command-border text-slate-400 hover:text-white'
          }`}
        >
          <ShieldAlert className="w-4 h-4 text-amber-400" />
          <span>Explain Asset Risk</span>
        </button>

        <button
          onClick={() => { setActiveModule('satellite'); setAiResponse(null); setEmergencyResponse(null); }}
          className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition whitespace-nowrap ${
            activeModule === 'satellite'
              ? 'bg-cyan-950/80 border-cyan-500 text-cyan-300 shadow'
              : 'bg-command-card border-command-border text-slate-400 hover:text-white'
          }`}
        >
          <Satellite className="w-4 h-4 text-cyan-400" />
          <span>Analyze SAR Satellite</span>
        </button>

        <button
          onClick={() => { setActiveModule('emergency'); setAiResponse(null); setEmergencyResponse(null); }}
          className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition whitespace-nowrap ${
            activeModule === 'emergency'
              ? 'bg-cyan-950/80 border-cyan-500 text-cyan-300 shadow'
              : 'bg-command-card border-command-border text-slate-400 hover:text-white'
          }`}
        >
          <AlertOctagon className="w-4 h-4 text-red-500" />
          <span>Generate Emergency Plan</span>
        </button>

        <button
          onClick={() => { setActiveModule('report'); setAiResponse(null); setEmergencyResponse(null); }}
          className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition whitespace-nowrap ${
            activeModule === 'report'
              ? 'bg-cyan-950/80 border-cyan-500 text-cyan-300 shadow'
              : 'bg-command-card border-command-border text-slate-400 hover:text-white'
          }`}
        >
          <FileText className="w-4 h-4 text-emerald-400" />
          <span>Generate Action Briefing</span>
        </button>
      </div>

      {/* Target Context Selector (if asset risk) */}
      {activeModule === 'risk' && infrastructure && (
        <div className="bg-command-card border border-command-border rounded-xl p-4 flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
          <span className="text-slate-300">Select Lifeline Infrastructure Asset for Deep Risk Evaluation:</span>
          <select
            value={selectedAssetId}
            onChange={(e) => setSelectedAssetId(e.target.value)}
            className="bg-slate-900 border border-slate-700 text-cyan-300 px-3 py-1.5 rounded focus:outline-none focus:border-cyan-500"
          >
            {infrastructure.assets.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name} ({a.type} | Risk: {a.risk_category} {a.risk_score})
              </option>
            ))}
          </select>
        </div>
      )}

      {/* AI Output Console */}
      <div className="bg-command-card border border-command-border rounded-xl shadow-2xl p-6 min-h-[420px] flex flex-col justify-between space-y-4">
        {loading ? (
          <div className="py-24 flex flex-col items-center justify-center space-y-3 font-mono">
            <div className="w-12 h-12 rounded-full border-4 border-cyan-500/20 border-t-cyan-400 animate-spin" />
            <div className="text-cyan-300 text-sm font-semibold">
              Querying FastAPI Backend AI Gateway...
            </div>
            <p className="text-xs text-slate-400">
              Generating synoptic explanation and vulnerability factors
            </p>
          </div>
        ) : aiResponse ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-command-border pb-3">
              <div>
                <span className="text-[10px] font-mono uppercase bg-cyan-950 text-cyan-300 border border-cyan-800 px-2 py-0.5 rounded font-bold">
                  MODEL: {aiResponse.model_used}
                </span>
                <h3 className="text-lg font-mono font-bold text-white mt-1">{aiResponse.title}</h3>
                <span className="text-xs text-slate-400">Generated: {aiResponse.generated_at}</span>
              </div>

              <button
                onClick={handleCopy}
                className="px-3 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono flex items-center gap-1.5 transition"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
            </div>

            {/* Key Findings Strip */}
            {aiResponse.key_findings && aiResponse.key_findings.length > 0 && (
              <div className="bg-slate-900/80 border border-slate-800 rounded-lg p-3.5 space-y-1.5 font-mono text-xs">
                <span className="text-cyan-400 font-bold uppercase tracking-wider text-[11px]">Primary Findings:</span>
                <ul className="space-y-1 text-slate-200">
                  {aiResponse.key_findings.map((f, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-cyan-400 font-bold">✓</span>
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Content Body */}
            <div className="prose prose-invert max-w-none text-sm leading-relaxed whitespace-pre-wrap font-sans text-slate-200 bg-slate-950/60 p-4 rounded-lg border border-slate-900">
              {aiResponse.content}
            </div>

            {/* Recommended Actions */}
            {aiResponse.recommended_actions && aiResponse.recommended_actions.length > 0 && (
              <div className="bg-slate-900/80 border border-slate-800 rounded-lg p-3.5 space-y-1.5 font-mono text-xs">
                <span className="text-emerald-400 font-bold uppercase tracking-wider text-[11px]">Recommended Protocols:</span>
                <ol className="space-y-1 text-slate-200">
                  {aiResponse.recommended_actions.map((act, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-emerald-400 font-bold">{i + 1}.</span>
                      <span>{act}</span>
                    </li>
                  ))}
                </ol>
              </div>
            )}

            {/* Mandatory Disclaimer */}
            <div className="p-3 rounded bg-amber-950/30 border border-amber-900/60 text-[11px] text-amber-300 font-mono">
              <strong>DISCLAIMER:</strong> {aiResponse.disclaimer}
            </div>
          </div>
        ) : emergencyResponse ? (
          <div className="space-y-4">
            <div className="border-b border-command-border pb-3">
              <span className="text-[10px] font-mono uppercase bg-red-950 text-red-300 border border-red-800 px-2 py-0.5 rounded font-bold">
                EMERGENCY PRIORITY CHECKLIST
              </span>
              <h3 className="text-lg font-mono font-bold text-white mt-1">
                Ranked Lifeline Directives for {selectedCycloneId}
              </h3>
              <span className="text-xs text-slate-400">Generated: {emergencyResponse.generated_at}</span>
            </div>

            <div className="space-y-2.5">
              {emergencyResponse.priorities.map((item) => (
                <div key={item.rank} className="bg-slate-900/90 border border-slate-800 p-3 rounded-lg text-xs font-mono space-y-1">
                  <div className="flex justify-between items-center text-white">
                    <span className="font-bold text-cyan-300">#{item.rank} - {item.name} ({item.type})</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      item.risk_level === 'CRITICAL' ? 'bg-red-950 text-red-300 border border-red-800' : 'bg-orange-950 text-orange-300'
                    }`}>
                      {item.risk_level} | {item.urgency}
                    </span>
                  </div>
                  <div className="text-slate-300 font-sans">{item.priority_action}</div>
                  <div className="text-[11px] text-slate-400 italic">{item.rationale}</div>
                </div>
              ))}
            </div>

            <div className="p-3 rounded bg-amber-950/30 border border-amber-900/60 text-[11px] text-amber-300 font-mono">
              <strong>DISCLAIMER:</strong> {emergencyResponse.disclaimer}
            </div>
          </div>
        ) : (
          <div className="my-auto text-center space-y-3 py-16">
            <Terminal className="w-12 h-12 text-slate-600 mx-auto" />
            <h4 className="font-mono text-sm font-bold text-slate-300">AI Inference Console Ready</h4>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Select an AI module above and click "RUN AI INFERENCE" to execute the analysis through the FastAPI backend.
            </p>
            <button
              onClick={handleRunAi}
              className="px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-mono text-xs font-semibold shadow transition"
            >
              Run Inference Now
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AIIntelligence;
