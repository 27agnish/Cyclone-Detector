import React, { useState } from 'react';
import { 
  Satellite, 
  Layers, 
  Droplets, 
  AlertTriangle, 
  Sparkles, 
  Compass, 
  ShieldCheck, 
  RefreshCw,
  Radar,
  Radio,
  Eye
} from 'lucide-react';
import { useCycloneStore } from '../store/cycloneStore';
import { aiApi } from '../services/aiApi';

export const SatellitePage: React.FC = () => {
  const { selectedCycloneId, openAiModal, setIsAiLoading } = useCycloneStore();
  const [analyzing, setAnalyzing] = useState(false);

  const handleMultimodalAiAnalysis = async () => {
    setIsAiLoading(true);
    setAnalyzing(true);
    try {
      const res = await aiApi.analyzeSatellite(selectedCycloneId);
      openAiModal(res);
    } catch (e) {
      console.error(e);
    } finally {
      setIsAiLoading(false);
      setAnalyzing(false);
    }
  };

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
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-cyan-400 to-[#00e5ff] text-[#070d18] font-headline text-xs font-bold shadow-[0_0_16px_rgba(0,229,255,0.4)] transition hover:opacity-95 disabled:opacity-50"
        >
          <Sparkles className="w-4 h-4" />
          <span>{analyzing ? 'INFERRING MULTIMODAL SAR...' : 'RUN GEMINI SAR ANALYSIS'}</span>
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
            </div>

            {/* Corner telemetry coordinates */}
            <div className="absolute bottom-3 left-3 text-[10px] text-cyan-300 bg-[#070d18]/90 px-2 py-1 rounded border border-[#1e293b]">
              LAT: 21.32°N • LON: 87.15°E • PASS: ASCENDING 128
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
                  Produces multi-paragraph commander situational briefs linking radar backscatter to ground ground-truth damage.
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={handleMultimodalAiAnalysis}
            className="w-full py-2.5 rounded-lg bg-gradient-to-r from-cyan-400 to-[#00e5ff] text-[#070d18] font-headline text-xs font-bold shadow-[0_0_16px_rgba(0,229,255,0.3)] transition hover:opacity-95"
          >
            EXECUTE GEMINI SAR RECONNAISSANCE
          </button>
        </div>
      </div>
    </div>
  );
};

export default SatellitePage;
