import React, { useEffect, useState } from 'react';
import { 
  Satellite, 
  Layers, 
  Droplets, 
  AlertTriangle, 
  Sparkles, 
  Compass, 
  ShieldCheck,
  RefreshCw
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
    <div className="flex-1 p-6 space-y-6 overflow-y-auto max-w-7xl mx-auto w-full">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-command-border pb-4">
        <div>
          <h2 className="text-xl font-mono font-bold text-white flex items-center gap-2.5">
            <Satellite className="w-5 h-5 text-cyan-400" />
            <span>SATELLITE REMOTE SENSING & SAR FLOOD ARCHITECTURE</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Cloud-penetrating Synthetic Aperture Radar (Sentinel-1 SAR) and multispectral optical imaging pipeline.
          </p>
        </div>

        <button
          onClick={handleMultimodalAiAnalysis}
          disabled={analyzing}
          className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-mono text-xs font-semibold shadow-md transition"
        >
          <Sparkles className="w-4 h-4" />
          <span>RUN GEMINI MULTIMODAL SAR ANALYSIS</span>
        </button>
      </div>

      {/* Sensor Specs Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
        <div className="bg-command-card border border-command-border rounded-lg p-3">
          <span className="text-slate-400">ACTIVE SENSOR</span>
          <div className="text-sm font-bold text-white mt-1">Copernicus Sentinel-1A SAR</div>
          <div className="text-[10px] text-cyan-400">C-band 5.405 GHz (VV+VH)</div>
        </div>

        <div className="bg-command-card border border-command-border rounded-lg p-3">
          <span className="text-slate-400">CLOUD PENETRATION</span>
          <div className="text-sm font-bold text-emerald-400 mt-1">100% All-Weather Penetration</div>
          <div className="text-[10px] text-slate-400">Operates through cyclone clouds</div>
        </div>

        <div className="bg-command-card border border-command-border rounded-lg p-3">
          <span className="text-slate-400">GROUND RESOLUTION</span>
          <div className="text-sm font-bold text-white mt-1">10.0m Spatial Grid</div>
          <div className="text-[10px] text-slate-400">Interferometric Wide Swath</div>
        </div>

        <div className="bg-command-card border border-command-border rounded-lg p-3">
          <span className="text-slate-400">INUNDATION DETECTED</span>
          <div className="text-sm font-bold text-rose-400 mt-1">342.8 sq km (+18.4%)</div>
          <div className="text-[10px] text-rose-300">Active coastal inundation</div>
        </div>
      </div>

      {/* Radar Flood Map Preview Simulation */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Synthetic Radar Backscatter Frame */}
        <div className="bg-command-card border border-command-border rounded-xl p-5 shadow-xl space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm font-mono font-bold text-white">
              <Layers className="w-4 h-4 text-cyan-400" />
              <span>SAR BACKSCATTER INTENSITY (VV POLARIZATION)</span>
            </div>
            <span className="text-[10px] font-mono bg-cyan-950 text-cyan-300 px-2 py-0.5 rounded border border-cyan-800">
              GEE PIPELINE READY
            </span>
          </div>

          <div className="relative aspect-video rounded-lg overflow-hidden border border-slate-700 bg-slate-950 flex items-center justify-center">
            {/* Visual radar texture simulation */}
            <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:16px_16px] opacity-70"></div>
            <div className="absolute inset-0 bg-gradient-to-tr from-cyan-950/40 via-slate-900/60 to-rose-950/40"></div>
            
            {/* Coastline & Swath contour simulation */}
            <div className="relative z-10 text-center p-6 space-y-2">
              <div className="w-12 h-12 rounded-full border border-cyan-400 flex items-center justify-center text-cyan-400 mx-auto animate-pulse">
                <Satellite className="w-6 h-6" />
              </div>
              <div className="font-mono text-xs font-bold text-white">
                SENTINEL-1A SAR CALIBRATED BACKSCATTER
              </div>
              <p className="text-[11px] text-slate-300 max-w-sm mx-auto font-sans">
                Dark specular backscatter pixels (&lt; -18 dB) indicate open surface water flood inundation over Dhamra-Bhitarkanika delta.
              </p>
            </div>
          </div>

          <div className="text-[11px] text-slate-400 font-mono">
            Pipeline: Earth Engine ImageCollection('COPERNICUS/S1_GRD') &gt; Speckle Filter (Lee 7x7) &gt; Otsu Inundation Thresholding.
          </div>
        </div>

        {/* Embankment Breach Detection Report */}
        <div className="bg-command-card border border-command-border rounded-xl p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm font-mono font-bold text-white">
              <Droplets className="w-4 h-4 text-cyan-400" />
              <span>COASTAL EMBANKMENT & WATER INGRESS MONITORING</span>
            </div>
            <span className="text-[10px] font-mono text-rose-400 font-bold">2 CRITICAL BREACHES</span>
          </div>

          <div className="space-y-3">
            <div className="bg-slate-900 border border-red-900/60 p-3 rounded-lg space-y-1">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="font-bold text-red-400">1. Dhamra Estuary North Embankment</span>
                <span className="bg-red-950 text-red-300 px-1.5 py-0.2 rounded text-[10px]">CRITICAL</span>
              </div>
              <div className="text-xs text-slate-300">Coordinates: 20.842°N, 86.915°E</div>
              <p className="text-[11px] text-slate-400">
                SAR change detection reveals 420m embankment breach with active saltwater ingress extending 1.8km inland into agricultural polders.
              </p>
            </div>

            <div className="bg-slate-900 border border-orange-900/60 p-3 rounded-lg space-y-1">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="font-bold text-orange-400">2. Bhitarkanika Creek Saline Ingress</span>
                <span className="bg-orange-950 text-orange-300 px-1.5 py-0.2 rounded text-[10px]">HIGH RISK</span>
              </div>
              <div className="text-xs text-slate-300">Coordinates: 20.612°N, 86.832°E</div>
              <p className="text-[11px] text-slate-400">
                Tidal backflow through mangrove creek systems causing water logging along Rajnagar evacuation access artery.
              </p>
            </div>
          </div>

          <button
            onClick={handleMultimodalAiAnalysis}
            className="w-full py-2 rounded bg-cyan-600 hover:bg-cyan-500 text-white font-mono text-xs font-semibold transition flex items-center justify-center gap-1.5 shadow"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Generate Full SAR Radar Briefing</span>
          </button>
        </div>
      </div>
    </div>
  );
};
