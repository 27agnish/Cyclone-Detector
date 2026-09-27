import React from 'react';
import { CycloneMap } from '../components/Map/CycloneMap';
import { CycloneTimeline } from '../components/Timeline/CycloneTimeline';
import { RiskSummaryPanel } from '../components/Dashboard/RiskSummaryPanel';
import { useCycloneStore } from '../store/cycloneStore';
import { AlertCircle } from 'lucide-react';

export const Dashboard: React.FC = () => {
  const { cycloneDetail, isLoading, error } = useCycloneStore();

  if (isLoading && !cycloneDetail) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 space-y-4 text-center">
        <div className="w-12 h-12 rounded-full border-4 border-cyan-500/20 border-t-cyan-400 animate-spin" />
        <div className="font-mono text-sm text-cyan-300">
          Probing Cyclone Feeds & Initializing Geospatial Intelligence...
        </div>
      </div>
    );
  }

  if (error && !cycloneDetail) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-3">
        <AlertCircle className="w-12 h-12 text-rose-500" />
        <div className="text-base font-mono font-bold text-white">Connection Error</div>
        <p className="text-xs text-slate-400 max-w-md">{error}</p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col p-3 gap-3 overflow-hidden">
      {/* Upper Area: Map (Left/Center) + Risk Summary Panel (Right) */}
      <div className="flex-1 flex flex-col lg:flex-row gap-3 min-h-0 overflow-hidden">
        {/* Interactive GIS Map Canvas */}
        <div className="flex-1 h-full min-h-[460px] relative">
          <CycloneMap />
        </div>

        {/* Tactical Risk Summary & Asset Inspector Panel */}
        <RiskSummaryPanel />
      </div>

      {/* Bottom Area: Cyclone Timeline & Animation Controller */}
      <div className="shrink-0">
        <CycloneTimeline />
      </div>
    </div>
  );
};
