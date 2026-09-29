import React, { useEffect, useState } from 'react';
import { 
  AlertOctagon, 
  CheckCircle2, 
  Clock, 
  MapPin, 
  Sparkles, 
  AlertTriangle, 
  RefreshCw,
  Radio,
  ShieldAlert,
  ArrowRight
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

  const priorities = priorityData?.priorities || [];

  return (
    <div className="flex-1 p-4 lg:p-6 space-y-6 overflow-y-auto w-full bg-[#070d18] text-[#dee2f1] select-none font-telemetry">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#1e293b] pb-4">
        <div>
          <h2 className="text-xl lg:text-2xl font-headline font-bold text-white flex items-center gap-2.5">
            <AlertOctagon className="w-6 h-6 text-rose-500 alert-beacon" />
            <span>AI EMERGENCY TRIAGE & INCIDENT ACTION MATRIX</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Automated operational ranking of vulnerable lifeline infrastructure and population sectors by lead time and severity.
          </p>
        </div>

        <button
          onClick={loadPriorities}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-red-600 to-rose-600 hover:opacity-95 text-white font-headline text-xs font-bold shadow-[0_0_16px_rgba(255,51,102,0.4)] transition disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          <span>RE-COMPUTE TRIAGE (FASTAPI)</span>
        </button>
      </div>

      {/* Triage Status Banner */}
      <div className="bg-[#0d1527] border border-rose-500/40 rounded-xl p-4 shadow-xl flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-rose-600/30 border border-rose-500 flex items-center justify-center shrink-0">
            <Radio className="w-5 h-5 text-rose-400 animate-pulse" />
          </div>
          <div>
            <div className="font-headline text-sm font-bold text-white">
              SOP Level 4 Mandatory Evacuation Staging Active
            </div>
            <div className="text-xs text-slate-300">
              National Highway NH-16 resupply convoy staging at Jajpur Sector Buffer.
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs">
          <span className="text-slate-400">Total Prioritized Directives:</span>
          <span className="px-3 py-1 rounded-full bg-rose-950 text-rose-300 border border-rose-500 font-bold">
            {priorities.length} DIRECTIVES
          </span>
        </div>
      </div>

      {/* Priority Action List */}
      <div className="space-y-4">
        {loading ? (
          <div className="space-y-3">
            <div className="h-24 bg-[#0d1527] rounded-xl animate-pulse" />
            <div className="h-24 bg-[#0d1527] rounded-xl animate-pulse" />
            <div className="h-24 bg-[#0d1527] rounded-xl animate-pulse" />
          </div>
        ) : priorities.length > 0 ? (
          priorities.map((item, idx) => {
            const isImmediate = item.urgency === 'IMMEDIATE' || item.urgency === 'URGENT' || item.risk_level === 'CRITICAL';

            return (
              <div
                key={idx}
                className={`bg-[#0d1527] border rounded-xl p-5 shadow-xl transition space-y-3 ${
                  isImmediate ? 'border-rose-500/50 shadow-[0_0_16px_rgba(255,51,102,0.15)]' : 'border-[#1e293b]'
                }`}
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <span className="w-7 h-7 rounded-lg bg-[#0f1a30] border border-[#1e293b] flex items-center justify-center font-headline text-xs font-bold text-white">
                      #{item.rank || idx + 1}
                    </span>
                    <h3 className="font-headline text-base font-bold text-white">{item.priority_action}</h3>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                      isImmediate 
                        ? 'bg-rose-950 text-rose-300 border border-rose-500 alert-beacon' 
                        : 'bg-amber-950 text-amber-300 border border-amber-500'
                    }`}>
                      {item.urgency || item.risk_level}
                    </span>

                    <span className="text-[10px] px-2 py-0.5 rounded bg-[#13223f] text-cyan-300 border border-cyan-400/40 uppercase">
                      LEVEL: {item.risk_level}
                    </span>
                  </div>
                </div>

                <p className="text-xs text-slate-200 font-sans leading-relaxed">{item.rationale}</p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2 border-t border-[#1e293b] text-xs text-slate-400">
                  <div>Target Asset: <strong className="text-white font-mono">{item.name}</strong></div>
                  <div>Type: <strong className="text-cyan-300 font-mono uppercase">{item.type}</strong></div>
                  <div>District: <strong className="text-emerald-400 font-mono">{item.district}</strong></div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="p-8 text-center text-slate-400 bg-[#0d1527] rounded-xl border border-[#1e293b]">
            No urgent emergency priorities found for current cyclone scenario.
          </div>
        )}
      </div>
    </div>
  );
};

export default Emergency;
