import React, { useState } from 'react';
import { Layers, ChevronDown, ChevronUp, AlertTriangle, ShieldAlert, Hospital, Zap, Landmark, Waves, Radio, Home } from 'lucide-react';
import { useCycloneStore } from '../../store/cycloneStore';

export const MapLegend: React.FC = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { layers, toggleLayer } = useCycloneStore();

  return (
    <div className="absolute top-20 left-4 z-[400] w-72 bg-command-surface/95 backdrop-blur-md border border-command-border rounded-lg shadow-2xl text-xs overflow-hidden">
      {/* Header */}
      <div 
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="flex items-center justify-between px-3 py-2.5 bg-command-card cursor-pointer border-b border-command-border hover:bg-slate-800 transition"
      >
        <div className="flex items-center gap-2 font-mono font-semibold text-slate-200">
          <Layers className="w-4 h-4 text-cyan-400" />
          <span>TACTICAL MAP LAYERS</span>
        </div>
        <button className="text-slate-400 hover:text-white">
          {isCollapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
        </button>
      </div>

      {!isCollapsed && (
        <div className="p-3 space-y-3.5 max-h-[460px] overflow-y-auto">
          {/* Cyclone Pathway Layers */}
          <div>
            <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400 mb-1.5">
              Cyclone Pathway
            </div>
            <div className="space-y-1.5">
              <label className="flex items-center justify-between cursor-pointer hover:text-white">
                <span className="flex items-center gap-2">
                  <span className="w-4 h-1 bg-cyan-400 rounded-sm"></span>
                  <span>Observed Pathway</span>
                </span>
                <input
                  type="checkbox"
                  checked={layers.observedPath}
                  onChange={() => toggleLayer('observedPath')}
                  className="rounded bg-slate-800 border-slate-700 text-cyan-500 focus:ring-0"
                />
              </label>

              <label className="flex items-center justify-between cursor-pointer hover:text-white">
                <span className="flex items-center gap-2">
                  <span className="w-4 h-1 border-b-2 border-dashed border-rose-500"></span>
                  <span>Forecast Pathway</span>
                </span>
                <input
                  type="checkbox"
                  checked={layers.forecastPath}
                  onChange={() => toggleLayer('forecastPath')}
                  className="rounded bg-slate-800 border-slate-700 text-rose-500 focus:ring-0"
                />
              </label>

              <label className="flex items-center justify-between cursor-pointer hover:text-white">
                <span className="flex items-center gap-2">
                  <span className="w-3.5 h-3.5 bg-cyan-500/20 border border-cyan-400 border-dashed rounded-sm"></span>
                  <span>Forecast Uncertainty Cone</span>
                </span>
                <input
                  type="checkbox"
                  checked={layers.forecastCone}
                  onChange={() => toggleLayer('forecastCone')}
                  className="rounded bg-slate-800 border-slate-700 text-cyan-500 focus:ring-0"
                />
              </label>

              <label className="flex items-center justify-between cursor-pointer hover:text-white">
                <span className="flex items-center gap-2">
                  <span className="w-3.5 h-3.5 rotate-45 bg-rose-600 border border-white"></span>
                  <span className="font-semibold text-rose-300">Predicted Landfall (◆)</span>
                </span>
                <input
                  type="checkbox"
                  checked={layers.landfallZone}
                  onChange={() => toggleLayer('landfallZone')}
                  className="rounded bg-slate-800 border-slate-700 text-rose-500 focus:ring-0"
                />
              </label>
            </div>
          </div>

          {/* Landfall Impact Zones */}
          <div>
            <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400 mb-1.5">
              Landfall Hazard Zones
            </div>
            <div className="space-y-1 text-[11px]">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-red-600/60 border border-red-500"></span>
                <span>Critical Zone (0 - 35 km)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-orange-500/50 border border-orange-400"></span>
                <span>High Risk Zone (35 - 80 km)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-yellow-500/40 border border-yellow-400"></span>
                <span>Moderate Swath (80 - 150 km)</span>
              </div>
            </div>
          </div>

          {/* Infrastructure Layer Toggles */}
          <div>
            <div className="flex items-center justify-between text-[10px] font-mono uppercase tracking-wider text-slate-400 mb-1.5">
              <span>Lifeline Infrastructure</span>
              <button 
                onClick={() => toggleLayer('infrastructure')}
                className="text-cyan-400 hover:underline"
              >
                {layers.infrastructure ? 'Hide All' : 'Show All'}
              </button>
            </div>
            <div className="grid grid-cols-2 gap-1.5">
              <label className="flex items-center gap-1.5 p-1 rounded bg-slate-800/60 cursor-pointer hover:bg-slate-800">
                <input
                  type="checkbox"
                  checked={layers.hospitals}
                  onChange={() => toggleLayer('hospitals')}
                  className="rounded text-red-500"
                />
                <Hospital className="w-3 h-3 text-red-400" />
                <span className="text-[11px]">Hospitals</span>
              </label>

              <label className="flex items-center gap-1.5 p-1 rounded bg-slate-800/60 cursor-pointer hover:bg-slate-800">
                <input
                  type="checkbox"
                  checked={layers.power}
                  onChange={() => toggleLayer('power')}
                  className="rounded text-amber-500"
                />
                <Zap className="w-3 h-3 text-amber-400" />
                <span className="text-[11px]">Power Grids</span>
              </label>

              <label className="flex items-center gap-1.5 p-1 rounded bg-slate-800/60 cursor-pointer hover:bg-slate-800">
                <input
                  type="checkbox"
                  checked={layers.bridges}
                  onChange={() => toggleLayer('bridges')}
                  className="rounded text-blue-500"
                />
                <Landmark className="w-3 h-3 text-blue-400" />
                <span className="text-[11px]">Bridges/Roads</span>
              </label>

              <label className="flex items-center gap-1.5 p-1 rounded bg-slate-800/60 cursor-pointer hover:bg-slate-800">
                <input
                  type="checkbox"
                  checked={layers.shelters}
                  onChange={() => toggleLayer('shelters')}
                  className="rounded text-emerald-500"
                />
                <Home className="w-3 h-3 text-emerald-400" />
                <span className="text-[11px]">Cyclone Shelters</span>
              </label>

              <label className="flex items-center gap-1.5 p-1 rounded bg-slate-800/60 cursor-pointer hover:bg-slate-800 col-span-2">
                <input
                  type="checkbox"
                  checked={layers.water}
                  onChange={() => toggleLayer('water')}
                  className="rounded text-cyan-500"
                />
                <Waves className="w-3 h-3 text-cyan-400" />
                <span className="text-[11px]">Water Facilities & Ports</span>
              </label>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
