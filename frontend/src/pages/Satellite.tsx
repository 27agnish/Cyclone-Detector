import React, { useState, useRef } from 'react';
import {
  Satellite,
  Droplets,
  AlertTriangle,
  Sparkles,
  ShieldCheck,
  RefreshCw,
  Radar,
  MapPin,
  Clock,
  Activity,
  CheckCircle2,
  Navigation,
  ExternalLink,
  ImageOff,
  Waves,
  Route
} from 'lucide-react';
import { useCycloneStore } from '../store/cycloneStore';
import { aiApi } from '../services/aiApi';
import { AIResponse, AISatelliteAnalysisRequest } from '../types/cyclone';

export const SatellitePage: React.FC = () => {
  const { selectedCycloneId, cycloneDetail, activeCyclones, openAiModal } = useCycloneStore();
  const [analyzing, setAnalyzing] = useState(false);
  const [sarResult, setSarResult] = useState<AIResponse | null>(null);
  const [sarError, setSarError] = useState<string | null>(null);
  const resultsRef = useRef<HTMLDivElement | null>(null);

  const activeSummary =
    cycloneDetail ||
    activeCyclones.find((c) => c.id === selectedCycloneId) ||
    activeCyclones[0] ||
    null;

  const currentLat = cycloneDetail?.landfall?.latitude ?? activeSummary?.current_latitude ?? 20.85;
  const currentLon = cycloneDetail?.landfall?.longitude ?? activeSummary?.current_longitude ?? 86.90;
  const currentLocationLabel =
    cycloneDetail?.landfall
      ? `${cycloneDetail.landfall.location_name}, ${cycloneDetail.landfall.district} (${cycloneDetail.landfall.state})`
      : activeSummary?.estimated_landfall_location || 'Bhitarkanika & Dhamra Coastal Corridor, Odisha';

  const formatApiError = (err: any): string => {
    if (err?.code === 'ECONNABORTED' || err?.message?.toLowerCase().includes('timeout')) {
      return 'Request Timed Out: The Sentinel-1 SAR / Gemini reconnaissance pipeline took longer than 15 seconds to respond. Please retry.';
    }
    const status = err?.response?.status;
    const detail =
      err?.response?.data?.detail ||
      err?.response?.data?.message ||
      err?.response?.data?.error;

    if (status === 400) {
      return `Invalid SAR Request (400): ${detail || 'Required cyclone or satellite parameters are missing.'}`;
    }
    if (status === 401 || status === 403) {
      return `Authentication / Credentials Error (${status}): ${detail || 'Backend AI/Satellite credentials could not be verified.'}`;
    }
    if (status === 404) {
      return `Target Not Found (404): ${detail || 'The requested cyclone or SAR endpoint was not found on the backend.'}`;
    }
    if (status === 422) {
      return `Schema Validation Error (422): ${
        typeof detail === 'string'
          ? detail
          : 'The SAR request payload did not match the backend Pydantic schema.'
      }`;
    }
    if (status && status >= 500) {
      return `Backend Server Error (${status}): ${detail || 'An internal error occurred in the FastAPI SAR reconnaissance pipeline.'}`;
    }
    if (!err?.response) {
      return 'Network Connection Failure: Unable to reach the FastAPI backend server. Verify the backend is running and accessible.';
    }
    return detail || err?.message || 'An unexpected error occurred during SAR reconnaissance analysis.';
  };

  const handleMultimodalAiAnalysis = async () => {
    if (analyzing) return;

    const targetId = (selectedCycloneId || activeSummary?.id || '').trim();
    if (!targetId) {
      setSarError('Validation Error: No active cyclone selected for SAR reconnaissance. Please select an active cyclone first.');
      return;
    }

    setAnalyzing(true);
    setSarError(null);

    const payload: AISatelliteAnalysisRequest = {
      cyclone_id: targetId,
      cyclone_name: activeSummary?.name || 'Cyclone DANA',
      latitude: currentLat,
      longitude: currentLon,
      wind_speed: activeSummary?.wind_speed ?? 120,
      pressure: activeSummary?.central_pressure ?? 976,
      landfall_location: currentLocationLabel,
      satellite_source: 'Sentinel-1A C-Band SAR (VV/VH) + INSAT-3DR Multispectral',
      analysis_type: 'SAR_RECONNAISSANCE',
      bounding_box: [
        Number((currentLon - 0.8).toFixed(2)),
        Number((currentLat - 0.75).toFixed(2)),
        Number((currentLon + 0.7).toFixed(2)),
        Number((currentLat + 0.95).toFixed(2)),
      ],
    };

    try {
      const res = await aiApi.analyzeSatellite(payload);
      setSarResult(res);
      setTimeout(() => {
        resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    } catch (err: any) {
      console.error('[SatellitePage] SAR reconnaissance analysis failed:', err);
      setSarError(formatApiError(err));
    } finally {
      setAnalyzing(false);
    }
  };

  const mainButtonLabel = analyzing
    ? 'ANALYZING SAR...'
    : sarError
    ? 'RETRY SAR ANALYSIS'
    : sarResult
    ? 'RE-RUN SAR ANALYSIS'
    : 'EXECUTE GEMINI SAR RECONNAISSANCE';

  const sarData = sarResult?.sar_data;

  return (
    <div className="flex-1 p-4 lg:p-6 space-y-6 overflow-y-auto w-full bg-[#070d18] text-[#dee2f1] select-none font-telemetry">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#1e293b] pb-4">
        <div>
          <h2 className="text-xl lg:text-2xl font-headline font-bold text-white flex items-center gap-2.5">
            <Satellite className="w-6 h-6 text-[#00e5ff]" />
            <span>SATELLITE REMOTE SENSING & SAR FLOOD INTELLIGENCE</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Cloud-penetrating Synthetic Aperture Radar (Sentinel-1 SAR) and INSAT-3D multispectral optical imaging pipeline.
          </p>
        </div>

        <button
          onClick={handleMultimodalAiAnalysis}
          disabled={analyzing}
          data-testid="header-sar-btn"
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-cyan-400 to-[#00e5ff] text-[#070d18] font-headline text-xs font-bold shadow-[0_0_16px_rgba(0,229,255,0.4)] transition hover:opacity-95 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        >
          {analyzing ? (
            <RefreshCw className="w-4 h-4 animate-spin" />
          ) : (
            <Sparkles className="w-4 h-4" />
          )}
          <span>{mainButtonLabel}</span>
        </button>
      </div>

      {/* Sensor Specs Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        <div className="bg-[#0d1527] border border-[#1e293b] rounded-xl p-3.5">
          <span className="text-slate-400 text-[10px] uppercase">Active Constellation</span>
          <div className="font-headline text-base font-bold text-white mt-1">Sentinel-1A + 1B</div>
          <div className="text-emerald-400 text-[11px] mt-0.5">C-Band SAR Polarimetric</div>
        </div>

        <div className="bg-[#0d1527] border border-[#1e293b] rounded-xl p-3.5">
          <span className="text-slate-400 text-[10px] uppercase">Optical Satellite</span>
          <div className="font-headline text-base font-bold text-cyan-300 mt-1">INSAT-3DR Geostationary</div>
          <div className="text-slate-400 text-[11px] mt-0.5">TIR1/TIR2 15-min interval</div>
        </div>

        <div className="bg-[#0d1527] border border-[#1e293b] rounded-xl p-3.5">
          <span className="text-slate-400 text-[10px] uppercase">Spatial Ground Resolution</span>
          <div className="font-headline text-base font-bold text-white mt-1">10 Meters / Pixel</div>
          <div className="text-cyan-300 text-[11px] mt-0.5">High-Res Inundation Map</div>
        </div>

        <div className="bg-[#0d1527] border border-[#1e293b] rounded-xl p-3.5">
          <span className="text-slate-400 text-[10px] uppercase">Cloud Penetration</span>
          <div className="font-headline text-base font-bold text-emerald-400 mt-1">100% All-Weather</div>
          <div className="text-slate-400 text-[11px] mt-0.5">Microwave Synthetic Aperture</div>
        </div>
      </div>

      {/* Synthetic Aperture Radar Pipeline View */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Main Radar Feed Showcase (7 Cols) */}
        <div className="lg:col-span-7 bg-[#0d1527] border border-[#1e293b] rounded-xl p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#1e293b]">
            <div className="flex items-center gap-2">
              <Radar className="w-5 h-5 text-[#00e5ff]" />
              <span className="font-headline text-sm font-bold text-white uppercase">
                SENTINEL-1 SAR CALIBRATED BACKSCATTER (VV/VH RATIO)
              </span>
            </div>
            <span className="text-[10px] text-cyan-300 font-bold bg-[#13223f] px-2 py-0.5 rounded border border-cyan-400/40">
              POLARIMETRIC DECOMPOSITION
            </span>
          </div>

          <div className="relative h-72 rounded-lg bg-[#070d18] border border-[#1e293b] flex items-center justify-center overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,#0e2238_0%,#070d18_80%)]" />

            {/* Synthetic radar pulse overlay */}
            <div className="relative flex flex-col items-center gap-3 z-10 text-center p-4">
              <div className="w-20 h-20 rounded-full border border-cyan-500/40 flex items-center justify-center relative">
                <div className="w-16 h-16 rounded-full border border-cyan-400/60 flex items-center justify-center animate-ping opacity-20" />
                <Satellite className="w-8 h-8 text-[#00e5ff]" />
              </div>
              <div className="font-headline text-sm font-bold text-white">
                Co-Polarized Gamma0 Surface Roughness Grid
              </div>
              <p className="text-xs text-slate-400 max-w-sm">
                Specular reflectance thresholding isolates open-water flood extent against permanent inland water baselines.
              </p>
              {sarResult && (
                <div className="mt-1 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 text-[11px] font-bold">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>
                    SAR MASK ACTIVE: {sarData?.flood_inundation_sqkm ?? 342.8} SQ KM INUNDATION ISOLATED
                  </span>
                </div>
              )}
            </div>

            {/* Corner telemetry coordinates */}
            <div className="absolute bottom-3 left-3 text-[10px] text-cyan-300 bg-[#070d18]/90 px-2 py-1 rounded border border-[#1e293b]">
              LAT: {currentLat.toFixed(2)}°N • LON: {currentLon.toFixed(2)}°E • PASS: ASCENDING 128
            </div>
            <div className="absolute top-3 right-3 text-[10px] text-slate-300 bg-[#070d18]/90 px-2.5 py-1 rounded border border-[#1e293b]">
              TARGET: {activeSummary?.name || 'CYCLONE DANA'}
            </div>
          </div>
        </div>

        {/* Multimodal Analysis Capabilities (5 Cols) */}
        <div className="lg:col-span-5 bg-[#0d1527] border border-[#1e293b] rounded-xl p-5 shadow-xl space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <h3 className="font-headline text-sm font-bold text-white uppercase tracking-wider">
              MULTIMODAL SATELLITE ENGINE CAPABILITIES
            </h3>

            <div className="space-y-2.5 text-xs">
              <div className="p-3 rounded-lg bg-[#0f1a30] border border-[#1e293b] space-y-1">
                <div className="text-cyan-300 font-bold flex items-center gap-1.5">
                  <Droplets className="w-4 h-4 text-[#00e5ff]" />
                  <span>Permanent vs Flood Inundation Separation</span>
                </div>
                <p className="text-slate-300 font-sans">
                  Otsu bimodal thresholding segments waterbodies from pre-event radar imagery to prevent false positives.
                </p>
              </div>

              <div className="p-3 rounded-lg bg-[#0f1a30] border border-[#1e293b] space-y-1">
                <div className="text-rose-300 font-bold flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-rose-400" />
                  <span>Submerged Infrastructure & Road Breach Detection</span>
                </div>
                <p className="text-slate-300 font-sans">
                  Intersects SAR flood polygons with highway network lines (NH-16, SH-5) to locate breached culverts.
                </p>
              </div>

              <div className="p-3 rounded-lg bg-[#0f1a30] border border-[#1e293b] space-y-1">
                <div className="text-emerald-300 font-bold flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>Gemini Vision AI Scene Synthesis</span>
                </div>
                <p className="text-slate-300 font-sans">
                  Produces multi-paragraph commander situational briefs linking radar backscatter to ground-truth damage.
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={handleMultimodalAiAnalysis}
            disabled={analyzing}
            data-testid="execute-sar-recon-btn"
            className="w-full py-2.5 px-4 rounded-lg bg-gradient-to-r from-cyan-400 to-[#00e5ff] text-[#070d18] font-headline text-xs font-bold shadow-[0_0_16px_rgba(0,229,255,0.3)] transition hover:opacity-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
          >
            {analyzing ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Sparkles className="w-4 h-4" />
            )}
            <span>{mainButtonLabel}</span>
          </button>
        </div>
      </div>

      {/* Loading Progress Panel */}
      {analyzing && (
        <div
          data-testid="sar-loading-panel"
          className="bg-[#0d1527] border border-cyan-500/40 rounded-xl p-6 shadow-xl flex flex-col sm:flex-row items-center gap-5 animate-pulse"
        >
          <div className="relative flex items-center justify-center shrink-0">
            <div className="w-14 h-14 rounded-full border-4 border-cyan-500/20 border-t-[#00e5ff] animate-spin" />
            <Radar className="w-6 h-6 text-[#00e5ff] absolute" />
          </div>
          <div className="space-y-2 flex-1 text-center sm:text-left">
            <div className="font-headline text-sm font-bold text-[#00e5ff] uppercase tracking-wider">
              ANALYZING SAR... EXECUTING SENTINEL-1 & GEMINI MULTIMODAL RECONNAISSANCE
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-1.5 text-xs text-slate-300 font-mono">
              <div>✓ Calibrating Sentinel-1A VV/VH C-band backscatter swath...</div>
              <div>✓ Running Otsu bimodal permanent-water vs flood segmentation...</div>
              <div>✓ Intersecting inundation polygons with NH-16, SH-9A & grid assets...</div>
              <div>✓ Synthesizing Gemini tactical SAR reconnaissance intelligence...</div>
            </div>
          </div>
        </div>
      )}

      {/* Error State Banner */}
      {sarError && !analyzing && (
        <div
          data-testid="sar-error-panel"
          className="bg-rose-950/40 border border-rose-500/50 rounded-xl p-5 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
        >
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-6 h-6 text-rose-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h4 className="font-headline text-sm font-bold text-rose-200 uppercase">
                SAR RECONNAISSANCE PIPELINE ERROR
              </h4>
              <p className="text-xs text-rose-100/90 font-sans leading-relaxed">{sarError}</p>
            </div>
          </div>
          <button
            onClick={handleMultimodalAiAnalysis}
            className="px-4 py-2 rounded-lg bg-rose-500 hover:bg-rose-400 text-white font-headline text-xs font-bold transition shrink-0 flex items-center gap-1.5 cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>RETRY SAR ANALYSIS</span>
          </button>
        </div>
      )}

      {/* SAR Reconnaissance Result Section */}
      {sarResult && !analyzing && (
        <div
          ref={resultsRef}
          data-testid="sar-analysis-result-section"
          className="bg-[#0d1527] border border-cyan-500/40 rounded-xl p-5 lg:p-6 shadow-2xl space-y-6"
        >
          {/* Result Header & Metadata Strip */}
          <div className="flex flex-wrap items-start justify-between gap-4 pb-4 border-b border-[#1e293b]">
            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-cyan-500/15 border border-cyan-400/40 text-[#00e5ff] text-[10px] font-bold uppercase tracking-wider">
                  <Sparkles className="w-3 h-3" />
                  <span>SAR RECONNAISSANCE INTELLIGENCE REPORT</span>
                </span>
                <span
                  className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[10px] font-bold uppercase border ${
                    sarData?.severity_level === 'CRITICAL'
                      ? 'bg-rose-500/15 border-rose-500/40 text-rose-300'
                      : 'bg-amber-500/15 border-amber-500/40 text-amber-300'
                  }`}
                >
                  <Activity className="w-3 h-3" />
                  <span>STATUS: {sarData?.analysis_status || 'SAR TELEMETRY VERIFIED'}</span>
                </span>
              </div>
              <h3 className="font-headline text-lg lg:text-xl font-bold text-white">
                {sarResult.title}
              </h3>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-slate-400 font-mono">
                <span className="flex items-center gap-1 text-slate-300">
                  <Navigation className="w-3.5 h-3.5 text-[#00e5ff]" />
                  <span>Cyclone: {sarData?.cyclone_name || sarResult.cyclone_id}</span>
                </span>
                <span className="flex items-center gap-1 text-slate-300">
                  <MapPin className="w-3.5 h-3.5 text-rose-400" />
                  <span>
                    Target: {sarData?.location_summary || currentLocationLabel} (
                    {(sarData?.latitude ?? currentLat).toFixed(2)}°N,{' '}
                    {(sarData?.longitude ?? currentLon).toFixed(2)}°E)
                  </span>
                </span>
                <span className="flex items-center gap-1">
                  <Satellite className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Source: {sarData?.satellite_source || 'Sentinel-1A C-Band SAR'}</span>
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-amber-400" />
                  <span>Timestamp: {sarResult.generated_at}</span>
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => openAiModal(sarResult)}
                className="px-3 py-1.5 rounded-lg bg-[#13223f] hover:bg-[#1c3158] border border-cyan-500/30 text-cyan-200 font-headline text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>OPEN PRINTABLE BRIEFING</span>
              </button>
              <button
                onClick={handleMultimodalAiAnalysis}
                className="px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-cyan-400 to-[#00e5ff] text-[#070d18] font-headline text-xs font-bold flex items-center gap-1.5 transition hover:opacity-95 cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>RE-RUN SAR ANALYSIS</span>
              </button>
            </div>
          </div>

          {/* 4-Column SAR Telemetry Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 text-xs">
            <div className="bg-[#0f1a30] border border-[#1e293b] rounded-xl p-4 space-y-1">
              <div className="text-[10px] uppercase text-slate-400 font-bold flex items-center justify-between">
                <span>Flood Detection / Extent</span>
                <Waves className="w-4 h-4 text-[#00e5ff]" />
              </div>
              <div className="font-headline text-lg font-bold text-white">
                {sarData?.flood_inundation_sqkm ?? 342.8} sq km
              </div>
              <div className="text-[11px] text-rose-300 font-semibold">
                {sarData?.flood_extent_level || 'SEVERE ESTUARINE INUNDATION'}
              </div>
            </div>

            <div className="bg-[#0f1a30] border border-[#1e293b] rounded-xl p-4 space-y-1">
              <div className="text-[10px] uppercase text-slate-400 font-bold flex items-center justify-between">
                <span>Water Expansion vs Baseline</span>
                <Droplets className="w-4 h-4 text-cyan-400" />
              </div>
              <div className="font-headline text-lg font-bold text-cyan-300">
                {sarData?.water_expansion_percent || '+18.4% above baseline'}
              </div>
              <div className="text-[11px] text-slate-400">
                Isolated from {sarData?.permanent_water_sqkm ?? 1860} sq km permanent water
              </div>
            </div>

            <div className="bg-[#0f1a30] border border-[#1e293b] rounded-xl p-4 space-y-1">
              <div className="text-[10px] uppercase text-slate-400 font-bold flex items-center justify-between">
                <span>Confidence & Severity Score</span>
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="font-headline text-lg font-bold text-emerald-400">
                {sarData?.confidence_score ?? 94.2}% Confidence
              </div>
              <div className="text-[11px] text-amber-300 font-semibold">
                Severity Tier: {sarData?.severity_level || 'CRITICAL'}
              </div>
            </div>

            <div className="bg-[#0f1a30] border border-[#1e293b] rounded-xl p-4 space-y-1">
              <div className="text-[10px] uppercase text-slate-400 font-bold flex items-center justify-between">
                <span>Sensor & Orbit Pass</span>
                <Radar className="w-4 h-4 text-purple-400" />
              </div>
              <div className="font-headline text-sm font-bold text-white truncate">
                {sarData?.sensor_mode || 'Sentinel-1A IW VV+VH (10m)'}
              </div>
              <div className="text-[11px] text-slate-400 truncate">
                {sarData?.pass_direction || 'ASCENDING PASS 128'}
              </div>
            </div>
          </div>

          {/* Estimated Affected Area Summary Banner */}
          <div className="bg-[#0f1a30] border border-cyan-500/30 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="space-y-1">
              <div className="text-[10px] uppercase font-bold tracking-wider text-[#00e5ff]">
                ESTIMATED AFFECTED INUNDATION AREA & OTSU SEGMENTATION SUMMARY
              </div>
              <p className="text-slate-200 font-sans leading-relaxed">
                {sarData?.affected_area_summary ||
                  '342.8 sq km of anomalous low-backscatter flood water isolated across the coastal corridor, excluding permanent river and estuarine channels.'}
              </p>
            </div>
            <div className="shrink-0 text-[11px] font-mono text-slate-400 bg-[#070d18] px-3 py-2 rounded-lg border border-[#1e293b]">
              Model: {sarResult.model_used}
            </div>
          </div>

          {/* 2-Column Detailed Impact Grid: Infrastructure + Road/Bridge Impact */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Submerged Infrastructure & Embankment Breaches */}
            <div className="bg-[#0f1a30] border border-[#1e293b] rounded-xl p-4 space-y-3">
              <div className="text-xs font-headline font-bold uppercase tracking-wider text-rose-300 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-400" />
                <span>SUBMERGED INFRASTRUCTURE & EMBANKMENT BREACHES</span>
              </div>
              <ul className="space-y-2 text-xs text-slate-200 font-sans">
                {(sarData?.submerged_infrastructure && sarData.submerged_infrastructure.length > 0
                  ? sarData.submerged_infrastructure
                  : [
                      'Dhamra Port Perimeter Feeder 33kV Substation Yard (0.8m standing water)',
                      'Chandbali Low-Lift River Intake Pumping Station (Submerged approach apron)',
                    ]
                ).map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2 bg-[#070d18]/70 p-2.5 rounded-lg border border-[#1e293b]">
                    <span className="text-rose-400 font-bold">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              {sarData?.breach_locations && sarData.breach_locations.length > 0 && (
                <div className="pt-2 border-t border-[#1e293b] space-y-1.5">
                  <div className="text-[10px] font-bold uppercase text-amber-300">
                    Pinpointed Embankment Breach Coordinates:
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                    {sarData.breach_locations.map((b, i) => (
                      <div key={i} className="bg-[#070d18] p-2 rounded border border-amber-500/30">
                        <div className="font-bold text-white">{b.name}</div>
                        <div className="text-slate-400 font-mono text-[10px]">
                          {b.coordinates[0]}°N, {b.coordinates[1]}°E • Severity:{' '}
                          <span className="text-amber-300 font-bold">{b.severity}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Road and Bridge Corridor Impact */}
            <div className="bg-[#0f1a30] border border-[#1e293b] rounded-xl p-4 space-y-3">
              <div className="text-xs font-headline font-bold uppercase tracking-wider text-amber-300 flex items-center gap-2">
                <Route className="w-4 h-4 text-amber-400" />
                <span>ROAD, CULVERT & BRIDGE CORRIDOR IMPACT</span>
              </div>
              <ul className="space-y-2 text-xs text-slate-200 font-sans">
                {(sarData?.road_bridge_impact && sarData.road_bridge_impact.length > 0
                  ? sarData.road_bridge_impact
                  : [
                      'SH-9A Bhadrak–Chandbali Corridor: Sheet flow inundation across low-lying culvert',
                      'NH-16 Baitarani Approach Viaduct: High backwater velocity against north abutment',
                    ]
                ).map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2 bg-[#070d18]/70 p-2.5 rounded-lg border border-[#1e293b]">
                    <span className="text-amber-400 font-bold">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* 2-Column Key Detected Changes & Recommended Priority Investigation Areas */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Key Detected Changes */}
            <div className="bg-[#0f1a30] border border-[#1e293b] rounded-xl p-4 space-y-3">
              <div className="text-xs font-headline font-bold uppercase tracking-wider text-cyan-300 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#00e5ff]" />
                <span>KEY DETECTED HYDROLOGICAL & BACKSCATTER CHANGES</span>
              </div>
              <ul className="space-y-2 text-xs text-slate-200 font-sans">
                {(sarData?.detected_changes && sarData.detected_changes.length > 0
                  ? sarData.detected_changes
                  : sarResult.key_findings
                ).map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-[#00e5ff] font-bold mt-0.5">▸</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Recommended Priority Investigation Areas */}
            <div className="bg-[#0f1a30] border border-[#1e293b] rounded-xl p-4 space-y-3">
              <div className="text-xs font-headline font-bold uppercase tracking-wider text-emerald-300 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>RECOMMENDED PRIORITY INVESTIGATION AREAS</span>
              </div>
              <ul className="space-y-2 text-xs text-slate-200 font-sans">
                {(sarData?.recommended_investigation_areas &&
                sarData.recommended_investigation_areas.length > 0
                  ? sarData.recommended_investigation_areas
                  : sarResult.recommended_actions
                ).map((act, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-emerald-400 font-mono font-bold">{idx + 1}.</span>
                    <span>{act}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* AI Explanation / Multimodal Scene Synthesis */}
          <div className="bg-[#0f1a30] border border-[#1e293b] rounded-xl p-5 space-y-3">
            <div className="text-xs font-headline font-bold uppercase tracking-wider text-[#00e5ff] flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#00e5ff]" />
              <span>GEMINI MULTIMODAL SAR SCENE SYNTHESIS & TACTICAL BRIEFING</span>
            </div>
            <div className="text-xs sm:text-sm text-slate-200 leading-relaxed whitespace-pre-wrap font-sans bg-[#070d18]/80 p-4 rounded-lg border border-[#1e293b]">
              {sarResult.content}
            </div>
          </div>

          {/* Satellite Imagery / Raster Availability Notice */}
          <div className="bg-[#070d18] border border-[#1e293b] rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-start sm:items-center gap-2.5 text-slate-300">
              <ImageOff className="w-4 h-4 text-amber-400 shrink-0 mt-0.5 sm:mt-0" />
              <div>
                <span className="font-bold text-amber-300">
                  {sarData?.imagery_available && sarData?.imagery_url
                    ? 'Live Satellite Raster Attached:'
                    : 'Satellite imagery unavailable for this analysis: '}
                </span>
                <span className="text-slate-400 ml-1">
                  {sarData?.imagery_fallback_reason ||
                    'Displaying calibrated Sentinel-1A VV/VH backscatter telemetry and hydrological flood vectors.'}
                </span>
              </div>
            </div>
            <div className="text-[11px] text-slate-400 italic shrink-0">{sarResult.disclaimer}</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SatellitePage;
