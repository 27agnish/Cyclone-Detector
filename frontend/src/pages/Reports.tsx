import React, { useState } from 'react';
import { 
  FileText, 
  Printer, 
  Copy, 
  Sparkles, 
  AlertTriangle, 
  CheckCircle2, 
  ShieldAlert, 
  Download,
  Check,
  Building2,
  Users,
  Compass
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
    const text = report?.content || '';
    if (text) {
      navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownload = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify({
      cyclone: cycloneDetail,
      infrastructure: infrastructure,
      population: populationExposure,
      ai_report: report,
      generated_at: new Date().toISOString()
    }, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `cycloneshield_sitrep_${selectedCycloneId}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="flex-1 p-4 lg:p-6 space-y-6 overflow-y-auto w-full max-w-5xl mx-auto bg-[#070d18] text-[#dee2f1] select-none font-telemetry">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#1e293b] pb-4">
        <div>
          <h2 className="text-xl lg:text-2xl font-headline font-bold text-white flex items-center gap-2.5">
            <FileText className="w-6 h-6 text-[#00e5ff]" />
            <span>AI INCIDENT ACTION PLAN & SITUATION REPORT (SITREP)</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Automated executive intelligence synthesis combining track history, forecast uncertainty, landfall impact zones, and emergency triage.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleGenerateReport}
            disabled={generating}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-cyan-400 to-[#00e5ff] text-[#070d18] font-headline text-xs font-bold shadow-[0_0_16px_rgba(0,229,255,0.4)] transition hover:opacity-95 disabled:opacity-50"
          >
            <Sparkles className="w-4 h-4" />
            <span>{generating ? 'SYNTHESIZING REPORT...' : 'GENERATE AI BRIEFING'}</span>
          </button>

          {report && (
            <>
              <button
                onClick={handleCopy}
                className="p-2 rounded-lg bg-[#0f1a30] hover:bg-[#13223f] border border-[#1e293b] text-slate-200 transition"
                title="Copy Briefing"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              </button>

              <button
                onClick={handleDownload}
                className="p-2 rounded-lg bg-[#0f1a30] hover:bg-[#13223f] border border-[#1e293b] text-slate-200 transition"
                title="Export JSON SITREP"
              >
                <Download className="w-4 h-4 text-[#00e5ff]" />
              </button>
            </>
          )}
        </div>
      </div>

      {/* Report Document Shell */}
      <div className="bg-[#0d1527] border border-[#1e293b] rounded-xl p-6 shadow-2xl space-y-6">
        {/* Document Header */}
        <div className="flex flex-wrap items-center justify-between pb-4 border-b border-[#1e293b] text-xs">
          <div>
            <div className="font-headline text-base font-bold text-white">
              INCIDENT ACTION PLAN: {cycloneDetail?.name || selectedCycloneId.toUpperCase()}
            </div>
            <div className="text-slate-400 mt-0.5">
              Target Basin: {cycloneDetail?.basin || 'Bay of Bengal'} • Classified Category: {cycloneDetail?.category || 'Category 4'}
            </div>
          </div>
          <div className="text-right text-slate-400">
            <div>Clearance: <strong className="text-cyan-300">DISASTER MGMT OPERATIONAL</strong></div>
            <div>Generated: <strong className="text-white">{new Date().toLocaleString()}</strong></div>
          </div>
        </div>

        {/* Snapshot Metrics Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="bg-[#0f1a30] border border-[#1e293b] p-3 rounded-lg">
            <span className="text-slate-400 uppercase text-[10px]">Peak Intensity</span>
            <div className="font-headline text-lg font-bold text-rose-400 mt-0.5">
              {cycloneDetail?.wind_speed || 215} km/h
            </div>
          </div>

          <div className="bg-[#0f1a30] border border-[#1e293b] p-3 rounded-lg">
            <span className="text-slate-400 uppercase text-[10px]">Barometric Min</span>
            <div className="font-headline text-lg font-bold text-cyan-300 mt-0.5">
              {cycloneDetail?.central_pressure || 942} hPa
            </div>
          </div>

          <div className="bg-[#0f1a30] border border-[#1e293b] p-3 rounded-lg">
            <span className="text-slate-400 uppercase text-[10px]">Critical Population</span>
            <div className="font-headline text-lg font-bold text-white mt-0.5">
              {populationExposure?.critical.toLocaleString() || '485,000'}
            </div>
          </div>

          <div className="bg-[#0f1a30] border border-[#1e293b] p-3 rounded-lg">
            <span className="text-slate-400 uppercase text-[10px]">Critical Assets</span>
            <div className="font-headline text-lg font-bold text-amber-400 mt-0.5">
              {infrastructure?.critical_assets || 4} at risk
            </div>
          </div>
        </div>

        {/* Report Narrative Content */}
        {generating ? (
          <div className="p-12 text-center space-y-3">
            <div className="w-10 h-10 rounded-full border-4 border-cyan-500/20 border-t-[#00e5ff] animate-spin mx-auto" />
            <div className="text-xs text-cyan-300">Synthesizing multi-hazard operational incident action report...</div>
          </div>
        ) : report ? (
          <div className="space-y-4 font-sans text-xs leading-relaxed text-slate-200">
            <div className="p-4 bg-[#0b1326] border border-cyan-500/40 rounded-xl space-y-2">
              <span className="font-telemetry text-[11px] text-[#00e5ff] font-bold uppercase tracking-wider block">
                EXECUTIVE SUMMARY & SITUATION BRIEF
              </span>
              <p className="text-white font-medium text-sm leading-relaxed">{report.content}</p>
            </div>

            {report.key_findings && report.key_findings.length > 0 && (
              <div className="space-y-2">
                <span className="font-telemetry text-[11px] text-slate-400 font-bold uppercase tracking-wider block">
                  HAZARD & VULNERABILITY KEY FINDINGS
                </span>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {report.key_findings.map((d: string, i: number) => (
                    <div key={i} className="p-3 bg-[#0f1a30] border border-[#1e293b] rounded-lg">
                      {d}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {report.recommended_actions && report.recommended_actions.length > 0 && (
              <div className="p-4 bg-emerald-950/30 border border-emerald-500/40 rounded-xl space-y-2">
                <span className="font-telemetry text-[11px] text-emerald-300 font-bold uppercase tracking-wider block">
                  TACTICAL INCIDENT DIRECTIVES (SOP ACTION LIST)
                </span>
                <ul className="list-disc list-inside space-y-1 text-slate-200">
                  {report.recommended_actions.map((r: string, i: number) => (
                    <li key={i}>{r}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ) : (
          <div className="p-12 text-center text-slate-400 text-xs">
            Click "Generate AI Briefing" to compile a real-time Incident Action Plan for {cycloneDetail?.name || selectedCycloneId}.
          </div>
        )}
      </div>
    </div>
  );
};

export default Reports;
