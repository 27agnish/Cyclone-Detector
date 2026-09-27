import React, { useState } from 'react';
import { 
  FileText, 
  Printer, 
  Copy, 
  Sparkles, 
  AlertTriangle, 
  CheckCircle2, 
  ShieldAlert, 
  Download 
} from 'lucide-react';
import { useCycloneStore } from '../store/cycloneStore';
import { aiApi } from '../services/aiApi';
import { AIResponse } from '../types/cyclone';

export const Reports: React.FC = () => {
  const { cycloneDetail, selectedCycloneId, infrastructure, populationExposure } = useCycloneStore();
  const [report, setReport] = useState<AIResponse | null>(null);
  const [generating, setGenerating] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleGenerateReport = async () => {
    setGenerating(true);
    try {
      const res = await aiApi.generateReport(selectedCycloneId);
      setReport(res);
    } catch (e) {
      console.error(e);
    } finally {
      setGenerating(false);
    }
  };

  const handleCopy = () => {
    if (report?.content) {
      navigator.clipboard.writeText(report.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="flex-1 p-6 space-y-6 overflow-y-auto max-w-5xl mx-auto w-full">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-command-border pb-4">
        <div>
          <h2 className="text-xl font-mono font-bold text-white flex items-center gap-2.5">
            <FileText className="w-5 h-5 text-cyan-400" />
            <span>AI DISASTER BRIEFING & INCIDENT ACTION PLAN</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Automated executive intelligence synthesis combining track history, forecast uncertainty, landfall impact zones, and emergency triage.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleGenerateReport}
            disabled={generating}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-mono text-xs font-semibold shadow-md transition"
          >
            <Sparkles className="w-4 h-4" />
            <span>{generating ? 'SYNTHESIZING REPORT...' : 'GENERATE AI BRIEFING'}</span>
          </button>

          {report && (
            <button
              onClick={() => window.print()}
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-mono transition flex items-center gap-1.5"
            >
              <Printer className="w-4 h-4" />
              <span>PRINT</span>
            </button>
          )}
        </div>
      </div>

      {/* Official Transparency and Limitations Legend */}
      <div className="bg-slate-900 border border-command-border rounded-xl p-4 text-xs space-y-2 font-mono">
        <div className="font-bold text-slate-200 uppercase text-[11px] flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-cyan-400" />
          <span>DATA SOURCE & TRANSPARENCY PROTOCOL:</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2 text-[11px]">
          <div className="bg-slate-950 p-2 rounded border border-cyan-900/40">
            <span className="text-cyan-400 font-bold block">OBSERVED DATA:</span>
            <span className="text-slate-300">IMD RSMC / IBTrACS historical track & telemetry</span>
          </div>
          <div className="bg-slate-950 p-2 rounded border border-rose-900/40">
            <span className="text-rose-400 font-bold block">FORECAST DATA:</span>
            <span className="text-slate-300">Numerical weather prediction track positions</span>
          </div>
          <div className="bg-slate-950 p-2 rounded border border-yellow-900/40">
            <span className="text-yellow-400 font-bold block">MODEL-DERIVED:</span>
            <span className="text-slate-300">CycloneShield AI risk scores, cones & surge</span>
          </div>
          <div className="bg-slate-950 p-2 rounded border border-emerald-900/40">
            <span className="text-emerald-400 font-bold block">DEMO DATA:</span>
            <span className="text-slate-300">Simulated operational training scenario</span>
          </div>
        </div>
      </div>

      {/* Report Display */}
      {generating ? (
        <div className="py-20 flex flex-col items-center justify-center space-y-4 bg-command-card border border-command-border rounded-xl">
          <div className="w-12 h-12 rounded-full border-4 border-cyan-500/20 border-t-cyan-400 animate-spin" />
          <div className="font-mono text-sm text-cyan-300 font-semibold">
            Synthesizing Complete Incident Action Plan...
          </div>
        </div>
      ) : report ? (
        <div className="bg-command-card border border-command-border rounded-xl p-8 shadow-2xl space-y-6">
          <div className="flex items-center justify-between border-b border-command-border pb-4">
            <div>
              <span className="text-[10px] font-mono uppercase bg-cyan-950 text-cyan-300 border border-cyan-800 px-2 py-0.5 rounded font-bold">
                INCIDENT ACTION PLAN
              </span>
              <h3 className="text-xl font-mono font-bold text-white mt-1.5">{report.title}</h3>
              <p className="text-xs text-slate-400 mt-0.5">Generated: {report.generated_at} | Model: {report.model_used}</p>
            </div>

            <button
              onClick={handleCopy}
              className="px-3 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono flex items-center gap-1.5 transition"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>{copied ? 'Copied!' : 'Copy Markdown'}</span>
            </button>
          </div>

          {/* Key Findings */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-lg p-4 space-y-2">
            <div className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider">
              Executive Takeaways:
            </div>
            <ul className="space-y-1.5 text-xs text-slate-200">
              {report.key_findings.map((item, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-cyan-400 font-bold">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Content Body */}
          <div className="prose prose-invert max-w-none text-sm leading-relaxed whitespace-pre-wrap font-sans text-slate-200">
            {report.content}
          </div>

          {/* Recommended Operational Directives */}
          {report.recommended_actions && report.recommended_actions.length > 0 && (
            <div className="bg-slate-900/80 border border-slate-800 rounded-lg p-4 space-y-2">
              <div className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-wider">
                Prioritized Action Checklist:
              </div>
              <ol className="space-y-1.5 text-xs text-slate-200 font-mono">
                {report.recommended_actions.map((act, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-emerald-400 font-bold">{i + 1}.</span>
                    <span>{act}</span>
                  </li>
                ))}
              </ol>
            </div>
          )}

          {/* Disclaimer */}
          <div className="p-3 rounded bg-amber-950/30 border border-amber-900/60 text-[11px] text-amber-300 font-mono">
            <strong>NOTICE:</strong> {report.disclaimer}
          </div>
        </div>
      ) : (
        <div className="bg-command-card border border-command-border/80 border-dashed rounded-xl p-12 text-center space-y-3">
          <FileText className="w-12 h-12 text-slate-600 mx-auto" />
          <h3 className="font-mono text-sm font-semibold text-slate-300">
            No Briefing Report Generated Yet
          </h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Click "GENERATE AI BRIEFING" above to synthesize an automated incident action plan for the active cyclone system.
          </p>
          <button
            onClick={handleGenerateReport}
            className="px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-mono text-xs font-semibold shadow transition"
          >
            Generate Briefing Now
          </button>
        </div>
      )}
    </div>
  );
};
