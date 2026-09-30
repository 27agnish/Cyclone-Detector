import React, { useState } from 'react';
import { 
  Settings as SettingsIcon, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw, 
  Server, 
  Map, 
  ShieldCheck, 
  Sparkles,
  Database,
  Cpu,
  Clock,
  Play,
  Terminal,
  Activity
} from 'lucide-react';
import { useCycloneStore } from '../store/cycloneStore';
import { env } from '../config/env';
import { apiClient } from '../services/api';

interface DiagnosticResult {
  endpoint: string;
  method: string;
  status: 'PENDING' | 'PASS' | 'FAIL';
  latencyMs?: number;
  message?: string;
}

export const SettingsPage: React.FC = () => {
  const { 
    healthStatus, 
    fetchInitialData, 
    refreshAllData,
    isLoading 
  } = useCycloneStore();

  const [testingDiagnostics, setTestingDiagnostics] = useState(false);
  const [diagnosticResults, setDiagnosticResults] = useState<DiagnosticResult[]>([
    { endpoint: '/health', method: 'GET', status: 'PENDING' },
    { endpoint: '/cyclones/active', method: 'GET', status: 'PENDING' },
    { endpoint: '/cyclones/cyclone_dana', method: 'GET', status: 'PENDING' },
    { endpoint: '/cyclones/cyclone_dana/track', method: 'GET', status: 'PENDING' },
    { endpoint: '/cyclones/cyclone_dana/landfall', method: 'GET', status: 'PENDING' },
    { endpoint: '/risk/cyclone_dana', method: 'GET', status: 'PENDING' },
    { endpoint: '/infrastructure', method: 'GET', status: 'PENDING' },
    { endpoint: '/population', method: 'GET', status: 'PENDING' },
    { endpoint: '/ai/explain-risk', method: 'POST', status: 'PENDING' },
  ]);

  const runDiagnostics = async () => {
    setTestingDiagnostics(true);
    const updated = [...diagnosticResults];

    for (let i = 0; i < updated.length; i++) {
      const item = updated[i];
      const start = performance.now();
      try {
        if (item.method === 'GET') {
          await apiClient.get(item.endpoint);
        } else {
          await apiClient.post(item.endpoint, { cyclone_id: 'cyclone_dana' });
        }
        item.latencyMs = Math.round(performance.now() - start);
        item.status = 'PASS';
        item.message = `HTTP 200 OK (${item.latencyMs}ms)`;
      } catch (err: any) {
        item.latencyMs = Math.round(performance.now() - start);
        item.status = 'FAIL';
        item.message = err?.response?.status ? `HTTP ${err.response.status}` : 'Connection Refused';
      }
      setDiagnosticResults([...updated]);
    }
    setTestingDiagnostics(false);
  };

  return (
    <div className="flex-1 p-4 lg:p-6 space-y-6 overflow-y-auto w-full max-w-6xl mx-auto bg-[#070d18] text-[#dee2f1] select-none font-telemetry">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#1e293b] pb-4">
        <div>
          <h2 className="text-xl lg:text-2xl font-headline font-bold text-white flex items-center gap-2.5">
            <SettingsIcon className="w-6 h-6 text-[#00e5ff]" />
            <span>SYSTEM ARCHITECTURE & LIVE FASTAPI DIAGNOSTICS</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Real-time verification of same-port client-backend connectivity, GIS hazard engine, and AI model orchestration.
          </p>
        </div>

        <button
          onClick={runDiagnostics}
          disabled={testingDiagnostics}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-cyan-400 to-[#00e5ff] text-[#070d18] font-headline text-xs font-bold shadow-[0_0_16px_rgba(0,229,255,0.4)] transition hover:opacity-95 disabled:opacity-50"
        >
          <Play className={`w-4 h-4 ${testingDiagnostics ? 'animate-spin' : ''}`} />
          <span>{testingDiagnostics ? 'AUDITING ENDPOINTS...' : 'RUN FULL DIAGNOSTIC SUITE'}</span>
        </button>
      </div>

      {/* Host Architecture & Core Specs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-[#0d1527] border border-[#1e293b] rounded-xl p-4 shadow-xl">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-slate-400 uppercase">FastAPI Backend</span>
            <span className="w-2 h-2 rounded-full bg-emerald-400 pulse-beacon" />
          </div>
          <div className="font-headline text-lg font-bold text-white mt-1">Unified Same-Port</div>
          <div className="text-cyan-300 text-xs mt-0.5">Port 8000 / Proxy 5173</div>
        </div>

        <div className="bg-[#0d1527] border border-[#1e293b] rounded-xl p-4 shadow-xl">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-slate-400 uppercase">Operating Mode</span>
            <span className="w-2 h-2 rounded-full bg-cyan-400" />
          </div>
          <div className="font-headline text-lg font-bold text-amber-300 mt-1">
            {env.DEMO_MODE ? 'DEMO SIMULATION' : 'LIVE PRODUCTION'}
          </div>
          <div className="text-slate-400 text-xs mt-0.5">Realistic Synoptic Seeds</div>
        </div>

        <div className="bg-[#0d1527] border border-[#1e293b] rounded-xl p-4 shadow-xl">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-slate-400 uppercase">AI Reasoning Core</span>
            <span className="w-2 h-2 rounded-full bg-[#00e5ff]" />
          </div>
          <div className="font-headline text-lg font-bold text-white mt-1">Google Gemini Pro</div>
          <div className="text-emerald-400 text-xs mt-0.5">+ Deterministic Fallback</div>
        </div>

        <div className="bg-[#0d1527] border border-[#1e293b] rounded-xl p-4 shadow-xl">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-slate-400 uppercase">Geospatial Engine</span>
            <span className="w-2 h-2 rounded-full bg-purple-400" />
          </div>
          <div className="font-headline text-lg font-bold text-white mt-1">Turf.js + Shapely</div>
          <div className="text-slate-400 text-xs mt-0.5">Dynamic SLOSH & Buffers</div>
        </div>
      </div>

      {/* Live Endpoint Diagnostic Matrix */}
      <div className="bg-[#0d1527] border border-[#1e293b] rounded-xl p-5 shadow-xl space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[#1e293b]">
          <div className="flex items-center gap-2">
            <Terminal className="w-5 h-5 text-[#00e5ff]" />
            <span className="font-headline text-sm font-bold text-white">
              END-TO-END REST API DIAGNOSTIC AUDIT
            </span>
          </div>
          <span className="text-xs text-slate-400">9 API Contracts Monitored</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#0f1a30] text-slate-400 border-b border-[#1e293b]">
              <tr>
                <th className="p-3">Endpoint Route</th>
                <th className="p-3">Method</th>
                <th className="p-3">Health Status</th>
                <th className="p-3">Roundtrip Latency</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1e293b]">
              {diagnosticResults.map((r, i) => (
                <tr key={i} className="hover:bg-[#0f1a30]/50 transition-colors">
                  <td className="p-3 font-mono text-cyan-300">{r.endpoint}</td>
                  <td className="p-3">
                    <span className="px-1.5 py-0.5 rounded bg-[#13223f] text-slate-200 text-[10px] font-bold">
                      {r.method}
                    </span>
                  </td>
                  <td className="p-3">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      r.status === 'PASS' ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/50' :
                      r.status === 'FAIL' ? 'bg-rose-950 text-rose-300 border border-rose-500 alert-beacon' :
                      'bg-slate-800 text-slate-400'
                    }`}>
                      {r.status === 'PASS' ? 'ONLINE (200 OK)' : r.status === 'FAIL' ? 'OFFLINE / ERROR' : 'PENDING'}
                    </span>
                  </td>
                  <td className="p-3 text-slate-300 font-mono">
                    {r.latencyMs !== undefined ? `${r.latencyMs} ms` : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Developer Area: Fallback Demo Simulation */}
      <div className="bg-[#0f172a]/80 border border-[#1e293b] rounded-xl p-5 space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <Terminal className="w-5 h-5 text-cyan-400" />
            <h3 className="font-headline font-bold text-sm text-white">DEVELOPER & SIMULATION TOOLS</h3>
          </div>
          <span className="text-[10px] font-mono text-cyan-300 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-800">
            SHOW_FALLBACK_DEMOS
          </span>
        </div>

        <p className="text-xs text-slate-400">
          Control the visibility of simulated API fallback states (Skeleton Loader, Zero-Activity Basin, and FastAPI 503 Timeout) on the Active Cyclones monitoring page.
        </p>

        <div className="flex items-center justify-between p-3 rounded-lg bg-[#070d18] border border-[#1e293b]">
          <div>
            <div className="text-xs font-bold text-white">Show Demo States on Active Cyclones Page</div>
            <div className="text-[11px] text-slate-400">Default is off to ensure a clean, production-ready operational view.</div>
          </div>
          <button
            onClick={() => {
              const current = localStorage.getItem('SHOW_FALLBACK_DEMOS') === 'true';
              localStorage.setItem('SHOW_FALLBACK_DEMOS', (!current).toString());
              window.location.reload();
            }}
            className={`px-3 py-1 rounded text-xs font-bold transition-all ${
              typeof window !== 'undefined' && localStorage.getItem('SHOW_FALLBACK_DEMOS') === 'true'
                ? 'bg-cyan-500 text-slate-950 shadow-[0_0_12px_rgba(0,229,255,0.4)]'
                : 'bg-slate-800 text-slate-300 hover:text-white border border-slate-700'
            }`}
          >
            {typeof window !== 'undefined' && localStorage.getItem('SHOW_FALLBACK_DEMOS') === 'true' ? 'ENABLED' : 'DISABLED'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
