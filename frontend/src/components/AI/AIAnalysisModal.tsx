import React from 'react';
import { X, Sparkles, AlertTriangle, ShieldCheck, Printer, CheckSquare, Copy, Check } from 'lucide-react';
import { useCycloneStore } from '../../store/cycloneStore';

export const AIAnalysisModal: React.FC = () => {
  const { aiModalOpen, aiModalData, isAiLoading, closeAiModal } = useCycloneStore();
  const [copied, setCopied] = React.useState(false);

  if (!aiModalOpen && !isAiLoading) return null;

  const handleCopy = () => {
    if (aiModalData?.content) {
      navigator.clipboard.writeText(aiModalData.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-[600] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
      <div className="bg-command-surface border border-command-border rounded-xl shadow-2xl w-full max-w-3xl max-h-[85vh] flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-4 bg-command-card border-b border-command-border">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 text-white shadow">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-mono font-bold text-base text-white">
                {isAiLoading ? 'GENERATING AI DISASTER INTELLIGENCE...' : aiModalData?.title || 'AI Decision Support Briefing'}
              </h3>
              <p className="text-[11px] text-slate-400 font-sans">
                {aiModalData?.model_used ? `Model: ${aiModalData.model_used}` : 'Google Gemini / Vertex AI Multi-Hazard Engine'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {!isAiLoading && (
              <>
                <button
                  onClick={handleCopy}
                  title="Copy Briefing"
                  className="p-2 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition text-xs flex items-center gap-1 font-mono"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  <span className="hidden sm:inline">{copied ? 'Copied' : 'Copy'}</span>
                </button>
                <button
                  onClick={handlePrint}
                  title="Print Report"
                  className="p-2 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition text-xs flex items-center gap-1 font-mono"
                >
                  <Printer className="w-4 h-4" />
                  <span className="hidden sm:inline">Print</span>
                </button>
              </>
            )}
            <button
              onClick={closeAiModal}
              className="p-2 rounded hover:bg-slate-800 text-slate-400 hover:text-white transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-4 font-sans text-slate-200">
          {isAiLoading ? (
            <div className="py-12 flex flex-col items-center justify-center space-y-4 text-center">
              <div className="relative">
                <div className="w-16 h-16 rounded-full border-4 border-cyan-500/20 border-t-cyan-400 animate-spin"></div>
                <Sparkles className="w-6 h-6 text-cyan-400 absolute inset-0 m-auto animate-pulse" />
              </div>
              <div className="font-mono text-sm text-cyan-300 font-semibold">
                Synthesizing Multi-Hazard Cyclone Dossier...
              </div>
              <div className="text-xs text-slate-400 max-w-md space-y-1 font-mono">
                <div>✓ Analyzing cyclone pathway & observed vector...</div>
                <div>✓ Computing forecast uncertainty cone boundary...</div>
                <div>✓ Intersecting predicted landfall with coastal infrastructure...</div>
                <div>✓ Aggregating district-level demographic exposure...</div>
              </div>
            </div>
          ) : (
            <>
              {/* Official Disclaimer Banner */}
              <div className="bg-amber-950/40 border border-amber-800/80 rounded-lg p-3 flex items-start gap-2.5 text-xs text-amber-200">
                <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="font-bold">PROTOTYPE DECISION-SUPPORT NOTICE:</strong>
                  <span className="ml-1 text-slate-300">
                    {aiModalData?.disclaimer || "This briefing is an AI-generated prototype analysis for emergency operations centers. Refer to official IMD/NDMA bulletins for binding emergency directives."}
                  </span>
                </div>
              </div>

              {/* Key Findings Card */}
              {aiModalData?.key_findings && aiModalData.key_findings.length > 0 && (
                <div className="bg-slate-900/90 border border-slate-800 rounded-lg p-3.5 space-y-2">
                  <div className="text-xs font-mono font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4" />
                    <span>Key Operational Findings:</span>
                  </div>
                  <ul className="space-y-1.5 text-xs">
                    {aiModalData.key_findings.map((item, i) => (
                      <li key={i} className="flex items-start gap-2 text-slate-300">
                        <span className="text-cyan-400 mt-0.5">•</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Main Text Content */}
              <div className="prose prose-invert max-w-none text-sm leading-relaxed space-y-3 whitespace-pre-wrap font-sans text-slate-300">
                {aiModalData?.content}
              </div>

              {/* Recommended Actions */}
              {aiModalData?.recommended_actions && aiModalData.recommended_actions.length > 0 && (
                <div className="bg-slate-900/90 border border-slate-800 rounded-lg p-3.5 space-y-2">
                  <div className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                    <CheckSquare className="w-4 h-4" />
                    <span>Prioritized Field Directives:</span>
                  </div>
                  <ul className="space-y-1.5 text-xs">
                    {aiModalData.recommended_actions.map((act, i) => (
                      <li key={i} className="flex items-start gap-2 text-slate-200">
                        <span className="text-emerald-400 font-mono font-bold">{i + 1}.</span>
                        <span>{act}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3 bg-command-card border-t border-command-border flex items-center justify-between text-xs text-slate-400 font-mono">
          <span>Generated: {aiModalData?.generated_at || new Date().toISOString()}</span>
          <button
            onClick={closeAiModal}
            className="px-4 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-white transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
