import React, { useState, useEffect } from 'react';
import {
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
  Wind,
  Gauge,
  Compass,
  AlertTriangle,
  Radio,
  CheckCircle2,
  Cpu,
  Layers,
} from 'lucide-react';
import { useCycloneStore, AIStudioModule } from '../store/cycloneStore';

const MODULE_META: Record<
  AIStudioModule,
  { label: string; endpoint: string; description: string }
> = {
  landfall: {
    label: 'Explain Landfall',
    endpoint: 'POST /api/v1/ai/explain-landfall',
    description: 'Strategic meteorological, bathymetric, and storm-surge landfall synthesis.',
  },
  risk: {
    label: 'Explain Asset Risk',
    endpoint: 'POST /api/v1/ai/explain-risk',
    description: 'Physical vulnerability and failure-mechanism analysis for coastal infrastructure.',
  },
  satellite: {
    label: 'Multimodal SAR Flood',
    endpoint: 'POST /api/v1/ai/analyze-satellite',
    description: 'Sentinel-1A C-band SAR backscatter flood inundation and breach reconnaissance.',
  },
  emergency: {
    label: 'Emergency Priorities',
    endpoint: 'POST /api/v1/ai/generate-emergency-plan',
    description: 'Ranked incident-command priority checklist across critical lifelines and zones.',
  },
  report: {
    label: 'Incident Action Report',
    endpoint: 'POST /api/v1/ai/generate-report',
    description: 'Comprehensive multi-hazard disaster briefing & operational action plan.',
  },
};

/** Renders inline bold segments (**text**) cleanly without raw markdown asterisks */
function renderInlineFormatted(text: string): React.ReactNode {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, idx) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <strong key={idx} className="text-white font-semibold">
          {part.slice(2, -2)}
        </strong>
      );
    }
    return <React.Fragment key={idx}>{part}</React.Fragment>;
  });
}

/** Converts backend markdown narrative into clean structured typography */
function renderStructuredMarkdown(markdown: string): React.ReactNode {
  if (!markdown) return null;
  const lines = markdown.split('\n');
  const elements: React.ReactNode[] = [];

  lines.forEach((rawLine, idx) => {
    const line = rawLine.trim();
    if (!line) return;

    if (line === '---') {
      elements.push(<hr key={idx} className="border-[#1e293b] my-2" />);
      return;
    }

    if (line.startsWith('> ')) {
      const noticeContent = line.replace(/^>\s*/, '');
      elements.push(
        <div
          key={idx}
          data-testid="ai-fallback-notice"
          className="p-2.5 rounded-lg bg-amber-950/40 border border-amber-500/40 text-amber-200 text-xs flex items-start gap-2"
        >
          <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <div>{renderInlineFormatted(noticeContent)}</div>
        </div>
      );
      return;
    }

    if (line.startsWith('#### ')) {
      elements.push(
        <h5
          key={idx}
          className="text-xs font-headline font-bold text-cyan-300 uppercase tracking-wider pt-2"
        >
          {renderInlineFormatted(line.replace(/^####\s+/, ''))}
        </h5>
      );
      return;
    }

    if (line.startsWith('### ')) {
      elements.push(
        <h4
          key={idx}
          className="text-sm font-headline font-bold text-white tracking-wide pt-1"
        >
          {renderInlineFormatted(line.replace(/^###\s+/, ''))}
        </h4>
      );
      return;
    }

    if (line.startsWith('# ')) {
      elements.push(
        <h3
          key={idx}
          className="text-sm lg:text-base font-headline font-bold text-[#00e5ff] uppercase tracking-wider"
        >
          {renderInlineFormatted(line.replace(/^#+\s+/, ''))}
        </h3>
      );
      return;
    }

    if (line.startsWith('- ') || /^\d+\.\s+/.test(line)) {
      const cleaned = line.replace(/^(-|\d+\.)\s+/, '');
      const prefixMatch = line.match(/^(\d+\.)/);
      elements.push(
        <div
          key={idx}
          className="flex items-start gap-2 pl-2 text-slate-200 text-xs leading-relaxed"
        >
          <span className="text-[#00e5ff] font-mono font-bold shrink-0">
            {prefixMatch ? prefixMatch[1] : '•'}
          </span>
          <div>{renderInlineFormatted(cleaned)}</div>
        </div>
      );
      return;
    }

    elements.push(
      <p key={idx} className="text-slate-200 text-xs leading-relaxed">
        {renderInlineFormatted(line)}
      </p>
    );
  });

  return <div className="space-y-2">{elements}</div>;
}

export const AIIntelligence: React.FC = () => {
  const {
    activeCyclones,
    selectedCycloneId,
    cycloneDetail,
    selectCyclone,
    infrastructure,
    healthStatus,
    isLoading,
    error,
    fetchInitialData,
    refreshAllData,
    selectedAiModule,
    aiStudioLoading,
    aiStudioError,
    aiStudioTimedOut,
    aiStudioResult,
    aiStudioEmergencyResult,
    setSelectedAiModule,
    runAiStudioAnalysis,
  } = useCycloneStore();

  const [selectedAssetId, setSelectedAssetId] = useState<string>('hosp_1');
  const [copied, setCopied] = useState(false);

  // Ensure active cyclones are loaded if user navigates directly to /ai
  useEffect(() => {
    if (activeCyclones.length === 0 && !isLoading && !error) {
      fetchInitialData();
    }
  }, [activeCyclones.length, isLoading, error, fetchInitialData]);

  // Keep selectedAssetId synchronized with the selected cyclone's infrastructure assets
  const assets = infrastructure?.assets || [];
  useEffect(() => {
    if (assets.length > 0 && !assets.some((a) => a.id === selectedAssetId)) {
      setSelectedAssetId(assets[0].id);
    }
  }, [assets, selectedAssetId]);

  const selectedCycloneSummary =
    activeCyclones.find((c) => c.id === selectedCycloneId) || cycloneDetail || null;
  const hasActiveCyclone = activeCyclones.length > 0 && Boolean(selectedCycloneId);
  const isDemoScenario =
    selectedCycloneSummary?.data_status === 'DEMO' || Boolean(healthStatus?.demo_mode);

  const handleSelectCyclone = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const nextId = e.target.value;
    if (!nextId || nextId === selectedCycloneId) return;
    await selectCyclone(nextId);
  };

  const handleRunAi = async () => {
    await runAiStudioAnalysis(selectedAssetId);
  };

  const handleCopy = () => {
    const text =
      aiStudioResult?.content || JSON.stringify(aiStudioEmergencyResult, null, 2);
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const responseCycloneId =
    aiStudioResult?.cyclone_id ||
    aiStudioEmergencyResult?.cyclone_id ||
    selectedCycloneId;
  const responseCycloneObj =
    activeCyclones.find((c) => c.id === responseCycloneId) ||
    (cycloneDetail?.id === responseCycloneId ? cycloneDetail : selectedCycloneSummary);

  const currentModuleMeta = selectedAiModule ? MODULE_META[selectedAiModule] : null;
  const isFallbackEngine = Boolean(
    aiStudioResult?.is_simulated_fallback ||
      (aiStudioEmergencyResult &&
        !aiStudioEmergencyResult.model_used.toLowerCase().includes('gemini'))
  );

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

        <div className="flex flex-wrap items-center gap-2 text-xs">
          {isDemoScenario && hasActiveCyclone && (
            <span
              data-testid="ai-demo-scenario-badge"
              className="px-2.5 py-1 rounded-full bg-amber-950/80 text-amber-300 border border-amber-500/40 font-bold flex items-center gap-1.5"
            >
              <Radio className="w-3.5 h-3.5 text-amber-400" />
              DEMO MODE — SIMULATED CYCLONE SCENARIO
            </span>
          )}
          <span className="text-slate-400">AI Core Status:</span>
          <span className="px-2.5 py-1 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-400/50 font-bold flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-cyan-400 pulse-beacon" />
            ONLINE (GEMINI + DETERMINISTIC)
          </span>
        </div>
      </div>

      {/* Module Selector Toolbar */}
      <div
        data-testid="ai-module-toolbar"
        className="flex flex-wrap items-center gap-2.5 bg-[#0d1527] p-2 rounded-xl border border-[#1e293b]"
      >
        <button
          type="button"
          data-testid="ai-module-landfall"
          onClick={() => setSelectedAiModule('landfall')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-headline font-bold transition ${
            selectedAiModule === 'landfall'
              ? 'bg-gradient-to-r from-cyan-400 to-[#00e5ff] text-[#070d18] shadow-[0_0_12px_rgba(0,229,255,0.4)]'
              : 'text-slate-300 hover:bg-[#0f1a30]'
          }`}
        >
          <MapPin className="w-4 h-4" />
          <span>Explain Landfall</span>
        </button>

        <button
          type="button"
          data-testid="ai-module-risk"
          onClick={() => setSelectedAiModule('risk')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-headline font-bold transition ${
            selectedAiModule === 'risk'
              ? 'bg-gradient-to-r from-cyan-400 to-[#00e5ff] text-[#070d18] shadow-[0_0_12px_rgba(0,229,255,0.4)]'
              : 'text-slate-300 hover:bg-[#0f1a30]'
          }`}
        >
          <ShieldAlert className="w-4 h-4" />
          <span>Explain Asset Risk</span>
        </button>

        <button
          type="button"
          data-testid="ai-module-satellite"
          onClick={() => setSelectedAiModule('satellite')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-headline font-bold transition ${
            selectedAiModule === 'satellite'
              ? 'bg-gradient-to-r from-cyan-400 to-[#00e5ff] text-[#070d18] shadow-[0_0_12px_rgba(0,229,255,0.4)]'
              : 'text-slate-300 hover:bg-[#0f1a30]'
          }`}
        >
          <Satellite className="w-4 h-4" />
          <span>Multimodal SAR Flood</span>
        </button>

        <button
          type="button"
          data-testid="ai-module-emergency"
          onClick={() => setSelectedAiModule('emergency')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-headline font-bold transition ${
            selectedAiModule === 'emergency'
              ? 'bg-gradient-to-r from-cyan-400 to-[#00e5ff] text-[#070d18] shadow-[0_0_12px_rgba(0,229,255,0.4)]'
              : 'text-slate-300 hover:bg-[#0f1a30]'
          }`}
        >
          <AlertOctagon className="w-4 h-4" />
          <span>Emergency Priorities</span>
        </button>

        <button
          type="button"
          data-testid="ai-module-report"
          onClick={() => setSelectedAiModule('report')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-headline font-bold transition ${
            selectedAiModule === 'report'
              ? 'bg-gradient-to-r from-cyan-400 to-[#00e5ff] text-[#070d18] shadow-[0_0_12px_rgba(0,229,255,0.4)]'
              : 'text-slate-300 hover:bg-[#0f1a30]'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Incident Action Report</span>
        </button>
      </div>

      {/* Main Studio Viewport */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Controls & Configuration (4 Cols) */}
        <div className="lg:col-span-4 bg-[#0d1527] border border-[#1e293b] rounded-xl p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-headline text-sm font-bold text-white uppercase tracking-wider">
              INFERENCE PARAMETERS
            </h3>
            <button
              type="button"
              onClick={() => refreshAllData()}
              disabled={isLoading || aiStudioLoading}
              title="Refresh active cyclones from backend"
              className="flex items-center gap-1 px-2 py-1 rounded bg-[#0f1a30] hover:bg-[#162442] border border-[#1e293b] text-[10px] text-cyan-300 font-bold transition disabled:opacity-50"
            >
              <RefreshCw className={`w-3 h-3 ${isLoading ? 'animate-spin' : ''}`} />
              <span>SYNC</span>
            </button>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label
                  htmlFor="target-active-cyclone-select"
                  className="text-slate-400 font-bold uppercase tracking-wider text-[10px]"
                >
                  Target Active Cyclone
                </label>
                <span className="text-[10px] text-cyan-400 font-mono">
                  {activeCyclones.length} ACTIVE IN BASIN
                </span>
              </div>

              {/* Loading State */}
              {isLoading && activeCyclones.length === 0 ? (
                <div
                  data-testid="target-cyclone-loading"
                  className="w-full bg-[#0f1a30] border border-[#1e293b] rounded-lg p-3 text-cyan-300 font-mono flex items-center gap-2.5"
                >
                  <RefreshCw className="w-4 h-4 animate-spin text-[#00e5ff]" />
                  <span>Loading active cyclones...</span>
                </div>
              ) : error && activeCyclones.length === 0 ? (
                /* Error State */
                <div
                  data-testid="target-cyclone-error"
                  className="w-full bg-rose-950/40 border border-rose-500/40 rounded-lg p-3 space-y-2"
                >
                  <div className="flex items-center gap-2 text-rose-300 font-bold">
                    <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                    <span>Unable to load active cyclones.</span>
                  </div>
                  <p className="text-[11px] text-rose-200/80 break-words">{error}</p>
                  <button
                    type="button"
                    onClick={() => fetchInitialData()}
                    className="px-3 py-1.5 rounded bg-rose-500/20 hover:bg-rose-500/30 border border-rose-400/50 text-rose-200 font-bold text-[11px] flex items-center gap-1.5 transition"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>RETRY</span>
                  </button>
                </div>
              ) : activeCyclones.length === 0 ? (
                /* No Active Cyclone State */
                <div
                  data-testid="target-cyclone-empty"
                  className="w-full bg-[#0f1a30] border border-amber-500/40 rounded-lg p-3 text-amber-300 font-mono flex items-center justify-between"
                >
                  <span>NO ACTIVE CYCLONE DETECTED</span>
                  <button
                    type="button"
                    onClick={() => fetchInitialData()}
                    className="px-2 py-1 rounded bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 text-[10px] font-bold"
                  >
                    CHECK AGAIN
                  </button>
                </div>
              ) : (
                /* Interactive Active Cyclone Selector */
                <div className="space-y-2.5">
                  <select
                    id="target-active-cyclone-select"
                    data-testid="target-active-cyclone-select"
                    value={selectedCycloneId}
                    onChange={handleSelectCyclone}
                    disabled={isLoading || aiStudioLoading}
                    className="w-full bg-[#0f1a30] hover:bg-[#13223f] focus:bg-[#13223f] border border-cyan-500/40 focus:border-[#00e5ff] rounded-lg p-2.5 text-white font-mono text-xs transition outline-none cursor-pointer disabled:opacity-60"
                  >
                    {activeCyclones.map((cyclone) => (
                      <option key={cyclone.id} value={cyclone.id} className="bg-[#0d1527] text-white">
                        {cyclone.name} ({cyclone.category}) — {cyclone.wind_speed} km/h • {cyclone.central_pressure} hPa
                      </option>
                    ))}
                  </select>

                  {/* Selected Cyclone Live Telemetry Card */}
                  {selectedCycloneSummary && (
                    <div
                      data-testid="selected-cyclone-telemetry"
                      className="p-3 rounded-lg bg-[#0b1326] border border-[#1e293b] space-y-2"
                    >
                      <div className="flex items-center justify-between border-b border-[#1e293b] pb-1.5">
                        <div>
                          <div className="text-white font-bold text-xs flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-[#00e5ff]" />
                            <span>{selectedCycloneSummary.name}</span>
                          </div>
                          <div className="text-[10px] text-cyan-300 font-mono">
                            {selectedCycloneSummary.category}
                          </div>
                        </div>
                        <span className="px-2 py-0.5 rounded bg-[#0f1a30] border border-[#1e293b] text-[10px] font-mono text-slate-300">
                          ID: {selectedCycloneSummary.id}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-[11px]">
                        <div className="p-2 rounded bg-[#0f1a30]/70 border border-[#1e293b]/70">
                          <div className="text-[10px] text-slate-400 flex items-center gap-1">
                            <Wind className="w-3 h-3 text-[#00e5ff]" />
                            <span>MAX WIND</span>
                          </div>
                          <div className="text-white font-bold font-mono mt-0.5">
                            {selectedCycloneSummary.wind_speed} km/h
                          </div>
                        </div>

                        <div className="p-2 rounded bg-[#0f1a30]/70 border border-[#1e293b]/70">
                          <div className="text-[10px] text-slate-400 flex items-center gap-1">
                            <Gauge className="w-3 h-3 text-[#00e5ff]" />
                            <span>PRESSURE</span>
                          </div>
                          <div className="text-white font-bold font-mono mt-0.5">
                            {selectedCycloneSummary.central_pressure} hPa
                          </div>
                        </div>

                        <div className="p-2 rounded bg-[#0f1a30]/70 border border-[#1e293b]/70 col-span-2">
                          <div className="text-[10px] text-slate-400 flex items-center gap-1">
                            <Compass className="w-3 h-3 text-[#00e5ff]" />
                            <span>POSITION & BASIN</span>
                          </div>
                          <div className="text-white font-mono mt-0.5">
                            {selectedCycloneSummary.current_latitude.toFixed(2)}°N,{' '}
                            {selectedCycloneSummary.current_longitude.toFixed(2)}°E •{' '}
                            <span className="text-slate-300">{selectedCycloneSummary.basin}</span>
                          </div>
                        </div>
                      </div>

                      {(cycloneDetail?.landfall?.location_name ||
                        selectedCycloneSummary.estimated_landfall_location) && (
                        <div className="text-[10px] text-amber-300/90 font-mono pt-0.5 flex items-center justify-between">
                          <span>PROJ. LANDFALL:</span>
                          <span className="font-bold text-amber-200">
                            {cycloneDetail?.landfall?.location_name ||
                              selectedCycloneSummary.estimated_landfall_location}
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>

            {selectedAiModule === 'risk' && hasActiveCyclone && (
              <div>
                <label
                  htmlFor="target-asset-select"
                  className="text-slate-400 block mb-1 font-bold uppercase tracking-wider text-[10px]"
                >
                  Target Infrastructure Asset
                </label>
                <select
                  id="target-asset-select"
                  data-testid="target-asset-select"
                  value={selectedAssetId}
                  onChange={(e) => setSelectedAssetId(e.target.value)}
                  disabled={aiStudioLoading}
                  className="w-full bg-[#0f1a30] border border-[#1e293b] rounded-lg p-2 text-cyan-300 font-mono text-xs"
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
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-slate-400 uppercase font-bold">FastAPI Endpoint</span>
                {currentModuleMeta && (
                  <span className="text-[10px] text-cyan-400 font-bold">
                    {currentModuleMeta.label}
                  </span>
                )}
              </div>
              <div data-testid="selected-ai-endpoint" className="text-cyan-300 font-mono text-[11px]">
                {currentModuleMeta ? currentModuleMeta.endpoint : 'SELECT AN AI MODULE FIRST'}
              </div>
              {currentModuleMeta && (
                <div className="text-[10px] text-slate-400 pt-0.5">
                  {currentModuleMeta.description}
                </div>
              )}
              {hasActiveCyclone && (
                <div className="text-[10px] text-slate-400 font-mono pt-1 border-t border-[#1e293b]/70 mt-1">
                  Payload cyclone_id: <span className="text-white font-bold">{selectedCycloneId}</span>
                </div>
              )}
            </div>
          </div>

          <button
            type="button"
            data-testid="submit-reasoning-request-btn"
            onClick={handleRunAi}
            disabled={aiStudioLoading || isLoading || !hasActiveCyclone || !selectedAiModule}
            className="w-full py-2.5 rounded-lg bg-gradient-to-r from-cyan-400 to-[#00e5ff] text-[#070d18] font-headline text-xs font-bold shadow-[0_0_16px_rgba(0,229,255,0.4)] transition hover:opacity-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <Send className={`w-4 h-4 ${aiStudioLoading ? 'animate-spin' : ''}`} />
            <span>
              {!selectedAiModule
                ? 'SELECT AN AI MODULE FIRST'
                : !hasActiveCyclone
                ? 'NO ACTIVE CYCLONE SELECTED'
                : aiStudioLoading
                ? 'ANALYZING...'
                : 'SUBMIT REASONING REQUEST'}
            </span>
          </button>
        </div>

        {/* Output Console: Neural Synthesis Dossier (8 Cols) */}
        <div
          data-testid="neural-synthesis-dossier"
          className="lg:col-span-8 bg-[#0d1527] border border-[#1e293b] rounded-xl p-5 shadow-xl flex flex-col justify-between space-y-4 min-h-[420px]"
        >
          <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-[#1e293b]">
            <div className="flex items-center gap-2 text-white font-headline text-sm font-bold">
              <Terminal className="w-5 h-5 text-[#00e5ff]" />
              <span>NEURAL SYNTHESIS DOSSIER</span>
            </div>
            {(aiStudioResult || aiStudioEmergencyResult) && (
              <button
                type="button"
                data-testid="copy-dossier-btn"
                onClick={handleCopy}
                className="flex items-center gap-1.5 px-3 py-1 rounded bg-[#0f1a30] hover:bg-[#13223f] border border-[#1e293b] text-xs text-slate-300 hover:text-white transition"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'COPIED' : 'COPY'}</span>
              </button>
            )}
          </div>

          {/* STATE 1: LOADING */}
          {aiStudioLoading ? (
            <div
              data-testid="dossier-loading-state"
              className="flex-1 flex flex-col items-center justify-center p-12 space-y-3 text-center"
            >
              <div className="w-10 h-10 rounded-full border-4 border-cyan-500/20 border-t-[#00e5ff] animate-spin" />
              <div className="text-sm font-headline font-bold text-cyan-300">
                Gemini AI analysis in progress...
              </div>
              <div className="text-xs text-slate-400 font-mono">
                Processing cyclone intelligence for{' '}
                <span className="text-white font-bold">
                  {selectedCycloneSummary?.name || selectedCycloneId}
                </span>{' '}
                ({currentModuleMeta?.label || 'Reasoning Module'})
              </div>
            </div>
          ) : aiStudioError ? (
            /* STATE 2: ERROR / TIMEOUT */
            <div
              data-testid="dossier-error-state"
              className="flex-1 flex flex-col justify-center p-6 rounded-lg bg-rose-950/30 border border-rose-500/40 text-xs space-y-4"
            >
              <div className="flex items-center gap-2.5 text-rose-300 font-headline font-bold text-sm">
                <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0" />
                <span>
                  {aiStudioTimedOut ? 'AI ANALYSIS TIMED OUT' : 'AI ANALYSIS FAILED'}
                </span>
              </div>
              <p className="text-rose-200/90 font-sans leading-relaxed">{aiStudioError}</p>
              <div className="pt-1">
                <button
                  type="button"
                  data-testid="retry-ai-analysis-btn"
                  onClick={handleRunAi}
                  className="px-4 py-2 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 border border-rose-400/50 text-rose-100 font-headline font-bold text-xs flex items-center gap-2 transition"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>RETRY ANALYSIS</span>
                </button>
              </div>
            </div>
          ) : aiStudioResult || aiStudioEmergencyResult ? (
            /* STATE 3: SUCCESS (STRUCTURED AI DOSSIER) */
            <div data-testid="dossier-result-view" className="space-y-4 text-xs font-sans">
              {/* Structured Dossier Metadata Grid */}
              <div
                data-testid="analysis-target-banner"
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2.5 p-3.5 rounded-lg bg-[#0b1326] border border-cyan-500/40 font-telemetry"
              >
                <div className="p-2 rounded bg-[#0f1a30]/80 border border-[#1e293b]">
                  <span className="text-[10px] uppercase text-slate-400 font-bold block">
                    AI MODULE
                  </span>
                  <span
                    data-testid="dossier-module-name"
                    className="text-cyan-300 font-bold text-xs mt-0.5 block"
                  >
                    {currentModuleMeta?.label || 'AI Synthesis'}
                  </span>
                </div>

                <div className="p-2 rounded bg-[#0f1a30]/80 border border-[#1e293b]">
                  <span className="text-[10px] uppercase text-slate-400 font-bold block">
                    TARGET CYCLONE
                  </span>
                  <span
                    data-testid="dossier-target-cyclone"
                    className="text-white font-bold text-xs mt-0.5 block"
                  >
                    {responseCycloneObj?.name || responseCycloneId}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    ID: {responseCycloneId}
                    {responseCycloneObj ? ` • ${responseCycloneObj.wind_speed} km/h` : ''}
                  </span>
                </div>

                <div className="p-2 rounded bg-[#0f1a30]/80 border border-[#1e293b]">
                  <span className="text-[10px] uppercase text-slate-400 font-bold block">
                    CONFIDENCE / MODEL STATUS
                  </span>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <Cpu className="w-3.5 h-3.5 text-[#00e5ff] shrink-0" />
                    <span className="text-slate-200 font-bold text-[11px] truncate">
                      {aiStudioResult?.model_used || aiStudioEmergencyResult?.model_used}
                    </span>
                  </div>
                  <span
                    data-testid="dossier-engine-status"
                    className={`inline-block mt-1 px-1.5 py-0.5 rounded text-[9px] font-bold uppercase ${
                      isFallbackEngine
                        ? 'bg-amber-950/80 text-amber-300 border border-amber-500/40'
                        : 'bg-emerald-950/80 text-emerald-300 border border-emerald-500/40'
                    }`}
                  >
                    {isFallbackEngine
                      ? 'AI SERVICE UNAVAILABLE — DETERMINISTIC ENGINE'
                      : 'LIVE GEMINI AI SYNTHESIS'}
                  </span>
                </div>

                <div className="p-2 rounded bg-[#0f1a30]/80 border border-[#1e293b]">
                  <span className="text-[10px] uppercase text-slate-400 font-bold block">
                    SOURCE
                  </span>
                  <span className="text-slate-200 font-bold text-[11px] mt-0.5 block">
                    CycloneShield AI / FastAPI / Gemini
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {aiStudioResult?.generated_at || aiStudioEmergencyResult?.generated_at}
                  </span>
                </div>
              </div>

              {/* AI Response Content & Sections */}
              {aiStudioResult && (
                <div className="space-y-4">
                  {/* ANALYSIS SECTION */}
                  <div className="p-4 rounded-lg bg-[#0b1326] border border-cyan-500/30 space-y-2.5">
                    <div className="flex items-center justify-between border-b border-[#1e293b] pb-2">
                      <span className="text-[10px] font-telemetry uppercase font-bold text-[#00e5ff] tracking-wider">
                        ANALYSIS — {aiStudioResult.title || currentModuleMeta?.label}
                      </span>
                      {isDemoScenario && (
                        <span className="text-[10px] font-telemetry text-amber-300 font-bold">
                          DEMO MODE TELEMETRY
                        </span>
                      )}
                    </div>
                    <div data-testid="dossier-analysis-content">
                      {renderStructuredMarkdown(aiStudioResult.content)}
                    </div>
                  </div>

                  {/* SAR RECONNAISSANCE TELEMETRY (Only when returned by /analyze-satellite) */}
                  {aiStudioResult.sar_data && (
                    <div
                      data-testid="dossier-sar-metrics"
                      className="p-4 rounded-lg bg-[#0f1a30]/90 border border-cyan-500/30 space-y-3"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="text-[10px] font-telemetry uppercase font-bold text-cyan-300 flex items-center gap-1.5">
                          <Layers className="w-3.5 h-3.5 text-[#00e5ff]" />
                          <span>SENTINEL-1 SAR HYDROLOGICAL TELEMETRY</span>
                        </span>
                        <span className="px-2 py-0.5 rounded bg-rose-950/80 border border-rose-500/40 text-rose-300 font-telemetry font-bold text-[10px]">
                          SEVERITY: {aiStudioResult.sar_data.severity_level} (
                          {aiStudioResult.sar_data.confidence_score}% CONFIDENCE)
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 font-telemetry">
                        <div className="p-2.5 rounded bg-[#0b1326] border border-[#1e293b]">
                          <div className="text-[10px] text-slate-400">FLOOD INUNDATION</div>
                          <div className="text-sm font-bold text-white mt-0.5">
                            {aiStudioResult.sar_data.flood_inundation_sqkm} sq km
                          </div>
                          <div className="text-[10px] text-cyan-300">
                            {aiStudioResult.sar_data.water_expansion_percent}
                          </div>
                        </div>

                        <div className="p-2.5 rounded bg-[#0b1326] border border-[#1e293b]">
                          <div className="text-[10px] text-slate-400">PERMANENT WATER BASELINE</div>
                          <div className="text-sm font-bold text-white mt-0.5">
                            {aiStudioResult.sar_data.permanent_water_sqkm} sq km
                          </div>
                          <div className="text-[10px] text-slate-400">
                            {aiStudioResult.sar_data.pass_direction}
                          </div>
                        </div>

                        <div className="p-2.5 rounded bg-[#0b1326] border border-[#1e293b]">
                          <div className="text-[10px] text-slate-400">TARGET SECTOR</div>
                          <div className="text-xs font-bold text-white mt-0.5 truncate">
                            {aiStudioResult.sar_data.location_summary}
                          </div>
                          <div className="text-[10px] text-cyan-300">
                            {aiStudioResult.sar_data.latitude}°N, {aiStudioResult.sar_data.longitude}°E
                          </div>
                        </div>
                      </div>

                      {aiStudioResult.sar_data.submerged_infrastructure?.length > 0 && (
                        <div>
                          <span className="text-[10px] font-telemetry uppercase text-slate-400 font-bold block mb-1">
                            SUBMERGED INFRASTRUCTURE NODES
                          </span>
                          <ul className="list-disc list-inside space-y-1 text-slate-200 text-xs">
                            {aiStudioResult.sar_data.submerged_infrastructure.map((item, i) => (
                              <li key={i}>{item}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}

                  {/* KEY FINDINGS / RISK FACTORS */}
                  {aiStudioResult.key_findings && aiStudioResult.key_findings.length > 0 && (
                    <div data-testid="dossier-key-findings" className="space-y-2">
                      <span className="text-[10px] font-telemetry uppercase text-slate-400 font-bold block">
                        KEY FINDINGS & RISK FACTORS
                      </span>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {aiStudioResult.key_findings.map((finding: string, i: number) => (
                          <div
                            key={i}
                            className="p-3 rounded-lg bg-[#0f1a30] border border-[#1e293b] text-slate-200 flex items-start gap-2"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5 text-[#00e5ff] shrink-0 mt-0.5" />
                            <span>{finding}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* RECOMMENDED ACTIONS */}
                  {aiStudioResult.recommended_actions &&
                    aiStudioResult.recommended_actions.length > 0 && (
                      <div
                        data-testid="dossier-recommended-actions"
                        className="p-3.5 rounded-lg bg-emerald-950/40 border border-emerald-500/40 text-emerald-200 space-y-1.5"
                      >
                        <span className="text-[10px] font-telemetry uppercase font-bold text-emerald-300 block">
                          RECOMMENDED ACTIONS & OPERATIONAL DIRECTIVES
                        </span>
                        <ul className="list-disc list-inside space-y-1 text-xs">
                          {aiStudioResult.recommended_actions.map((action: string, i: number) => (
                            <li key={i}>{action}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                  {/* DISCLAIMER */}
                  {aiStudioResult.disclaimer && (
                    <div className="text-[10px] font-mono text-slate-400 border-t border-[#1e293b] pt-2">
                      {aiStudioResult.disclaimer}
                    </div>
                  )}
                </div>
              )}

              {/* Emergency Priorities Response View */}
              {aiStudioEmergencyResult && (
                <div data-testid="dossier-emergency-priorities" className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-telemetry uppercase font-bold text-[#00e5ff]">
                      RANKED EMERGENCY PRIORITY CHECKLIST ({aiStudioEmergencyResult.priorities.length}{' '}
                      CRITICAL ACTIONS)
                    </span>
                  </div>
                  <div className="space-y-2.5">
                    {aiStudioEmergencyResult.priorities.map((p, i) => (
                      <div
                        key={i}
                        className="p-3.5 rounded-lg bg-[#0f1a30] border border-[#1e293b] space-y-1.5 text-xs"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2 font-bold text-white">
                          <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 rounded bg-cyan-950 text-[#00e5ff] border border-cyan-500/40 font-mono text-[10px]">
                              RANK #{p.rank}
                            </span>
                            <span>{p.priority_action}</span>
                          </div>
                          <span className="px-2 py-0.5 rounded bg-rose-950/80 border border-rose-500/40 text-rose-300 font-telemetry text-[10px] uppercase">
                            {p.urgency} • {p.risk_level}
                          </span>
                        </div>
                        <p className="text-slate-300 font-sans">{p.rationale}</p>
                        <div className="text-[10px] text-cyan-300 font-telemetry pt-0.5">
                          Target Asset: <span className="text-white font-semibold">{p.name}</span> (
                          {p.type}) • District: <span className="text-white">{p.district}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                  {aiStudioEmergencyResult.disclaimer && (
                    <div className="text-[10px] font-mono text-slate-400 border-t border-[#1e293b] pt-2">
                      {aiStudioEmergencyResult.disclaimer}
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            /* STATE 4: EMPTY */
            <div
              data-testid="dossier-empty-state"
              className="flex-1 flex flex-col items-center justify-center p-12 text-center text-slate-400 text-xs space-y-2"
            >
              <Brain className="w-8 h-8 text-cyan-500/40 mb-1" />
              <div className="text-slate-200 font-headline font-bold text-sm">
                {!selectedAiModule
                  ? 'SELECT AN AI MODULE FIRST'
                  : 'READY FOR NEURAL SYNTHESIS'}
              </div>
              <div>
                Target Active Cyclone:{' '}
                <span className="text-cyan-300 font-bold font-mono">
                  {hasActiveCyclone
                    ? `${selectedCycloneSummary?.name || selectedCycloneId} (${
                        selectedCycloneSummary?.category || 'Active'
                      })`
                    : 'NO ACTIVE CYCLONE DETECTED'}
                </span>
                {currentModuleMeta && (
                  <>
                    {' '}
                    • Module:{' '}
                    <span className="text-white font-bold font-mono">
                      {currentModuleMeta.label}
                    </span>
                  </>
                )}
              </div>
              <div>
                Select an AI module and click "Submit Reasoning Request" to query the live FastAPI AI endpoint.
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AIIntelligence;
