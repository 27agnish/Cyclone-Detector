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
  Play
} from 'lucide-react';
import { useCycloneStore } from '../store/cycloneStore';
import { env } from '../config/env';
import { apiClient } from '../services/api';
import { cycloneApi } from '../services/cycloneApi';

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
        item.status = 'PASS';
        item.latencyMs = Math.round(performance.now() - start);
        item.message = '200 OK';
      } catch (err: any) {
        item.status = 'FAIL';
        item.latencyMs = Math.round(performance.now() - start);
        item.message = err.message || 'Connection Error';
      }
      setDiagnosticResults([...updated]);
    }
    setTestingDiagnostics(false);
  };

  return (
    <div className="flex-1 p-6 space-y-6 overflow-y-auto max-w-5xl mx-auto w-full font-mono">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-command-border pb-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2.5">
            <SettingsIcon className="w-5 h-5 text-cyan-400" />
            <span>SYSTEM SETTINGS & DIAGNOSTICS</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1 font-sans">
            Operational configuration, cloud service credentials status, and live end-to-end API health auditing.
          </p>
        </div>

        <button
          onClick={() => fetchInitialData()}
          disabled={isLoading}
          className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs transition"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-cyan-400' : ''}`} />
          <span>RE-PROBE BACKEND</span>
        </button>
      </div>

      {/* Backend & Environment Specifications */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
        <div className="bg-command-card border border-command-border rounded-xl p-5 shadow-xl space-y-3">
          <div className="flex items-center gap-2 text-white font-bold border-b border-command-border pb-2">
            <Server className="w-4 h-4 text-cyan-400" />
            <span>BACKEND SERVICE STATUS</span>
          </div>

          <div className="space-y-2 text-slate-300">
            <div className="flex justify-between">
              <span className="text-slate-400">Backend API URL:</span>
              <span className="text-cyan-300 font-bold">{env.API_V1_BASE_URL}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Health State:</span>
              <span className="text-emerald-400 font-bold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                {healthStatus?.status?.toUpperCase() || 'ONLINE (OK)'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Database Engine:</span>
              <span className="text-slate-200">{healthStatus?.services?.database || 'SQLite / SQLAlchemy'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Operational Mode:</span>
              <span className="text-amber-300 bg-amber-950/80 px-2 py-0.5 rounded border border-amber-800 font-bold">
                {env.DEMO_MODE ? 'DEMO MODE (ACTIVE)' : 'LIVE IMD FEED'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Telemetry Refresh Interval:</span>
              <span className="text-slate-200">{healthStatus?.refresh_interval_minutes || 15} Minutes</span>
            </div>
          </div>
        </div>

        <div className="bg-command-card border border-command-border rounded-xl p-5 shadow-xl space-y-3">
          <div className="flex items-center gap-2 text-white font-bold border-b border-command-border pb-2">
            <Map className="w-4 h-4 text-cyan-400" />
            <span>GIS & CLOUD INTEGRATION STATUS</span>
          </div>

          <div className="space-y-2 text-slate-300">
            <div className="flex justify-between">
              <span className="text-slate-400">Tactical Mapping Engine:</span>
              <span className="text-emerald-400 font-bold">
                Leaflet & OpenStreetMap (Active)
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Google Gemini / Vertex AI:</span>
              <span className={healthStatus?.services?.gemini === 'configured' ? 'text-emerald-400 font-bold' : 'text-cyan-300 font-bold'}>
                {healthStatus?.services?.gemini === 'configured' ? 'Configured' : 'Deterministic Expert Fallback Active'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Google Earth Engine:</span>
              <span className="text-slate-200">{healthStatus?.services?.earth_engine || 'SAR Radar Change Pipeline'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">CORS Origin:</span>
              <span className="text-emerald-400 font-bold">Explicit Local & Vercel Origins</span>
            </div>
          </div>
        </div>
      </div>

      {/* Live End-to-End Diagnostic Test Suite */}
      <div className="bg-command-card border border-command-border rounded-xl p-5 shadow-xl space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-command-border pb-3">
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Cpu className="w-4 h-4 text-cyan-400" />
              <span>LIVE END-TO-END CONNECTIVITY TEST SUITE</span>
            </h3>
            <p className="text-xs text-slate-400 font-sans mt-0.5">
              Execute live HTTP round-trips from frontend to backend to verify all 9 core API routes.
            </p>
          </div>

          <button
            onClick={runDiagnostics}
            disabled={testingDiagnostics}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs shadow transition"
          >
            <Play className={`w-3.5 h-3.5 fill-white ${testingDiagnostics ? 'animate-spin' : ''}`} />
            <span>{testingDiagnostics ? 'RUNNING TESTS...' : 'RUN ALL TESTS'}</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900 text-slate-400 border-b border-command-border">
              <tr>
                <th className="p-2.5">METHOD</th>
                <th className="p-2.5">ENDPOINT</th>
                <th className="p-2.5">STATUS</th>
                <th className="p-2.5">LATENCY</th>
                <th className="p-2.5">MESSAGE</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {diagnosticResults.map((r, i) => (
                <tr key={i} className="hover:bg-slate-800/40">
                  <td className="p-2.5 font-bold text-cyan-400">{r.method}</td>
                  <td className="p-2.5 text-slate-200 font-semibold">{r.endpoint}</td>
                  <td className="p-2.5">
                    {r.status === 'PASS' && (
                      <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 font-bold text-[10px]">
                        PASS
                      </span>
                    )}
                    {r.status === 'FAIL' && (
                      <span className="px-2 py-0.5 rounded bg-red-950 text-red-300 border border-red-800 font-bold text-[10px]">
                        FAIL
                      </span>
                    )}
                    {r.status === 'PENDING' && (
                      <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-400 text-[10px]">
                        READY
                      </span>
                    )}
                  </td>
                  <td className="p-2.5 text-slate-300">
                    {r.latencyMs ? `${r.latencyMs} ms` : '—'}
                  </td>
                  <td className="p-2.5 text-slate-400 text-[11px]">
                    {r.message || 'Ready to execute'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
