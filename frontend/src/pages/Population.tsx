import React from 'react';
import { 
  Users, 
  Home, 
  ShieldAlert, 
  AlertTriangle, 
  CheckCircle2, 
  TrendingUp,
  Building2,
  MapPin
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, PieChart, Pie, Cell 
} from 'recharts';
import { useCycloneStore } from '../store/cycloneStore';

export const Population: React.FC = () => {
  const { populationExposure } = useCycloneStore();

  const districts = populationExposure?.districts || [];

  const chartData = districts.map((d) => ({
    name: d.district,
    Critical: Math.round(d.critical_exposure / 1000),
    High: Math.round(d.high_exposure / 1000),
    Moderate: Math.round(d.moderate_exposure / 1000),
  }));

  const pieData = [
    { name: 'Critical (0–35km)', value: populationExposure?.critical || 485000, color: '#ff3366' },
    { name: 'High Risk (35–80km)', value: populationExposure?.high || 1430000, color: '#f59e0b' },
    { name: 'Moderate (80–160km)', value: populationExposure?.moderate || 1805000, color: '#00e5ff' },
  ];

  return (
    <div className="flex-1 p-4 lg:p-6 space-y-6 overflow-y-auto w-full bg-[#070d18] text-[#dee2f1] select-none font-telemetry">
      {/* Header */}
      <div className="border-b border-[#1e293b] pb-4">
        <h2 className="text-xl lg:text-2xl font-headline font-bold text-white flex items-center gap-2.5">
          <Users className="w-6 h-6 text-[#00e5ff]" />
          <span>DEMOGRAPHIC & POPULATION EXPOSURE MODELING</span>
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          High-resolution spatial overlay of census population density against cyclone wind swaths and surge corridors.
        </p>
      </div>

      {/* Exposure Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-[#0d1527] border border-rose-500/40 rounded-xl p-4 shadow-xl">
          <span className="text-[10px] text-rose-400 uppercase font-bold tracking-wider">CRITICAL IMPACT ZONE</span>
          <div className="font-headline text-2xl font-extrabold text-rose-400 mt-1">
            {populationExposure ? populationExposure.critical.toLocaleString() : '485,000'}
          </div>
          <p className="text-[11px] text-slate-400 mt-1 font-sans">Immediate evacuation priority (0–35km)</p>
        </div>

        <div className="bg-[#0d1527] border border-amber-500/40 rounded-xl p-4 shadow-xl">
          <span className="text-[10px] text-amber-400 uppercase font-bold tracking-wider">HIGH RISK ZONE</span>
          <div className="font-headline text-2xl font-extrabold text-amber-400 mt-1">
            {populationExposure ? `${(populationExposure.high / 1000000).toFixed(2)}M` : '1.43M'}
          </div>
          <p className="text-[11px] text-slate-400 mt-1 font-sans">Secondary evacuation buffer (35–80km)</p>
        </div>

        <div className="bg-[#0d1527] border border-cyan-500/40 rounded-xl p-4 shadow-xl">
          <span className="text-[10px] text-[#00e5ff] uppercase font-bold tracking-wider">MODERATE IMPACT</span>
          <div className="font-headline text-2xl font-extrabold text-[#00e5ff] mt-1">
            {populationExposure ? `${(populationExposure.moderate / 1000000).toFixed(2)}M` : '1.81M'}
          </div>
          <p className="text-[11px] text-slate-400 mt-1 font-sans">Advisory and shelter monitoring (80–160km)</p>
        </div>

        <div className="bg-[#0d1527] border border-[#1e293b] rounded-xl p-4 shadow-xl">
          <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">TOTAL EXPOSED POPULATION</span>
          <div className="font-headline text-2xl font-extrabold text-white mt-1">
            {populationExposure ? `${(populationExposure.total / 1000000).toFixed(2)}M` : '3.72M'}
          </div>
          <p className="text-[11px] text-emerald-400 mt-1 font-sans">Across 14 coastal districts</p>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* District Exposure Bar Chart (8 Cols) */}
        <div className="lg:col-span-8 bg-[#0d1527] border border-[#1e293b] rounded-xl p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-headline text-sm font-bold text-white uppercase tracking-wider">
              DISTRICT-LEVEL POPULATION EXPOSURE (THOUSANDS)
            </h3>
            <span className="text-xs text-slate-400">Census Granular Aggregation</span>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData.length > 0 ? chartData : [
                { name: 'Balasore', Critical: 280, High: 350, Moderate: 210 },
                { name: 'Bhadrak', Critical: 140, High: 420, Moderate: 310 },
                { name: 'Kendrapara', Critical: 65, High: 380, Moderate: 440 },
                { name: 'Purba Medinipur', Critical: 120, High: 280, Moderate: 390 }
              ]}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="name" stroke="#64748b" />
                <YAxis stroke="#64748b" unit="k" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f1a30', borderColor: '#1e293b', borderRadius: '8px' }}
                  labelStyle={{ color: '#f8fafc', fontWeight: 'bold' }}
                />
                <Legend />
                <Bar dataKey="Critical" fill="#ff3366" radius={[4, 4, 0, 0]} />
                <Bar dataKey="High" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Moderate" fill="#00e5ff" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Threat Distribution Pie (4 Cols) */}
        <div className="lg:col-span-4 bg-[#0d1527] border border-[#1e293b] rounded-xl p-5 shadow-xl space-y-4 flex flex-col justify-between">
          <div>
            <h3 className="font-headline text-sm font-bold text-white uppercase tracking-wider">
              EXPOSURE SHARE BY ZONE
            </h3>
            <div className="h-56 w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f1a30', borderColor: '#1e293b', borderRadius: '8px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="space-y-2 text-xs pt-2 border-t border-[#1e293b]">
            {pieData.map((item) => (
              <div key={item.name} className="flex justify-between items-center">
                <span className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-slate-300">{item.name}</span>
                </span>
                <strong className="text-white font-mono">{((item.value / (populationExposure?.total || 3720000)) * 100).toFixed(1)}%</strong>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Population;
