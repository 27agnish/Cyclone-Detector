import React from 'react';
import { Wind, Compass, Gauge, AlertTriangle, ShieldCheck, Play, ArrowRight, RefreshCw } from 'lucide-react';
import { useCycloneStore } from '../store/cycloneStore';

export const Cyclones: React.FC = () => {
  const { 
    activeCyclones, 
    selectedCycloneId, 
    selectCyclone, 
    cycloneDetail, 
    refreshAllData, 
    isLoading,
    setActiveTab 
  } = useCycloneStore();

  const handleSelectAndInspect = async (id: string) => {
    await selectCyclone(id);
    setActiveTab('dashboard');
  };

  return (
    <div className="flex-1 p-6 space-y-6 overflow-y-auto max-w-7xl mx-auto w-full">
      {/* Page Header */}
      <div className="flex items-center justify-between border-b border-command-border pb-4">
        <div>
          <h2 className="text-xl font-mono font-bold text-white flex items-center gap-2.5">
            <Wind className="w-5 h-5 text-cyan-400" />
            <span>AUTOMATIC CYCLONE DETECTION & REGISTRY</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Real-time multi-provider synoptic monitoring across the North Indian Ocean basin (Bay of Bengal & Arabian Sea).
          </p>
        </div>

        <button
          onClick={refreshAllData}
          disabled={isLoading}
          className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-mono transition"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-cyan-400' : ''}`} />
          <span>RE-SCAN BASIN</span>
        </button>
      </div>

      {/* Active Cyclones Grid */}
      <div className="space-y-3">
        <div className="text-xs font-mono font-semibold uppercase tracking-wider text-slate-300">
          Detected Active Systems ({activeCyclones.length})
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {activeCyclones.map((c) => {
            const isSelected = c.id === selectedCycloneId;
            return (
              <div
                key={c.id}
                className={`bg-command-card border rounded-xl p-5 shadow-xl transition space-y-4 ${
                  isSelected ? 'border-cyan-500 ring-1 ring-cyan-500/50' : 'border-command-border hover:border-slate-700'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-bold text-white font-mono">{c.name}</h3>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950 border border-cyan-800 text-cyan-300">
                        {c.data_status}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">{c.basin}</p>
                  </div>

                  <span className="text-xs font-mono font-semibold text-yellow-400 bg-yellow-950/60 border border-yellow-800/80 px-2 py-0.5 rounded">
                    {c.category}
                  </span>
                </div>

                {/* Telemetry Metrics */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono bg-slate-900/80 p-3 rounded-lg border border-slate-800">
                  <div>
                    <div className="text-slate-400 text-[10px]">WIND SPEED</div>
                    <div className="text-white font-bold text-sm">{c.wind_speed} km/h</div>
                  </div>
                  <div>
                    <div className="text-slate-400 text-[10px]">PRESSURE</div>
                    <div className="text-sky-300 font-bold text-sm">{c.central_pressure} hPa</div>
                  </div>
                  <div>
                    <div className="text-slate-400 text-[10px]">CURRENT COORDS</div>
                    <div className="text-slate-200 text-xs">{c.current_latitude}°N, {c.current_longitude}°E</div>
                  </div>
                  <div>
                    <div className="text-slate-400 text-[10px]">MOVEMENT</div>
                    <div className="text-cyan-300 font-bold text-sm">{c.movement_direction} @ {c.movement_speed}km/h</div>
                  </div>
                </div>

                {/* Projected Landfall */}
                {c.estimated_landfall_location && (
                  <div className="text-xs text-rose-300 bg-rose-950/40 border border-rose-900/60 p-2.5 rounded-lg flex items-center justify-between">
                    <div>
                      <span className="font-bold">Projected Landfall:</span> {c.estimated_landfall_location}
                    </div>
                    <span className="font-mono text-[11px] text-slate-300">{c.estimated_landfall_time}</span>
                  </div>
                )}

                {/* Actions */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                  <span className="text-[11px] text-slate-500 font-mono">
                    Source: {c.source}
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={async () => {
                        await selectCyclone(c.id);
                        setActiveTab('cyclone-details');
                      }}
                      className="px-2.5 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-cyan-400 border border-slate-700 font-mono text-xs transition"
                    >
                      DOSSIER & CHARTS
                    </button>
                    <button
                      onClick={() => handleSelectAndInspect(c.id)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-cyan-600 hover:bg-cyan-500 text-white font-mono text-xs font-semibold shadow transition"
                    >
                      <span>LOAD TO MAP</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Selected Cyclone Full Track Point Log */}
      {cycloneDetail && (
        <div className="bg-command-card border border-command-border rounded-xl p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-mono font-bold text-white uppercase tracking-wider">
              Synoptic Track Sequence: {cycloneDetail.name}
            </h3>
            <span className="text-xs font-mono text-slate-400">
              {cycloneDetail.observed_track.length} Observed Points | {cycloneDetail.forecast_track.length} Forecast Projections
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-slate-900 text-slate-400 border-b border-command-border">
                <tr>
                  <th className="p-2.5">STATUS</th>
                  <th className="p-2.5">TIMESTAMP</th>
                  <th className="p-2.5">COORDINATES</th>
                  <th className="p-2.5">WIND SPEED</th>
                  <th className="p-2.5">PRESSURE</th>
                  <th className="p-2.5">CATEGORY</th>
                  <th className="p-2.5">MOVEMENT</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {cycloneDetail.observed_track.map((pt) => (
                  <tr key={pt.id} className="hover:bg-slate-800/40">
                    <td className="p-2.5 text-cyan-400 font-bold">OBSERVED</td>
                    <td className="p-2.5 text-slate-200">{pt.timestamp}</td>
                    <td className="p-2.5 text-slate-300">{pt.latitude}°N, {pt.longitude}°E</td>
                    <td className="p-2.5 text-amber-400">{pt.wind_speed} km/h</td>
                    <td className="p-2.5 text-sky-300">{pt.pressure} hPa</td>
                    <td className="p-2.5 text-slate-200">{pt.category}</td>
                    <td className="p-2.5 text-slate-400">{pt.movement_direction} @ {pt.movement_speed} km/h</td>
                  </tr>
                ))}
                {cycloneDetail.forecast_track.map((pt) => (
                  <tr key={pt.id} className="hover:bg-slate-800/40 bg-rose-950/10">
                    <td className="p-2.5 text-rose-400 font-bold">FORECAST</td>
                    <td className="p-2.5 text-slate-200">{pt.timestamp}</td>
                    <td className="p-2.5 text-slate-300">{pt.latitude}°N, {pt.longitude}°E</td>
                    <td className="p-2.5 text-amber-400 font-bold">{pt.wind_speed} km/h</td>
                    <td className="p-2.5 text-sky-300">{pt.pressure} hPa</td>
                    <td className="p-2.5 text-yellow-300">{pt.category}</td>
                    <td className="p-2.5 text-slate-400">{pt.movement_direction} @ {pt.movement_speed} km/h</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
