import React from 'react';
import { 
  Plus, 
  Minus, 
  Maximize2, 
  Crosshair, 
  Compass, 
  Layers, 
  Play, 
  Pause, 
  RotateCcw,
  MapPin,
  Satellite
} from 'lucide-react';
import { useCycloneStore } from '../../store/cycloneStore';

interface MapControlsProps {
  onZoomIn: () => void;
  onZoomOut: () => void;
  onFitCyclonePath: () => void;
  onLocateCyclone: () => void;
  onShowLandfall: () => void;
}

export const MapControls: React.FC<MapControlsProps> = ({
  onZoomIn,
  onZoomOut,
  onFitCyclonePath,
  onLocateCyclone,
  onShowLandfall
}) => {
  const { 
    isPlaying, 
    setIsPlaying, 
    setTimelineStep, 
    mapViewMode, 
    setMapViewMode 
  } = useCycloneStore();

  return (
    <div className="absolute top-20 right-4 z-[400] flex flex-col gap-2">
      {/* Zoom and Fit Group */}
      <div className="flex flex-col bg-command-surface/95 backdrop-blur-md border border-command-border rounded-lg shadow-xl overflow-hidden">
        <button
          onClick={onZoomIn}
          title="Zoom In"
          className="p-2.5 hover:bg-slate-800 text-slate-200 hover:text-cyan-400 transition border-b border-command-border"
        >
          <Plus className="w-4 h-4" />
        </button>
        <button
          onClick={onZoomOut}
          title="Zoom Out"
          className="p-2.5 hover:bg-slate-800 text-slate-200 hover:text-cyan-400 transition border-b border-command-border"
        >
          <Minus className="w-4 h-4" />
        </button>
        <button
          onClick={onFitCyclonePath}
          title="Fit Cyclone Path"
          className="p-2.5 hover:bg-slate-800 text-slate-200 hover:text-cyan-400 transition border-b border-command-border"
        >
          <Maximize2 className="w-4 h-4" />
        </button>
        <button
          onClick={onLocateCyclone}
          title="Locate Current Cyclone Position"
          className="p-2.5 hover:bg-slate-800 text-cyan-400 hover:text-white transition border-b border-command-border"
        >
          <Crosshair className="w-4 h-4" />
        </button>
        <button
          onClick={onShowLandfall}
          title="Show Predicted Landfall Area"
          className="p-2.5 hover:bg-slate-800 text-rose-400 hover:text-white transition"
        >
          <MapPin className="w-4 h-4" />
        </button>
      </div>

      {/* Map View Toggle (Dark Tactical vs Satellite) */}
      <div className="bg-command-surface/95 backdrop-blur-md border border-command-border rounded-lg shadow-xl overflow-hidden">
        <button
          onClick={() => setMapViewMode(mapViewMode === 'dark' ? 'satellite' : 'dark')}
          title={mapViewMode === 'dark' ? "Switch to Satellite Imagery" : "Switch to Dark Tactical Map"}
          className="p-2.5 hover:bg-slate-800 text-slate-200 hover:text-cyan-400 transition w-full flex items-center justify-center"
        >
          <Satellite className={`w-4 h-4 ${mapViewMode === 'satellite' ? 'text-cyan-400' : ''}`} />
        </button>
      </div>

      {/* Quick Play/Pause Control on Map */}
      <div className="bg-command-surface/95 backdrop-blur-md border border-command-border rounded-lg shadow-xl overflow-hidden flex flex-col">
        <button
          onClick={() => setIsPlaying(!isPlaying)}
          title={isPlaying ? "Pause Track Animation" : "Play Cyclone Pathway Animation"}
          className="p-2.5 hover:bg-slate-800 text-cyan-400 hover:text-white transition border-b border-command-border"
        >
          {isPlaying ? <Pause className="w-4 h-4 fill-cyan-400" /> : <Play className="w-4 h-4 fill-cyan-400" />}
        </button>
        <button
          onClick={() => {
            setIsPlaying(false);
            setTimelineStep(0);
          }}
          title="Reset Animation to Beginning"
          className="p-2.5 hover:bg-slate-800 text-slate-300 hover:text-white transition"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
