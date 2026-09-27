import React from 'react';
import { 
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar 
} from 'recharts';
import { Layers, Activity, Wind, Waves, Compass, ShieldAlert } from 'lucide-react';
import { useCycloneStore } from '../store/cycloneStore';

export const Analysis: React.FC = () => {
  const { cycloneDetail } = useCycloneStore();

  // Synthetic Holland vortex radial wind profile data
  const windProfileData = [
    { distanceKm: 0, windKmh: 45, surgeM: 1.2 },
    { distanceKm: 10, windKmh: 110, surgeM: 2.1 },
    { distanceKm: 20, windKmh: 130, surgeM: 2.8 },
    { distanceKm: 30, windKmh: 125, surgeM: 2.6 },
    { distanceKm: 45, windKmh: 105, surgeM: 2.0 },
    { distanceKm: 60, windKmh: 88, surgeM: 1.5 },
    { distanceKm: 80, windKmh: 72, surgeM: 1.1 },
    { distanceKm: 100, windKmh: 60, surgeM: 0.8 },
    { distanceKm: 125, windKmh: 48, surgeM: 0.5 },
    { distanceKm: 150, windKmh: 38, surgeM: 0.3 },
  ];

  // Hazard factor weights
  const hazardFactorWeights = [
    { factor: 'Peak Wind Hazard', weight: 28, score: 85 },
    { factor: 'Track Proximity', weight: 20, score: 90 },
    { factor: 'Landfall Proximity', weight: 18, score: 95 },
    { factor: 'Storm Surge & Elevation', weight: 14, score: 78 },
    { factor: 'Asset Criticality', weight: 12, score: 88 },
    { factor: 'Rainfall & Flooding', weight: 8, score: 72 },
  ];

  return (
    <div className="flex-1 p-6 space-y-6 overflow-y-auto max-w-7xl mx-auto w-full">
      {/* Header */}
      <div className="border-b border-command-border pb-4">
        <h2 className="text-xl font-mono font-bold text-white flex items-center gap-2.5">
          <Layers className="w-5 h-5 text-cyan-400" />
          <span>GIS SPATIAL HAZARD & RISK ENGINE</span>
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Deterministic parametric vortex modeling, bathymetric coastal surge calculations, and multi-criteria vulnerability analysis.
        </p>
      </div>

      {/* Grid of Hazard Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Wind Vortex Profile */}
        <div className="bg-command-card border border-command-border rounded-xl p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm font-mono font-bold text-white">
              <Wind className="w-4 h-4 text-cyan-400" />
              <span>RADIAL WIND SPEED & SURGE DECAY</span>
            </div>
            <span className="text-[11px] font-mono text-slate-400">Holland / Rankine Profile</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={windProfileData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="distanceKm" unit="km" stroke="#64748b" textAnchor="end" />
                <YAxis stroke="#64748b" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px' }}
                  labelStyle={{ color: '#f8fafc', fontWeight: 'bold' }}
                />
                <Line type="monotone" dataKey="windKmh" name="Wind Speed (km/h)" stroke="#38bdf8" strokeWidth={2.5} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="surgeM" name="Surge Amplitude (m)" stroke="#f43f5e" strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="text-[11px] text-slate-400">
            Peak destructive sustained winds occur within the 15-30 km eyewall swath, with surge attenuation inland.
          </div>
        </div>

        {/* Hazard Criteria Breakdown */}
        <div className="bg-command-card border border-command-border rounded-xl p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm font-mono font-bold text-white">
              <Activity className="w-4 h-4 text-amber-400" />
              <span>MULTI-CRITERIA RISK WEIGHT DISTRIBUTION</span>
            </div>
            <span className="text-[11px] font-mono text-slate-400">Model Weights</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={hazardFactorWeights} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis type="number" stroke="#64748b" domain={[0, 35]} unit="%" />
                <YAxis type="category" dataKey="factor" stroke="#64748b" width={140} textAnchor="end" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px' }}
                />
                <Bar dataKey="weight" name="Model Weight (%)" fill="#06b6d4" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="text-[11px] text-slate-400">
            Calculated deterministic risk scores integrate wind shear, storm surge, elevation, and lifeline criticality.
          </div>
        </div>
      </div>

      {/* Methodology Explainer Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-command-card border border-command-border rounded-xl p-4 space-y-2">
          <div className="text-xs font-mono font-bold text-cyan-400 uppercase">
            1. Forecast Uncertainty Cone
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Constructed via dynamic Minkowski circle envelopes where radial error expands linearly with forecast lead time:
            <span className="font-mono text-white block my-1 bg-slate-900 p-1.5 rounded">
              R(t) = 35.0 km + 2.8 × t (hours)
            </span>
            Yields ~100 km uncertainty radius at T+24h, widening to ~170 km at T+48h.
          </p>
        </div>

        <div className="bg-command-card border border-command-border rounded-xl p-4 space-y-2">
          <div className="text-xs font-mono font-bold text-rose-400 uppercase">
            2. Landfall Impact Buffer Rings
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Coastline intersection coordinates are surrounded by tri-tier impact polygons:
            <span className="font-mono text-white block my-1 bg-slate-900 p-1.5 rounded">
              Critical (0-35km) | High (35-80km) | Mod (80-150km)
            </span>
            Directly mapping eyewall passage and severe saline surge ingress zones.
          </p>
        </div>

        <div className="bg-command-card border border-command-border rounded-xl p-4 space-y-2">
          <div className="text-xs font-mono font-bold text-amber-400 uppercase">
            3. India-Wide Scalability
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            The spatial engine is coordinate-agnostic, seamlessly evaluating any coastal state across India including Odisha, West Bengal, Andhra Pradesh, Tamil Nadu, Kerala, Maharashtra, and Gujarat.
          </p>
        </div>
      </div>
    </div>
  );
};
