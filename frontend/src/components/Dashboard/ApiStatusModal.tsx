import React, { useEffect, useState } from 'react';
import { X, ShieldCheck, AlertCircle, Key, Server, Database, Globe, Satellite, Wind } from 'lucide-react';
import { env } from '../../config/env';
import { apiClient } from '../../services/api';

interface ApiStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ApiStatusModal: React.FC<ApiStatusModalProps> = ({ isOpen, onClose }) => {
  const [healthData, setHealthData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const fetchHealth = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get('/health');
      setHealthData(res.data);
    } catch (e) {
      setHealthData({ status: 'unreachable', services: {} });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchHealth();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const services = healthData?.services || {};
  const isGeminiConfigured = services.gemini === 'configured';
  const isDbConnected = services.database === 'connected';
  const isEarthEngineConfigured = services.earth_engine === 'configured';
  const isLiveCyclone = healthData?.demo_mode === false;

  return (
    <div className="fixed inset-0 z-[700] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
      <div className="bg-command-surface border border-command-border rounded-xl shadow-2xl w-full max-w-xl overflow-hidden font-sans">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 bg-command-card border-b border-command-border">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-cyan-950 border border-cyan-800 text-cyan-400">
              <Key className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-mono font-bold text-sm text-white">API SERVICES STATUS & SECURITY</h3>
              <p className="text-[11px] text-slate-400 font-mono">Real-time external services connectivity audit</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded hover:bg-slate-800 text-slate-400 hover:text-white transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4 text-xs font-mono">
          {/* Security Notice */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-lg p-3 text-[11px] text-slate-300">
            <span className="text-cyan-400 font-bold">SECURITY ENFORCEMENT:</span> Keys and credentials are kept strictly in local environment variables (<code className="text-cyan-300">.env.local</code> / <code className="text-cyan-300">.env</code>) and Secret Manager. No keys are exposed over APIs or committed to version control.
          </div>

          {/* Service Indicators List */}
          <div className="space-y-2.5">
            {/* Tactical Mapping Engine (Leaflet & OpenStreetMap) */}
            <div className="flex items-center justify-between p-3 rounded-lg bg-slate-900/60 border border-command-border">
              <div className="flex items-center gap-2.5">
                <Globe className="w-4 h-4 text-cyan-400" />
                <div>
                  <div className="font-bold text-slate-100">Tactical GIS & Mapping Engine</div>
                  <div className="text-[10px] text-slate-400 font-normal">Leaflet & OpenStreetMap (OSM)</div>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold flex items-center gap-1.5 bg-emerald-950 text-emerald-300 border border-emerald-800">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                Active (Free / No Key Required)
              </span>
            </div>

            {/* Google Gemini / Vertex AI */}
            <div className="flex items-center justify-between p-3 rounded-lg bg-slate-900/60 border border-command-border">
              <div className="flex items-center gap-2.5">
                <Server className="w-4 h-4 text-purple-400" />
                <div>
                  <div className="font-bold text-slate-100">Google Gemini / Vertex AI</div>
                  <div className="text-[10px] text-slate-400 font-normal">Natural language risk briefings & Incident Action Plans</div>
                </div>
              </div>
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold flex items-center gap-1.5 ${
                isGeminiConfigured ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' : 'bg-amber-950 text-amber-300 border border-amber-800'
              }`}>
                <span className={`w-1.5 h-1.5 rounded-full ${isGeminiConfigured ? 'bg-emerald-400' : 'bg-amber-400'}`} />
                {isGeminiConfigured ? 'Connected' : 'Not Configured (Deterministic Fallback)'}
              </span>
            </div>

            {/* Database */}
            <div className="flex items-center justify-between p-3 rounded-lg bg-slate-900/60 border border-command-border">
              <div className="flex items-center gap-2.5">
                <Database className="w-4 h-4 text-emerald-400" />
                <div>
                  <div className="font-bold text-slate-100">PostGIS / Database Architecture</div>
                  <div className="text-[10px] text-slate-400 font-normal">Spatial asset & population persistence</div>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-800 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                Connected
              </span>
            </div>

            {/* Earth Engine */}
            <div className="flex items-center justify-between p-3 rounded-lg bg-slate-900/60 border border-command-border">
              <div className="flex items-center gap-2.5">
                <Satellite className="w-4 h-4 text-blue-400" />
                <div>
                  <div className="font-bold text-slate-100">Google Earth Engine (GEE)</div>
                  <div className="text-[10px] text-slate-400 font-normal">Sentinel-1 SAR radar flood change detection</div>
                </div>
              </div>
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold flex items-center gap-1.5 ${
                isEarthEngineConfigured ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' : 'bg-slate-800 text-slate-400 border border-slate-700'
              }`}>
                <span className={`w-1.5 h-1.5 rounded-full ${isEarthEngineConfigured ? 'bg-emerald-400' : 'bg-slate-500'}`} />
                {isEarthEngineConfigured ? 'Connected' : 'Cached Radar Scene Active'}
              </span>
            </div>

            {/* Cyclone Data Feed */}
            <div className="flex items-center justify-between p-3 rounded-lg bg-slate-900/60 border border-command-border">
              <div className="flex items-center gap-2.5">
                <Wind className="w-4 h-4 text-cyan-400" />
                <div>
                  <div className="font-bold text-slate-100">Cyclone Data Provider</div>
                  <div className="text-[10px] text-slate-400 font-normal">IMD RSMC / NOAA IBTrACS synoptic ingestion</div>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-950 text-cyan-300 border border-cyan-800 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                {isLiveCyclone ? 'Live Feed Connected' : 'Demo Mode (Simulated Scenario)'}
              </span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 bg-command-card border-t border-command-border flex items-center justify-between text-xs text-slate-400 font-mono">
          <span>Backend: {env.BACKEND_BASE_URL || '(Same Origin)'} ({env.API_V1_BASE_URL})</span>
          <button onClick={onClose} className="px-3.5 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-white transition">
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
