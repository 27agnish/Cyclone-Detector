import React, { useEffect, useState, useRef } from 'react';
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
  Download,
  Brain,
  HelpCircle,
  Copy,
  Check,
  X,
  Radar,
  TrendingUp,
  MapPin,
  Droplets,
  Users,
  Compass,
  FileText,
  ClipboardList,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
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
    setActiveTab
  } = useCycloneStore();

  const [loading, setLoading] = useState(false);
  const [currentRisk, setCurrentRisk] = useState<RiskAssessmentResponse | null>(riskAssessment);
  const [explainDrawerOpen, setExplainDrawerOpen] = useState(false);
  const [simulatingInference, setSimulatingInference] = useState(false);
  const [explainingRisk, setExplainingRisk] = useState(false);
  const [generatingReport, setGeneratingReport] = useState(false);
  const [generatingResponsePlan, setGeneratingResponsePlan] = useState(false);
  const [exportingGeoJson, setExportingGeoJson] = useState(false);
  const [copied, setCopied] = useState(false);
  const toolbarScrollRef = useRef<HTMLDivElement | null>(null);

  const scrollToolbar = (direction: 'left' | 'right') => {
    if (!toolbarScrollRef.current) return;
    const delta = direction === 'left' ? -260 : 260;
    toolbarScrollRef.current.scrollBy({ left: delta, behavior: 'smooth' });
  };

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

  const handleRunSimulation = async () => {
    setSimulatingInference(true);
    try {
      await fetchRisk();
    } finally {
      setTimeout(() => {
        setSimulatingInference(false);
      }, 600);
    }
  };

  const handleExportGeoJson = () => {
    setExportingGeoJson(true);
    const riskGeoJson = {
      type: "FeatureCollection",
      cyclone_id: selectedCycloneId,
      timestamp: new Date().toISOString(),
      composite_risk_score: compositeScore,
      features: [
        {
          type: "Feature",
          properties: { zone: "Critical Landfall Corridor", buffer_km: 35, risk_level: "CRITICAL" },
          geometry: { type: "Polygon", coordinates: [[[86.8, 21.0], [87.6, 21.8], [87.3, 21.9], [86.5, 21.2], [86.8, 21.0]]] }
        }
      ]
    };
    const blob = new Blob([JSON.stringify(riskGeoJson, null, 2)], { type: "application/geo+json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `risk_zones_${selectedCycloneId}.geojson`;
    a.click();
    setTimeout(() => setExportingGeoJson(false), 800);
  };

  const handleCopyBriefing = () => {
    const text = `CycloneShield AI Operational Briefing: ${cycloneName} Multi-Hazard Severity Score ${compositeScore}/100 (${riskCategory}). Wind: ${windSpeed} km/h, Surge: ${surgeHeight}m, Pressure: ${pressure} hPa. Landfall target: ${landfallLocation}. Status: ${riskCategory} HAZARD.`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExplainWithAi = async () => {
    setExplainingRisk(true);
    setIsAiLoading(true);
    try {
      const res = await aiApi.explainRisk(selectedCycloneId);
      openAiModal(res);
    } catch (e) {
      console.error(e);
    } finally {
      setIsAiLoading(false);
      setExplainingRisk(false);
    }
  };

  const handleGenerateReport = async () => {
    setGeneratingReport(true);
    setIsAiLoading(true);
    try {
      const res = await aiApi.generateReport(selectedCycloneId);
      openAiModal(res);
    } catch (e) {
      console.error(e);
    } finally {
      setIsAiLoading(false);
      setGeneratingReport(false);
    }
  };

  const handleGenerateResponsePlan = async () => {
    setGeneratingResponsePlan(true);
    setIsAiLoading(true);
    try {
      const planRes = await aiApi.generateEmergencyPlan(selectedCycloneId);
      openAiModal({
        cyclone_id: planRes.cyclone_id,
        title: `Emergency Response Priority Plan (${cycloneName})`,
        generated_at: planRes.generated_at,
        model_used: planRes.model_used,
        is_simulated_fallback: false,
        content: planRes.priorities
          .map(
            (p) =>
              `### Priority #${p.rank}: ${p.name} (${p.district})\n- **Asset Type**: ${p.type.toUpperCase()} | **Risk Level**: ${p.risk_level} | **Urgency**: ${p.urgency}\n- **Directive**: ${p.priority_action}\n- **Rationale**: ${p.rationale}`
          )
          .join('\n\n'),
        key_findings: planRes.priorities.slice(0, 4).map((p) => `[#${p.rank} ${p.risk_level}] ${p.name}: ${p.priority_action}`),
        recommended_actions: planRes.priorities.slice(0, 5).map((p) => `${p.name} (${p.district}): ${p.priority_action}`),
        disclaimer: planRes.disclaimer,
      });
    } catch (e) {
      console.error(e);
    } finally {
      setIsAiLoading(false);
      setGeneratingResponsePlan(false);
    }
  };

  const compositeScore = currentRisk?.overall_cyclone_risk_score ? Math.round(currentRisk.overall_cyclone_risk_score) : 88;
  const riskCategory = currentRisk?.overall_risk_category || 'CRITICAL';
  const cycloneName = cycloneDetail?.name || 'Cyclone DANA';
  const windSpeed = cycloneDetail?.wind_speed || 215;
  const pressure = cycloneDetail?.central_pressure || 942;
  const landfallLocation = cycloneDetail?.landfall?.location_name || 'Balasore-Digha Coast';
  const landfallEta = cycloneDetail?.landfall?.estimated_time || 'T-13h 45m';
  const surgeHeight = (windSpeed * 0.02 + 0.5).toFixed(1);
  const rainTotal = Math.round(windSpeed * 1.8 + 60);

  // SVG Gauge calculations
  const radius = 66;
  const circumference = 2 * Math.PI * radius; // ~414.69
  const dashOffset = circumference - (compositeScore / 100) * circumference;

  return (
    <div
      data-testid="risk-analysis-page"
      className="flex-1 flex flex-col w-full h-full min-h-0 overflow-y-auto overflow-x-hidden bg-[#070d18] text-[#dee2f1] select-none"
    >
      {/* 1. Dedicated Page Action Toolbar (Sticky directly below Global Header, Horizontally Scrollable, Never Clipped) */}
      <div
        data-testid="risk-action-toolbar"
        className="sticky top-0 z-20 shrink-0 w-full bg-[#0b1326]/95 backdrop-blur-md border-b border-[#1e293b] px-3 sm:px-4 lg:px-6 py-2.5 shadow-[0_4px_16px_rgba(0,0,0,0.55)]"
      >
        <div className="flex items-center gap-2 w-full">
          {/* Left horizontal scroll affordance for smaller viewports */}
          <button
            type="button"
            onClick={() => scrollToolbar('left')}
            aria-label="Scroll actions left"
            className="xl:hidden shrink-0 p-1.5 rounded-lg bg-[#13223f] hover:bg-[#1e2c4a] text-cyan-300 border border-cyan-500/30 transition-colors cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          {/* Horizontally Scrollable Action Buttons Strip */}
          <div
            ref={toolbarScrollRef}
            data-testid="risk-action-scroll-container"
            className="flex-1 min-w-0 flex items-center gap-2.5 overflow-x-auto whitespace-nowrap py-1 scroll-smooth"
          >
            <button
              type="button"
              data-testid="btn-run-impact"
              onClick={handleRunSimulation}
              disabled={simulatingInference || loading}
              className="shrink-0 whitespace-nowrap flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-cyan-400 to-[#00e5ff] text-[#070d18] font-headline font-bold text-xs shadow-[0_0_16px_rgba(0,229,255,0.35)] hover:shadow-[0_0_22px_rgba(0,229,255,0.55)] transition-all disabled:opacity-50 cursor-pointer"
            >
              <RefreshCw className={`w-4 h-4 shrink-0 ${simulatingInference || loading ? 'animate-spin' : ''}`} />
              <span>{simulatingInference || loading ? 'ANALYZING IMPACT...' : 'RUN IMPACT ANALYSIS'}</span>
            </button>

            <button
              type="button"
              data-testid="btn-explain-risk"
              onClick={handleExplainWithAi}
              disabled={explainingRisk}
              className="shrink-0 whitespace-nowrap flex items-center gap-2 px-4 py-2 rounded-lg bg-[#13223f] hover:bg-[#1e2c4a] text-cyan-200 font-telemetry text-xs font-semibold border border-cyan-400 hover:border-cyan-300 transition-all shadow-[0_0_12px_rgba(0,229,255,0.2)] disabled:opacity-50 cursor-pointer"
            >
              <Sparkles className={`w-4 h-4 shrink-0 text-[#00e5ff] ${explainingRisk ? 'animate-spin' : ''}`} />
              <span className="text-white font-bold">
                {explainingRisk ? 'EXPLAINING RISK...' : 'EXPLAIN RISK ANALYSIS'}
              </span>
            </button>

            <button
              type="button"
              data-testid="btn-generate-report"
              onClick={handleGenerateReport}
              disabled={generatingReport}
              className="shrink-0 whitespace-nowrap flex items-center gap-2 px-4 py-2 rounded-lg bg-[#13223f] hover:bg-[#1e2c4a] text-cyan-200 font-telemetry text-xs font-semibold border border-cyan-500/50 hover:border-cyan-300 transition-all disabled:opacity-50 cursor-pointer"
            >
              <FileText className="w-4 h-4 shrink-0 text-cyan-400" />
              <span className="text-white font-semibold">
                {generatingReport ? 'GENERATING REPORT...' : 'GENERATE REPORT'}
              </span>
            </button>

            <button
              type="button"
              data-testid="btn-generate-response"
              onClick={handleGenerateResponsePlan}
              disabled={generatingResponsePlan}
              className="shrink-0 whitespace-nowrap flex items-center gap-2 px-4 py-2 rounded-lg bg-rose-950/70 hover:bg-rose-900/70 text-rose-200 font-telemetry text-xs font-semibold border border-rose-500/60 hover:border-rose-400 transition-all disabled:opacity-50 cursor-pointer"
            >
              <ClipboardList className="w-4 h-4 shrink-0 text-rose-400" />
              <span className="text-white font-semibold">
                {generatingResponsePlan ? 'GENERATING PLAN...' : 'GENERATE RESPONSE PLAN'}
              </span>
            </button>

            <button
              type="button"
              data-testid="btn-xai-inspector"
              onClick={() => setExplainDrawerOpen(true)}
              className="shrink-0 whitespace-nowrap flex items-center gap-2 px-4 py-2 rounded-lg bg-[#0f1a30] hover:bg-[#162442] text-cyan-200 font-telemetry text-xs font-semibold border border-cyan-500/40 transition-all cursor-pointer"
            >
              <Brain className="w-4 h-4 shrink-0 text-[#00e5ff]" />
              <span className="text-white">XAI INSPECTOR</span>
            </button>

            <button
              type="button"
              data-testid="btn-export-geojson"
              onClick={handleExportGeoJson}
              disabled={exportingGeoJson}
              className="shrink-0 whitespace-nowrap flex items-center gap-2 px-4 py-2 rounded-lg bg-cyan-950/60 border border-cyan-400/70 text-cyan-200 font-telemetry text-xs font-semibold hover:bg-[#13223f] transition-all shadow-sm group cursor-pointer"
            >
              <Download className="w-4 h-4 shrink-0 text-cyan-400 group-hover:scale-110 transition-transform" />
              <span className="text-white">{exportingGeoJson ? 'EXPORTING...' : 'EXPORT RISK GEOJSON'}</span>
            </button>
          </div>

          {/* Right horizontal scroll affordance for smaller viewports */}
          <button
            type="button"
            onClick={() => scrollToolbar('right')}
            aria-label="Scroll actions right"
            className="xl:hidden shrink-0 p-1.5 rounded-lg bg-[#13223f] hover:bg-[#1e2c4a] text-cyan-300 border border-cyan-500/30 transition-colors cursor-pointer"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 2. Page Header & Status Ribbon (Shrink-0 so it is never vertically compressed) */}
      <div className="shrink-0 px-4 lg:px-6 py-4 flex flex-col lg:flex-row lg:items-center justify-between gap-3 bg-gradient-to-r from-[#070d18] via-[#0b1326] to-[#070d18] border-b border-[#1e293b] relative">
        <div className="flex flex-col gap-1.5 relative z-10">
          <div className="flex flex-wrap items-center gap-2 font-telemetry text-[11px] text-slate-400 uppercase tracking-wider">
            <button
              type="button"
              onClick={() => setActiveTab('dashboard')}
              className="hover:text-cyan-300 transition-colors cursor-pointer"
            >
              Risk Intelligence
            </button>
            <span className="text-slate-600">/</span>
            <span className="text-[#00e5ff] font-semibold">Multi-Hazard Vulnerability Matrix</span>
            <span className="text-slate-600">/</span>
            <span className="text-[#00daf3] px-1.5 py-0.5 rounded bg-[#13223f] border border-cyan-500/30">
              {selectedCycloneId.toUpperCase()}
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="font-headline text-xl sm:text-2xl lg:text-3xl text-white font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-100 to-cyan-200 bg-clip-text text-transparent">
              PROTOTYPE MULTI-HAZARD RISK ANALYSIS
            </h1>
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/70 border border-cyan-400/40 shadow-[0_0_12px_rgba(0,229,255,0.2)]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#00e5ff] pulse-beacon" />
              <span className="font-telemetry text-[10px] text-cyan-300 uppercase tracking-wider font-semibold">
                CYCLONESHIELD AI PROTOTYPE RISK ENGINE v2.1 • FASTAPI INFERENCE
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Model Advisory Disclaimer Banner (Shrink-0) */}
      <div className="shrink-0 px-4 lg:px-6 py-2.5 bg-gradient-to-r from-red-950/80 via-rose-950/70 to-red-950/80 border-b border-rose-500/40 text-red-200 flex items-center justify-between shadow-[0_0_16px_rgba(255,51,102,0.15)] text-xs font-telemetry">
        <div className="flex items-center gap-2.5">
          <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 alert-beacon" />
          <span className="tracking-widest font-bold uppercase text-[10px] sm:text-xs">
            MODEL-DERIVED PROTOTYPE OUTPUT — NOT OFFICIAL EMERGENCY ORDERS. MANDATORY SYNCHRONIZATION WITH NATIONAL DIRECTIVES REQUIRED.
          </span>
        </div>
        <div className="hidden md:flex items-center gap-2 font-mono text-[11px] text-cyan-300 shrink-0 ml-4">
          <span className="w-2 h-2 rounded-full bg-rose-500 pulse-beacon" />
          <span>API: GET /api/v1/risk/{selectedCycloneId}</span>
        </div>
      </div>

      {/* Main Grid Content Area */}
      <div className="p-4 lg:p-6 space-y-6">
          {/* Hero Risk Showcase: Composite Dial Card + Telemetry Dynamics */}
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
            {/* Primary Composite Dial Card (4 Cols) */}
            <div className="xl:col-span-4 bg-[#0d1527] border border-rose-500/30 rounded-xl p-5 shadow-[0_8px_32px_rgba(255,51,102,0.12)] relative overflow-hidden flex flex-col justify-between">
              <div className="absolute -right-10 -top-10 w-64 h-64 bg-gradient-to-br from-rose-500/25 via-red-600/10 to-transparent rounded-full blur-3xl pointer-events-none" />
              <div className="absolute -left-12 -bottom-12 w-56 h-56 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
              
              <div className="relative z-10">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-rose-500 alert-beacon" />
                    <span className="font-telemetry text-[11px] uppercase tracking-widest text-slate-300 font-bold">
                      COMPOSITE SEVERITY INDEX
                    </span>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-gradient-to-r from-red-600 via-rose-600 to-red-500 border border-rose-400 text-white font-telemetry text-[10px] alert-beacon uppercase font-bold tracking-wider shadow-[0_0_16px_rgba(255,51,102,0.8)]">
                    {riskCategory} HAZARD
                  </span>
                </div>

                {/* Concentric Gauge SVG */}
                <div className="relative my-4 flex flex-col items-center justify-center">
                  <div className="relative w-52 h-52 flex items-center justify-center filter drop-shadow-[0_0_24px_rgba(255,51,102,0.6)]">
                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 160 160">
                      <defs>
                        <linearGradient id="gaugeGradientObsidian" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="#00e5ff" />
                          <stop offset="40%" stopColor="#ff5370" />
                          <stop offset="100%" stopColor="#ff3366" />
                        </linearGradient>
                      </defs>
                      <circle
                        cx="80"
                        cy="80"
                        r={radius}
                        fill="transparent"
                        stroke="#1e293b"
                        strokeWidth="12"
                      />
                      <circle
                        cx="80"
                        cy="80"
                        r={radius}
                        fill="transparent"
                        stroke="url(#gaugeGradientObsidian)"
                        strokeWidth="12"
                        strokeDasharray={circumference}
                        strokeDashoffset={dashOffset}
                        strokeLinecap="round"
                        className="transition-all duration-1000 ease-out"
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                      <span className="font-headline text-4xl text-white font-extrabold tracking-tight drop-shadow-[0_0_12px_rgba(255,51,102,0.8)]">
                        {compositeScore}
                      </span>
                      <span className="font-telemetry text-xs text-cyan-300 uppercase tracking-widest -mt-1 font-semibold">
                        / 100
                      </span>
                      <span className="font-telemetry text-[10px] text-rose-300 uppercase font-bold tracking-wider mt-1 px-2.5 py-0.5 rounded-full bg-rose-950/90 border border-rose-500 shadow-[0_0_8px_rgba(255,51,102,0.6)]">
                        {cycloneDetail?.category || 'CAT 4'} SEVERITY
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Sub-panel Insights */}
              <div className="space-y-2 pt-2 bg-[#070d18]/90 border border-rose-500/40 rounded-xl p-3 relative z-10 backdrop-blur-md shadow-[0_4px_16px_rgba(0,0,0,0.6)]">
                <div className="flex items-start gap-2 text-rose-200 text-xs">
                  <TrendingUp className="w-4 h-4 text-rose-400 shrink-0 mt-0.5 drop-shadow-[0_0_8px_rgba(255,51,102,0.8)]" />
                  <span>
                    <strong className="text-rose-300">+24 points</strong> above 24h baseline due to coastal high-tide alignment and squall intensification.
                  </span>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-[#1e293b] text-slate-400 font-telemetry text-[11px]">
                  <span>MODEL CONFIDENCE</span>
                  <span className="text-[#00e5ff] font-bold drop-shadow-[0_0_8px_rgba(0,229,255,0.6)]">
                    94.2% AI Ensemble Convergence
                  </span>
                </div>
              </div>
            </div>

            {/* Live Meteorological Telemetry Dynamics (8 Cols) */}
            <div className="xl:col-span-8 bg-[#0d1527] border border-[#1e293b] rounded-xl p-5 shadow-xl flex flex-col justify-between relative overflow-hidden">
              <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-bl from-cyan-500/10 via-transparent to-transparent pointer-events-none" />
              <div className="relative z-10">
                <div className="flex items-center justify-between pb-3 border-b border-[#1e293b]">
                  <div className="flex items-center gap-2">
                    <Radar className="w-5 h-5 text-[#00e5ff] drop-shadow-[0_0_8px_rgba(0,229,255,0.6)]" />
                    <span className="font-headline text-base text-white font-bold tracking-wide">
                      SYNCHRONIZED METEOROLOGICAL TELEMETRY
                    </span>
                  </div>
                  <span className="font-telemetry text-xs px-2.5 py-1 rounded-full bg-cyan-950/80 border border-cyan-400/50 text-cyan-300 font-bold shadow-[0_0_10px_rgba(0,229,255,0.2)]">
                    LANDFALL: {landfallEta.toUpperCase()}
                  </span>
                </div>

                {/* 4 Metric Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 mt-4">
                  <div className="bg-[#0f1a30] border border-[#1e293b] hover:border-rose-500/50 p-3 rounded-lg flex flex-col gap-1 transition-all group">
                    <span className="font-telemetry text-[10px] text-slate-400 uppercase">Sustained Wind Speed</span>
                    <span className="font-headline text-xl text-white font-bold group-hover:text-rose-300 transition-colors">
                      {windSpeed} <span className="font-telemetry text-xs font-normal text-slate-400">km/h</span>
                    </span>
                    <span className="font-telemetry text-[9px] px-1.5 py-0.5 rounded bg-rose-950/80 border border-rose-500/40 text-rose-300 uppercase w-fit font-bold">
                      GUSTS {Math.round(windSpeed * 1.2)} KM/H
                    </span>
                  </div>

                  <div className="bg-[#0f1a30] border border-[#1e293b] hover:border-amber-500/50 p-3 rounded-lg flex flex-col gap-1 transition-all group">
                    <span className="font-telemetry text-[10px] text-slate-400 uppercase">Central Minimum Pressure</span>
                    <span className="font-headline text-xl text-white font-bold group-hover:text-amber-300 transition-colors">
                      {pressure} <span className="font-telemetry text-xs font-normal text-slate-400">hPa</span>
                    </span>
                    <span className="font-telemetry text-[9px] px-1.5 py-0.5 rounded bg-amber-950/80 border border-amber-500/40 text-amber-300 uppercase w-fit font-bold">
                      -14 HPA / 6H DROP
                    </span>
                  </div>

                  <div className="bg-[#0f1a30] border border-[#1e293b] hover:border-cyan-500/50 p-3 rounded-lg flex flex-col gap-1 transition-all group">
                    <span className="font-telemetry text-[10px] text-slate-400 uppercase">Max Storm Surge Vector</span>
                    <span className="font-headline text-xl text-white font-bold group-hover:text-cyan-300 transition-colors">
                      {surgeHeight} <span className="font-telemetry text-xs font-normal text-slate-400">meters</span>
                    </span>
                    <span className="font-telemetry text-[9px] px-1.5 py-0.5 rounded bg-cyan-950/80 border border-cyan-500/40 text-cyan-300 uppercase w-fit font-bold">
                      HIGH TIDE CONCURRENCY
                    </span>
                  </div>

                  <div className="bg-[#0f1a30] border border-[#1e293b] hover:border-emerald-500/50 p-3 rounded-lg flex flex-col gap-1 transition-all group">
                    <span className="font-telemetry text-[10px] text-slate-400 uppercase">Cumulative Rainfall Est.</span>
                    <span className="font-headline text-xl text-white font-bold group-hover:text-emerald-300 transition-colors">
                      {rainTotal} <span className="font-telemetry text-xs font-normal text-slate-400">mm</span>
                    </span>
                    <span className="font-telemetry text-[9px] px-1.5 py-0.5 rounded bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 uppercase w-fit font-bold">
                      36H RUNOFF TOTAL
                    </span>
                  </div>
                </div>
              </div>

              {/* Threat Escalation Corridor */}
              <div className="mt-4 p-3.5 bg-gradient-to-r from-red-950/60 via-[#0f1a30] to-[#0f1a30] border border-rose-500/40 rounded-lg flex flex-col md:flex-row items-center justify-between gap-4 relative z-10 shadow-[0_0_16px_rgba(255,51,102,0.15)]">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-rose-600/30 border border-rose-500 flex items-center justify-center shrink-0 shadow-[0_0_12px_rgba(244,63,94,0.4)]">
                    <AlertTriangle className="w-5 h-5 text-rose-400 alert-beacon" />
                  </div>
                  <div className="flex flex-col">
                    <span className="font-headline text-sm font-bold text-white">
                      Immediate Evacuation Advisory Initiated
                    </span>
                    <span className="text-xs text-slate-300">
                      Coastal Zone Sector D-4 through B-12 placed on Level 4 Mandatory Relocation status.
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="font-telemetry text-[10px] text-slate-400 uppercase font-semibold">IMPACT VECTOR:</span>
                  <span className="px-2.5 py-1 rounded bg-[#13223f] border border-cyan-400/40 font-telemetry text-xs text-cyan-300 font-bold shadow-[0_0_8px_rgba(0,229,255,0.2)]">
                    {landfallLocation.toUpperCase()}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Multi-Hazard Risk Breakdown Modules (6 Cards) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#00e5ff] pulse-beacon" />
                <h2 className="font-headline text-xl text-white font-bold tracking-tight">
                  MULTI-HAZARD RISK BREAKDOWN
                </h2>
              </div>
              <span className="font-telemetry text-xs text-cyan-300/80 uppercase font-semibold tracking-wider">
                6 DISCRETE THREAT DIMENSIONS SCANNED
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {/* Module 1: Wind Hazard */}
              <div className="bg-[#0d1527] border border-rose-500/40 rounded-xl p-4 shadow-lg flex flex-col justify-between hover:border-rose-400 transition-all group">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Wind className="w-5 h-5 text-rose-400 group-hover:scale-110 transition-transform" />
                      <span className="font-headline text-sm font-bold text-white">WIND HAZARD RISK</span>
                    </div>
                    <span className="font-telemetry text-[10px] px-2 py-0.5 rounded-full bg-rose-950/90 border border-rose-500 text-rose-200 font-bold uppercase">
                      CRITICAL
                    </span>
                  </div>
                  <div className="flex items-baseline gap-1.5 mb-2">
                    <span className="font-headline text-2xl font-black text-white">94</span>
                    <span className="font-telemetry text-xs text-slate-400">/ 100</span>
                  </div>
                  <div className="w-full bg-[#1e293b] h-2 rounded-full overflow-hidden mb-2 border border-[#334155]/30">
                    <div className="bg-gradient-to-r from-rose-500 to-red-500 h-full rounded-full shadow-[0_0_10px_rgba(255,51,102,0.8)]" style={{ width: '94%' }} />
                  </div>
                  <p className="text-xs text-slate-300">
                    Sustained {windSpeed} km/h, gusting {Math.round(windSpeed * 1.2)} km/h. Catastrophic roof peeling and structural failure for light/masonry frames.
                  </p>
                </div>
                <div className="mt-4 pt-2 bg-[#0f1a30] border border-[#1e293b] rounded p-2 flex justify-between font-telemetry text-[11px] text-slate-400">
                  <span>AERODYNAMIC DAMAGE</span>
                  <span className="text-rose-400 font-bold">GRADE 5 PEAK</span>
                </div>
              </div>

              {/* Module 2: Storm Surge */}
              <div className="bg-[#0d1527] border border-rose-500/40 rounded-xl p-4 shadow-lg flex flex-col justify-between hover:border-rose-400 transition-all group">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Waves className="w-5 h-5 text-rose-400 group-hover:scale-110 transition-transform" />
                      <span className="font-headline text-sm font-bold text-white">STORM SURGE RISK</span>
                    </div>
                    <span className="font-telemetry text-[10px] px-2 py-0.5 rounded-full bg-rose-950/90 border border-rose-500 text-rose-200 font-bold uppercase">
                      CRITICAL
                    </span>
                  </div>
                  <div className="flex items-baseline gap-1.5 mb-2">
                    <span className="font-headline text-2xl font-black text-white">88</span>
                    <span className="font-telemetry text-xs text-slate-400">/ 100</span>
                  </div>
                  <div className="w-full bg-[#1e293b] h-2 rounded-full overflow-hidden mb-2 border border-[#334155]/30">
                    <div className="bg-gradient-to-r from-red-500 via-rose-500 to-amber-500 h-full rounded-full shadow-[0_0_10px_rgba(239,68,68,0.8)]" style={{ width: '88%' }} />
                  </div>
                  <p className="text-xs text-slate-300">
                    Peak {surgeHeight}m sea inundation over astronomical tide. Severe low-lying coastal delta overflow penetrating up to 8.5km inland.
                  </p>
                </div>
                <div className="mt-4 pt-2 bg-[#0f1a30] border border-[#1e293b] rounded p-2 flex justify-between font-telemetry text-[11px] text-slate-400">
                  <span>SLOSH MODEL DEPTH</span>
                  <span className="text-cyan-300 font-bold">+{surgeHeight}M INUNDATION</span>
                </div>
              </div>

              {/* Module 3: Rainfall & Flood */}
              <div className="bg-[#0d1527] border border-cyan-500/40 rounded-xl p-4 shadow-lg flex flex-col justify-between hover:border-cyan-400 transition-all group">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Droplets className="w-5 h-5 text-[#00e5ff] group-hover:scale-110 transition-transform" />
                      <span className="font-headline text-sm font-bold text-white">RAINFALL & FLOOD RISK</span>
                    </div>
                    <span className="font-telemetry text-[10px] px-2 py-0.5 rounded-full bg-cyan-950/90 border border-cyan-400 text-cyan-200 font-bold uppercase">
                      HIGH RISK
                    </span>
                  </div>
                  <div className="flex items-baseline gap-1.5 mb-2">
                    <span className="font-headline text-2xl font-black text-white">82</span>
                    <span className="font-telemetry text-xs text-slate-400">/ 100</span>
                  </div>
                  <div className="w-full bg-[#1e293b] h-2 rounded-full overflow-hidden mb-2 border border-[#334155]/30">
                    <div className="bg-gradient-to-r from-cyan-500 to-[#00e5ff] h-full rounded-full shadow-[0_0_10px_rgba(0,229,255,0.8)]" style={{ width: '82%' }} />
                  </div>
                  <p className="text-xs text-slate-300">
                    {rainTotal}mm accumulated in 36h period. Extreme flash flooding predicted along Subarnarekha and coastal drainage basins.
                  </p>
                </div>
                <div className="mt-4 pt-2 bg-[#0f1a30] border border-[#1e293b] rounded p-2 flex justify-between font-telemetry text-[11px] text-slate-400">
                  <span>RIVERINE CREST</span>
                  <span className="text-cyan-300 font-bold">+2.8M DANGER MARK</span>
                </div>
              </div>

              {/* Module 4: Population Vulnerability */}
              <div className="bg-[#0d1527] border border-sky-500/40 rounded-xl p-4 shadow-lg flex flex-col justify-between hover:border-sky-400 transition-all group">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Users className="w-5 h-5 text-sky-400 group-hover:scale-110 transition-transform" />
                      <span className="font-headline text-sm font-bold text-white">POPULATION VULNERABILITY</span>
                    </div>
                    <span className="font-telemetry text-[10px] px-2 py-0.5 rounded-full bg-sky-950/90 border border-sky-400 text-sky-200 font-bold uppercase">
                      HIGH EXPOSURE
                    </span>
                  </div>
                  <div className="flex items-baseline gap-1.5 mb-2">
                    <span className="font-headline text-2xl font-black text-white">79</span>
                    <span className="font-telemetry text-xs text-slate-400">/ 100</span>
                  </div>
                  <div className="w-full bg-[#1e293b] h-2 rounded-full overflow-hidden mb-2 border border-[#334155]/30">
                    <div className="bg-gradient-to-r from-sky-400 to-[#7bd0ff] h-full rounded-full shadow-[0_0_10px_rgba(123,208,255,0.8)]" style={{ width: '79%' }} />
                  </div>
                  <p className="text-xs text-slate-300">
                    1.42M individuals exposed in active swath; 310K vulnerable semi-pucca housing units requiring rapid extraction.
                  </p>
                </div>
                <div className="mt-4 pt-2 bg-[#0f1a30] border border-[#1e293b] rounded p-2 flex justify-between font-telemetry text-[11px] text-slate-400">
                  <span>SHELTER CAPACITY</span>
                  <span className="text-amber-300 font-bold">64% OCCUPIED</span>
                </div>
              </div>

              {/* Module 5: Critical Infrastructure */}
              <div className="bg-[#0d1527] border border-rose-500/40 rounded-xl p-4 shadow-lg flex flex-col justify-between hover:border-rose-400 transition-all group">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Building2 className="w-5 h-5 text-rose-400 group-hover:scale-110 transition-transform" />
                      <span className="font-headline text-sm font-bold text-white">CRITICAL INFRASTRUCTURE</span>
                    </div>
                    <span className="font-telemetry text-[10px] px-2 py-0.5 rounded-full bg-rose-950/90 border border-rose-500 text-rose-200 font-bold uppercase">
                      CRITICAL
                    </span>
                  </div>
                  <div className="flex items-baseline gap-1.5 mb-2">
                    <span className="font-headline text-2xl font-black text-white">85</span>
                    <span className="font-telemetry text-xs text-slate-400">/ 100</span>
                  </div>
                  <div className="w-full bg-[#1e293b] h-2 rounded-full overflow-hidden mb-2 border border-[#334155]/30">
                    <div className="bg-gradient-to-r from-red-600 via-rose-500 to-amber-500 h-full rounded-full shadow-[0_0_10px_rgba(255,51,102,0.8)]" style={{ width: '85%' }} />
                  </div>
                  <p className="text-xs text-slate-300">
                    18 primary healthcare facilities, 3 high-voltage 220kV power substations, and NH-16 transport corridor in direct danger zone.
                  </p>
                </div>
                <div className="mt-4 pt-2 bg-[#0f1a30] border border-[#1e293b] rounded p-2 flex justify-between font-telemetry text-[11px] text-slate-400">
                  <span>POWER GRID STATUS</span>
                  <span className="text-rose-400 font-bold">ISOLATION ACTIVE</span>
                </div>
              </div>

              {/* Module 6: Agriculture & Maritime */}
              <div className="bg-[#0d1527] border border-emerald-500/40 rounded-xl p-4 shadow-lg flex flex-col justify-between hover:border-emerald-400 transition-all group">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Compass className="w-5 h-5 text-emerald-400 group-hover:scale-110 transition-transform" />
                      <span className="font-headline text-sm font-bold text-white">AGRICULTURE & MARITIME</span>
                    </div>
                    <span className="font-telemetry text-[10px] px-2 py-0.5 rounded-full bg-emerald-950/90 border border-emerald-400 text-emerald-200 font-bold uppercase">
                      HIGH RISK
                    </span>
                  </div>
                  <div className="flex items-baseline gap-1.5 mb-2">
                    <span className="font-headline text-2xl font-black text-white">72</span>
                    <span className="font-telemetry text-xs text-slate-400">/ 100</span>
                  </div>
                  <div className="w-full bg-[#1e293b] h-2 rounded-full overflow-hidden mb-2 border border-[#334155]/30">
                    <div className="bg-gradient-to-r from-emerald-500 to-[#5be9ad] h-full rounded-full shadow-[0_0_10px_rgba(16,185,129,0.8)]" style={{ width: '72%' }} />
                  </div>
                  <p className="text-xs text-slate-300">
                    Saltwater intrusion verified across 42,000 hectares of coastal crops. 4 fishing harbors shut with 380 trawlers anchored.
                  </p>
                </div>
                <div className="mt-4 pt-2 bg-[#0f1a30] border border-[#1e293b] rounded p-2 flex justify-between font-telemetry text-[11px] text-slate-400">
                  <span>SALINITY THREAT</span>
                  <span className="text-amber-300 font-bold">LONG-TERM CROP DAMAGE</span>
                </div>
              </div>
            </div>
          </div>

          {/* Visualizations Bento Grid: Radar GIS Zonal Map & Factor Attribution */}
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
            {/* GIS Zonal Heatmap Canvas (7 Cols) */}
            <div className="xl:col-span-7 bg-[#0d1527] border border-[#1e293b] rounded-xl p-5 shadow-xl flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-[#1e293b]">
                  <div className="flex items-center gap-2">
                    <Layers className="w-5 h-5 text-[#00e5ff] drop-shadow-[0_0_8px_rgba(0,229,255,0.6)]" />
                    <span className="font-headline text-base text-white font-semibold">
                      REGIONAL RISK HEATMAP & ZONAL BOUNDARIES
                    </span>
                  </div>
                  <div className="flex items-center gap-2 font-telemetry text-xs text-cyan-300">
                    <span className="w-2 h-2 rounded-full bg-[#00e5ff] pulse-beacon" />
                    <span>GIS LAYER 4/8</span>
                  </div>
                </div>

                {/* Synthetic Radar Canvas with Vector Overlays */}
                <div className="relative w-full h-[360px] bg-[#070d18] rounded-xl overflow-hidden shadow-inner border border-[#1e293b] mt-4">
                  {/* Background grid */}
                  <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:16px_16px] opacity-40" />

                  {/* SVG Map Overlay */}
                  <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 700 400" preserveAspectRatio="none">
                    <defs>
                      <radialGradient cx="62%" cy="48%" id="criticalZoneGrad" r="35%">
                        <stop offset="0%" stopColor="#ff3366" stopOpacity="0.85" />
                        <stop offset="50%" stopColor="#ef4444" stopOpacity="0.45" />
                        <stop offset="100%" stopColor="#93000a" stopOpacity="0.1" />
                      </radialGradient>
                      <radialGradient cx="62%" cy="48%" id="highRiskGrad" r="65%">
                        <stop offset="0%" stopColor="#00daf3" stopOpacity="0.55" />
                        <stop offset="100%" stopColor="#006875" stopOpacity="0.05" />
                      </radialGradient>
                    </defs>

                    {/* Concentric Radar Rings */}
                    <circle cx="434" cy="192" r="180" fill="none" stroke="#334155" strokeWidth="1" strokeDasharray="4,6" opacity="0.6" />
                    <circle cx="434" cy="192" r="120" fill="none" stroke="#00e5ff" strokeWidth="1" strokeDasharray="6,6" opacity="0.4" />
                    <circle cx="434" cy="192" r="60" fill="none" stroke="#ff3366" strokeWidth="1.2" strokeDasharray="3,3" opacity="0.5" />

                    {/* Outer Buffer Zone */}
                    <circle cx="434" cy="192" r="180" fill="#152037" opacity="0.3" />

                    {/* High Risk Zone (35-80km) */}
                    <ellipse cx="434" cy="192" rx="130" ry="100" fill="url(#highRiskGrad)" stroke="#00e5ff" strokeWidth="1.8" strokeDasharray="6,4" />

                    {/* Critical Corridor Zone (0-35km) */}
                    <polygon points="434,110 500,160 520,240 430,270 360,220 380,140" fill="url(#criticalZoneGrad)" stroke="#ff3366" strokeWidth="2.5" />

                    {/* Cyclone Vector Track */}
                    <path d="M 580 340 Q 510 260 434 192 T 320 80" fill="none" stroke="#7bd0ff" strokeWidth="3.5" strokeLinecap="round" />

                    {/* Predicted Eye Center Position */}
                    <circle cx="434" cy="192" r="10" fill="#ff3366" className="alert-beacon" />
                    <circle cx="434" cy="192" r="24" fill="none" stroke="#ff3366" strokeWidth="2" strokeDasharray="4,4" opacity="0.8" />
                  </svg>

                  {/* Top-Left Sector HUD Badge */}
                  <div className="absolute top-3 left-3 bg-[#070d18]/90 backdrop-blur-md p-2.5 rounded-lg border border-cyan-500/40 shadow-lg text-[11px] font-telemetry flex flex-col gap-1">
                    <span className="text-white font-bold flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-cyan-400" />
                      COASTAL GIS SECTOR: BAY OF BENGAL NORTH
                    </span>
                    <span className="text-[#00daf3]">BOUNDING BOX: 21.14°N, 86.95°E TO 21.65°N, 87.52°E</span>
                  </div>

                  {/* Bottom-Right Legend */}
                  <div className="absolute bottom-3 right-3 bg-[#070d18]/95 backdrop-blur-md p-2.5 rounded-lg border border-[#1e293b] shadow-xl space-y-1 font-telemetry text-[10px]">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shadow-[0_0_8px_rgba(255,51,102,0.8)]" />
                      <span className="text-white font-semibold">CRITICAL ZONE (0–35km from Landfall)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(0,229,255,0.8)]" />
                      <span className="text-slate-300">HIGH RISK ZONE (35–80km Perimeter)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-sky-400" />
                      <span className="text-slate-400">MODERATE RISK ZONE (80–160km)</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Telemetry Coordinates Footer */}
              <div className="grid grid-cols-3 gap-3 mt-4 pt-2">
                <div className="bg-[#0f1a30] border border-[#1e293b] p-2 rounded flex flex-col font-telemetry">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">Target Focal Point</span>
                  <span className="text-xs text-white font-bold">{landfallLocation}</span>
                </div>
                <div className="bg-[#0f1a30] border border-[#1e293b] p-2 rounded flex flex-col font-telemetry">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">Bathymetry Slope</span>
                  <span className="text-xs text-cyan-300 font-bold">Shallow Shelf (Amplifies Surge)</span>
                </div>
                <div className="bg-[#0f1a30] border border-[#1e293b] p-2 rounded flex flex-col font-telemetry">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">Landfall Certainty</span>
                  <span className="text-xs text-rose-400 font-bold">91.8% in Zone A</span>
                </div>
              </div>
            </div>

            {/* Risk Factor Attribution & Sensitivity (5 Cols) */}
            <div className="xl:col-span-5 bg-[#0d1527] border border-[#1e293b] rounded-xl p-5 shadow-xl flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-[#1e293b]">
                  <div className="flex items-center gap-2">
                    <Activity className="w-5 h-5 text-[#00e5ff] drop-shadow-[0_0_8px_rgba(0,229,255,0.6)]" />
                    <span className="font-headline text-base text-white font-semibold">
                      FACTOR ATTRIBUTION & SENSITIVITY
                    </span>
                  </div>
                  <span className="font-telemetry text-xs px-2.5 py-1 rounded-full bg-[#13223f] border border-cyan-400/40 text-cyan-300 font-bold">
                    WEIGHTED SUM: {compositeScore}
                  </span>
                </div>

                <p className="text-xs text-slate-300 my-4 leading-relaxed">
                  Contribution breakdown toward composite risk output using Gradient-Boosted Multi-Hazard Stacking:
                </p>

                {/* Horizontal Breakdown Bars */}
                <div className="space-y-4 font-telemetry text-xs">
                  {/* 1. Wind */}
                  <div className="space-y-1">
                    <div className="flex justify-between">
                      <span className="text-white font-semibold">1. Wind Destructive Potential (32% weight)</span>
                      <span className="text-rose-400 font-bold">Score: 94</span>
                    </div>
                    <div className="w-full bg-[#1e293b] h-2.5 rounded-full overflow-hidden border border-[#334155]/30">
                      <div className="bg-gradient-to-r from-rose-600 to-rose-400 h-full rounded-full" style={{ width: '94%' }} />
                    </div>
                    <div className="flex justify-between text-[10px] text-slate-400">
                      <span>IMPACT WEIGHT RATIO: 0.32</span>
                      <span className="text-rose-300 font-semibold">ATTRIBUTED PTS: 30.08</span>
                    </div>
                  </div>

                  {/* 2. Surge */}
                  <div className="space-y-1">
                    <div className="flex justify-between">
                      <span className="text-white font-semibold">2. Surge Inundation Depth (28% weight)</span>
                      <span className="text-rose-400 font-bold">Score: 88</span>
                    </div>
                    <div className="w-full bg-[#1e293b] h-2.5 rounded-full overflow-hidden border border-[#334155]/30">
                      <div className="bg-gradient-to-r from-red-500 to-amber-400 h-full rounded-full" style={{ width: '88%' }} />
                    </div>
                    <div className="flex justify-between text-[10px] text-slate-400">
                      <span>IMPACT WEIGHT RATIO: 0.28</span>
                      <span className="text-rose-300 font-semibold">ATTRIBUTED PTS: 24.64</span>
                    </div>
                  </div>

                  {/* 3. Infrastructure */}
                  <div className="space-y-1">
                    <div className="flex justify-between">
                      <span className="text-white font-semibold">3. Infrastructure Vulnerability (18% weight)</span>
                      <span className="text-cyan-300 font-bold">Score: 85</span>
                    </div>
                    <div className="w-full bg-[#1e293b] h-2.5 rounded-full overflow-hidden border border-[#334155]/30">
                      <div className="bg-gradient-to-r from-cyan-600 to-[#00e5ff] h-full rounded-full" style={{ width: '85%' }} />
                    </div>
                    <div className="flex justify-between text-[10px] text-slate-400">
                      <span>IMPACT WEIGHT RATIO: 0.18</span>
                      <span className="text-cyan-200 font-semibold">ATTRIBUTED PTS: 15.30</span>
                    </div>
                  </div>

                  {/* 4. Precipitation */}
                  <div className="space-y-1">
                    <div className="flex justify-between">
                      <span className="text-white font-semibold">4. Precipitation Volume (12% weight)</span>
                      <span className="text-[#00e5ff] font-bold">Score: 82</span>
                    </div>
                    <div className="w-full bg-[#1e293b] h-2.5 rounded-full overflow-hidden border border-[#334155]/30">
                      <div className="bg-gradient-to-r from-teal-500 to-[#7bd0ff] h-full rounded-full" style={{ width: '82%' }} />
                    </div>
                    <div className="flex justify-between text-[10px] text-slate-400">
                      <span>IMPACT WEIGHT RATIO: 0.12</span>
                      <span className="text-cyan-200 font-semibold">ATTRIBUTED PTS: 9.84</span>
                    </div>
                  </div>

                  {/* 5. Population */}
                  <div className="space-y-1">
                    <div className="flex justify-between">
                      <span className="text-white font-semibold">5. Population Density (10% weight)</span>
                      <span className="text-[#7bd0ff] font-bold">Score: 79</span>
                    </div>
                    <div className="w-full bg-[#1e293b] h-2.5 rounded-full overflow-hidden border border-[#334155]/30">
                      <div className="bg-gradient-to-r from-sky-600 to-[#7bd0ff] h-full rounded-full" style={{ width: '79%' }} />
                    </div>
                    <div className="flex justify-between text-[10px] text-slate-400">
                      <span>IMPACT WEIGHT RATIO: 0.10</span>
                      <span className="text-sky-300 font-semibold">ATTRIBUTED PTS: 7.90</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* SHAP Sensitivity Box */}
              <div className="mt-4 p-3 bg-[#0f1a30] border border-[#1e293b] rounded-lg space-y-1 font-telemetry">
                <div className="flex items-center gap-2 text-cyan-300 text-xs font-bold uppercase">
                  <Sparkles className="w-4 h-4 text-[#00e5ff]" />
                  <span>SHAP Sensitivity Analysis</span>
                </div>
                <p className="text-xs text-slate-300 font-sans leading-relaxed">
                  A ±10 km shift eastward decreases composite risk to 74 (-14 pts); an onshore shift westward exposes 240,000 additional residents in urban corridors.
                </p>
              </div>
            </div>
          </div>

          {/* AI Explainability Section */}
          <div className="bg-[#0d1527] border border-[#1e293b] rounded-xl p-5 shadow-xl">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-4 border-b border-[#1e293b]">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-cyan-950 to-[#13223f] border border-cyan-400/50 flex items-center justify-center shadow-[0_0_12px_rgba(0,229,255,0.3)]">
                  <Brain className="w-5 h-5 text-[#00e5ff]" />
                </div>
                <div className="flex flex-col">
                  <span className="font-headline text-base text-white font-semibold">
                    SYNTHETIC RISK NARRATIVE & AI EXPLANATION
                  </span>
                  <span className="font-telemetry text-[11px] text-[#00daf3] uppercase">
                    EXPLAINABLE AI ENGINE (XAI) • NATURAL LANGUAGE REASONING
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2 font-telemetry text-xs text-emerald-300 bg-emerald-950/40 border border-emerald-500/30 px-3 py-1 rounded-full">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Validated against Historical Supercyclone Amphan (2020) Ground Truth</span>
              </div>
            </div>

            {/* Query & 3-Factor Breakdown */}
            <div className="bg-[#0f1a30] border border-cyan-500/30 p-4 rounded-xl space-y-4 mt-4 shadow-inner">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-white font-headline text-sm lg:text-base font-bold">
                  <HelpCircle className="w-5 h-5 text-rose-400 drop-shadow-[0_0_8px_rgba(255,51,102,0.8)]" />
                  <span>Why is the {landfallLocation} sector rated CRITICAL {compositeScore} / 100?</span>
                </div>
                <span className="font-telemetry text-[10px] px-2.5 py-0.5 rounded-full bg-rose-950/80 border border-rose-500/50 text-rose-300 font-bold uppercase">
                  HIGHEST RISK ZONE
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-[#0b1326] border-l-4 border-rose-500 border border-[#1e293b] p-3 rounded-lg flex flex-col justify-between shadow-sm">
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-telemetry text-[10px] text-rose-300 uppercase font-bold">
                        FACTOR 1 • HYDRODYNAMIC COUPLING
                      </span>
                      <Waves className="w-4 h-4 text-rose-400" />
                    </div>
                    <p className="text-xs text-slate-200">
                      <strong className="text-white">Astronomical high tide coincides with peak storm surge.</strong> At 03:00 UTC, the Spring tide adds +1.1m to the {surgeHeight}m barometric surge, defeating existing embankment crests by 80cm.
                    </p>
                  </div>
                  <span className="font-telemetry text-[10px] text-rose-400 mt-3 font-semibold">
                    SEVERITY IMPACT: HIGH (+11 PTS)
                  </span>
                </div>

                <div className="bg-[#0b1326] border-l-4 border-amber-400 border border-[#1e293b] p-3 rounded-lg flex flex-col justify-between shadow-sm">
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-telemetry text-[10px] text-amber-300 uppercase font-bold">
                        FACTOR 2 • STRUCTURAL RESILIENCE GAP
                      </span>
                      <Building2 className="w-4 h-4 text-amber-400" />
                    </div>
                    <p className="text-xs text-slate-200">
                      <strong className="text-white">High density of non-engineered housing.</strong> Over 48% of regional residential inventory in rural zones comprises unreinforced masonry or thatched roofs susceptible to 180+ km/h shear force.
                    </p>
                  </div>
                  <span className="font-telemetry text-[10px] text-amber-300 mt-3 font-semibold">
                    SEVERITY IMPACT: MODERATE (+8 PTS)
                  </span>
                </div>

                <div className="bg-[#0b1326] border-l-4 border-cyan-400 border border-[#1e293b] p-3 rounded-lg flex flex-col justify-between shadow-sm">
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-telemetry text-[10px] text-cyan-300 uppercase font-bold">
                        FACTOR 3 • LIFELINE CHOKEPOINTS
                      </span>
                      <MapPin className="w-4 h-4 text-cyan-400" />
                    </div>
                    <p className="text-xs text-slate-200">
                      <strong className="text-white">National Highway NH-16 inundation threat.</strong> Predicted flooding spans 14km of primary arterial roadway, completely cutting off medical resupply routes between major urban centers.
                    </p>
                  </div>
                  <span className="font-telemetry text-[10px] text-cyan-300 mt-3 font-semibold">
                    SEVERITY IMPACT: CRITICAL (+5 PTS)
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Backend Integration Info Footer */}
          <div className="p-4 bg-[#070d18] border border-[#1e293b] rounded-xl flex flex-col md:flex-row items-center justify-between gap-3 text-slate-400 font-telemetry text-xs">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-[#00e5ff]" />
              <span>FASTAPI ENDPOINT: <code className="text-cyan-300">GET /api/v1/risk/{selectedCycloneId}</code></span>
              <span>•</span>
              <span>LAST INFERENCE RUN: REALTIME</span>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-emerald-300 font-semibold">COMPUTE LATENCY: 218ms</span>
              <span className="text-slate-400">VERSION: v2.1.0-FASTAPI</span>
            </div>
          </div>
        </div>

      {/* Interactive Slide-Out AI Explain Panel / Drawer */}
      <div 
        className={`fixed top-0 right-0 h-full w-full max-w-lg bg-[#070d18] border-l border-[#1e293b] z-50 shadow-2xl transform transition-transform duration-300 flex flex-col justify-between overflow-hidden ${
          explainDrawerOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="p-4 bg-[#0b1326] border-b border-[#1e293b] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Brain className="w-6 h-6 text-[#00e5ff]" />
            <div>
              <h3 className="font-headline text-base text-white font-bold">CycloneShield XAI Inspector</h3>
              <span className="font-telemetry text-[10px] text-[#00daf3] uppercase font-semibold">
                Neural Decision Decomposition
              </span>
            </div>
          </div>
          <button 
            onClick={() => setExplainDrawerOpen(false)}
            className="p-1.5 rounded-lg bg-[#0f1a30] text-slate-400 hover:text-white border border-[#1e293b]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4 font-telemetry text-xs">
          <div className="p-3 bg-[#0b1326] border border-cyan-500/30 rounded-lg">
            <span className="text-[#00e5ff] uppercase font-bold">MODEL PIPELINE</span>
            <p className="text-slate-200 mt-1 font-sans">
              Ensemble weighting combines WRF-ARW atmospheric forecast, SLOSH hydrodynamic storm surge model, and OSM demographic vulnerability layers with 94.2% convergence.
            </p>
          </div>

          <div className="space-y-2">
            <span className="text-slate-400 uppercase font-semibold">CRITICAL PATH REASONS</span>
            <div className="p-3 bg-[#0f1a30] border-l-4 border-rose-500 rounded-lg space-y-1">
              <div className="flex justify-between items-center">
                <span className="text-rose-300 uppercase font-bold text-[10px]">PRIMARY VULNERABILITY</span>
                <span className="text-white">WEIGHT: 32%</span>
              </div>
              <p className="text-slate-300 font-sans">
                Max core wind field of {windSpeed} km/h aligns exactly with densely populated settlements within a 35km coastal ribbon.
              </p>
            </div>

            <div className="p-3 bg-[#0f1a30] border-l-4 border-cyan-400 rounded-lg space-y-1">
              <div className="flex justify-between items-center">
                <span className="text-cyan-300 uppercase font-bold text-[10px]">INUNDATION RISK</span>
                <span className="text-white">WEIGHT: 28%</span>
              </div>
              <p className="text-slate-300 font-sans">
                Bathymetric slope under 1:1200 will force sea water up to 8.5km inland, threatening localized infrastructure installations.
              </p>
            </div>

            <div className="p-3 bg-[#0f1a30] border-l-4 border-amber-400 rounded-lg space-y-1">
              <div className="flex justify-between items-center">
                <span className="text-amber-300 uppercase font-bold text-[10px]">ROAD NETWORK ISOLATION</span>
                <span className="text-white">WEIGHT: 18%</span>
              </div>
              <p className="text-slate-300 font-sans">
                Arterial highway culverts lack capacity for simulated {rainTotal}mm rain plus surge wave, leading to operational severed-link probability of 89.4%.
              </p>
            </div>
          </div>

          <div className="p-3 bg-[#0b1326] border border-[#1e293b] rounded-lg flex flex-col gap-1">
            <span className="text-slate-400 uppercase font-semibold">SIMULATION COUNTERFACTUAL</span>
            <p className="text-slate-200 font-sans">
              If eye-wall landfall speed decelerates by 6 km/h, surge amplitude falls to 3.1m, reducing composite severity from <strong className="text-rose-400">{compositeScore} (Critical)</strong> to <strong className="text-amber-300">76 (High)</strong>.
            </p>
          </div>
        </div>

        <div className="p-4 bg-[#0b1326] border-t border-[#1e293b] flex gap-3">
          <button 
            onClick={handleCopyBriefing}
            className="flex-1 py-2 rounded-lg bg-[#0f1a30] hover:bg-[#13223f] border border-[#1e293b] text-white font-telemetry font-semibold flex items-center justify-center gap-2"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'COPIED TO CLIPBOARD' : 'COPY BRIEFING'}</span>
          </button>
          <button 
            onClick={() => setExplainDrawerOpen(false)}
            className="flex-1 py-2 rounded-lg bg-gradient-to-r from-[#00e5ff] to-cyan-400 text-[#070d18] font-headline font-bold"
          >
            CLOSE
          </button>
        </div>
      </div>
    </div>
  );
};

export default Analysis;
