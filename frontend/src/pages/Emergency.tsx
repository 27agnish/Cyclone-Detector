import React, { useEffect, useState } from 'react';
import { 
  AlertOctagon, 
  CheckCircle2, 
  Clock, 
  MapPin, 
  Sparkles, 
  AlertTriangle, 
  Send, 
  RefreshCw 
} from 'lucide-react';
import { useCycloneStore } from '../store/cycloneStore';
import { aiApi } from '../services/aiApi';
import { EmergencyPriorityItem, EmergencyPriorityResponse } from '../types/cyclone';

export const Emergency: React.FC = () => {
  const { selectedCycloneId, cycloneDetail } = useCycloneStore();
  const [priorityData, setPriorityData] = useState<EmergencyPriorityResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const loadPriorities = async () => {
    setLoading(true);
    try {
      const res = await aiApi.generateEmergencyPlan(selectedCycloneId);
      setPriorityData(res);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPriorities();
  }, [selectedCycloneId]);

  return (
    <div className="flex-1 p-6 space-y-6 overflow-y-auto max-w-7xl mx-auto w-full">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-command-border pb-4">
        <div>
          <h2 className="text-xl font-mono font-bold text-white flex items-center gap-2.5">
            <AlertOctagon className="w-5 h-5 text-red-500" />
            <span>AI EMERGENCY PRIORITY ACTION ENGINE</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Automated operational ranking of vulnerable lifeline infrastructure and population sectors by lead time and severity.
          </p>
        </div>

        <button
          onClick={loadPriorities}
          disabled={loading}
          className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-mono transition"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-cyan-400' : ''}`} />
          <span>RE-COMPUTE PRIORITIES</span>
        </button>
      </div>

      {/* Official Disclaimer Banner */}
      <div className="bg-amber-950/40 border border-amber-800/80 rounded-lg p-3.5 flex items-start gap-3 text-xs text-amber-200">
        <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
        <div>
          <strong className="font-mono font-bold">AI-GENERATED PROTOTYPE PRIORITY ANALYSIS:</strong>
          <span className="ml-1 text-slate-300">
            These priorities are algorithmically ranked decision-support suggestions for incident command teams. Do not present or interpret as binding official emergency evacuation or civil defense orders.
          </span>
        </div>
      </div>

      {/* Priorities List */}
      {loading ? (
        <div className="py-16 flex flex-col items-center justify-center space-y-3">
          <div className="w-10 h-10 rounded-full border-4 border-cyan-500/20 border-t-cyan-400 animate-spin" />
          <div className="font-mono text-xs text-cyan-300">Ranking lifelines against predicted landfall corridor...</div>
        </div>
      ) : (
        <div className="space-y-3">
          {priorityData?.priorities.map((item) => (
            <div
              key={item.rank}
              className="bg-command-card border border-command-border hover:border-slate-700 rounded-xl p-4 shadow-xl transition space-y-3"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center font-mono font-extrabold text-cyan-400 text-sm shadow">
                    {item.rank < 10 ? `0${item.rank}` : item.rank}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white font-mono flex items-center gap-2">
                      <span>{item.name}</span>
                      <span className="text-[10px] text-slate-400 font-normal">({item.type})</span>
                    </h4>
                    <div className="text-[11px] text-slate-400 flex items-center gap-1.5 mt-0.5">
                      <MapPin className="w-3 h-3 text-cyan-400" />
                      <span>{item.district}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                    item.risk_level === 'CRITICAL' ? 'bg-red-950 text-red-300 border border-red-800' :
                    'bg-orange-950 text-orange-300 border border-orange-800'
                  }`}>
                    {item.risk_level}
                  </span>

                  <span className="text-[10px] font-mono bg-slate-900 border border-slate-800 text-cyan-300 px-2 py-0.5 rounded flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span>{item.urgency}</span>
                  </span>
                </div>
              </div>

              {/* Priority Action Directive */}
              <div className="bg-slate-900/90 border border-slate-800 p-3 rounded-lg text-xs space-y-1">
                <div className="text-cyan-400 font-mono font-bold text-[11px] uppercase tracking-wider flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Immediate Tactical Action:</span>
                </div>
                <p className="text-slate-200 leading-relaxed font-sans">{item.priority_action}</p>
                <div className="text-[11px] text-slate-400 pt-1 border-t border-slate-800/80">
                  <strong className="text-slate-300">Technical Rationale:</strong> {item.rationale}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
