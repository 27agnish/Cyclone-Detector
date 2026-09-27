import React from 'react';
import { 
  Users, 
  Home, 
  ShieldAlert, 
  AlertTriangle, 
  CheckCircle2, 
  TrendingUp 
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
    { name: 'Critical (0-35km)', value: populationExposure?.critical || 485000, color: '#dc2626' },
    { name: 'High Risk (35-80km)', value: populationExposure?.high || 1430000, color: '#f97316' },
    { name: 'Moderate (80-150km)', value: populationExposure?.moderate || 1805000, color: '#eab308' },
  ];

  return (
    <div className="flex-1 p-6 space-y-6 overflow-y-auto max-w-7xl mx-auto w-full">
      {/* Header */}
      <div className="border-b border-command-border pb-4">
        <h2 className="text-xl font-mono font-bold text-white flex items-center gap-2.5">
          <Users className="w-5 h-5 text-cyan-400" />
          <span>DEMOGRAPHIC & POPULATION EXPOSURE MODELING</span>
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          High-resolution spatial overlay of census population density against cyclone wind swaths and surge corridors.
        </p>
      </div>

      {/* Exposure Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 font-mono">
        <div className="bg-command-card border border-red-900/60 rounded-xl p-4 shadow-xl">
          <span className="text-[10px] text-red-400 uppercase font-bold tracking-wider">CRITICAL IMPACT ZONE</span>
          <div className="text-2xl font-extrabold text-red-400 mt-1">
            {populationExposure ? populationExposure.critical.toLocaleString() : '485,000'}
          </div>
          <p className="text-[11px] text-slate-400 mt-1 font-sans">Immediate evacuation priority (0-35km)</p>
        </div>

        <div className="bg-command-card border border-orange-900/60 rounded-xl p-4 shadow-xl">
          <span className="text-[10px] text-orange-400 uppercase font-bold tracking-wider">HIGH RISK ZONE</span>
          <div className="text-2xl font-extrabold text-orange-400 mt-1">
            {populationExposure ? `${(populationExposure.high / 1000000).toFixed(2)}M` : '1.43M'}
          </div>
          <p className="text-[11px] text-slate-400 mt-1 font-sans">Gale wind exposure swath (35-80km)</p>
        </div>

        <div className="bg-command-card border border-yellow-900/60 rounded-xl p-4 shadow-xl">
          <span className="text-[10px] text-yellow-400 uppercase font-bold tracking-wider">MODERATE RISK ZONE</span>
          <div className="text-2xl font-extrabold text-yellow-400 mt-1">
            {populationExposure ? `${(populationExposure.moderate / 1000000).toFixed(2)}M` : '1.80M'}
          </div>
          <p className="text-[11px] text-slate-400 mt-1 font-sans">Squall & rainfall perimeter (80-150km)</p>
        </div>

        <div className="bg-command-card border border-cyan-900/60 rounded-xl p-4 shadow-xl">
          <span className="text-[10px] text-cyan-400 uppercase font-bold tracking-wider">TOTAL MONITORED EXPOSURE</span>
          <div className="text-2xl font-extrabold text-cyan-300 mt-1">
            {populationExposure ? `${(populationExposure.total / 1000000).toFixed(2)}M` : '3.72M'}
          </div>
          <p className="text-[11px] text-slate-400 mt-1 font-sans">Aggregated 4 coastal districts</p>
        </div>
      </div>

      {/* Visual Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* District Breakdown Bar Chart */}
        <div className="lg:col-span-2 bg-command-card border border-command-border rounded-xl p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-mono font-bold text-white uppercase tracking-wider">
              District-Level Population Exposure (Thousands)
            </h3>
            <span className="text-[11px] font-mono text-slate-400">By Hazard Tier</span>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="name" stroke="#64748b" />
                <YAxis stroke="#64748b" unit="k" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px' }}
                />
                <Legend />
                <Bar dataKey="Critical" fill="#dc2626" />
                <Bar dataKey="High" fill="#f97316" />
                <Bar dataKey="Moderate" fill="#eab308" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Impact Distribution Donut */}
        <div className="bg-command-card border border-command-border rounded-xl p-5 shadow-xl space-y-4 flex flex-col justify-between">
          <h3 className="text-sm font-mono font-bold text-white uppercase tracking-wider">
            Total Exposure Breakdown
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
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px' }}
                  formatter={(val: any) => [`${(val / 1000).toFixed(0)}k citizens`, 'Exposure']}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-1.5 text-xs font-mono">
            {pieData.map((d, i) => (
              <div key={i} className="flex items-center justify-between text-slate-300">
                <span className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: d.color }}></span>
                  <span>{d.name}</span>
                </span>
                <span className="font-bold text-white">{d.value.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* District Vulnerability & Shelter Capacity Table */}
      <div className="bg-command-card border border-command-border rounded-xl shadow-xl overflow-hidden">
        <div className="p-4 border-b border-command-border flex items-center justify-between">
          <h3 className="text-sm font-mono font-bold text-white uppercase tracking-wider">
            District Evacuation Centers & Coastal Vulnerability Index
          </h3>
          <span className="text-[11px] font-mono text-slate-400">OSDMA Disaster Shelters Network</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-slate-900 text-slate-400 border-b border-command-border">
              <tr>
                <th className="p-3">DISTRICT</th>
                <th className="p-3">TOTAL POPULATION</th>
                <th className="p-3">CRITICAL EXPOSURE</th>
                <th className="p-3">ACTIVE SHELTERS</th>
                <th className="p-3">COASTAL VULNERABILITY INDEX</th>
                <th className="p-3">STATUS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {districts.map((d) => (
                <tr key={d.district} className="hover:bg-slate-800/40">
                  <td className="p-3 font-bold text-white">{d.district}</td>
                  <td className="p-3 text-slate-300">{d.total_population.toLocaleString()}</td>
                  <td className="p-3 text-red-400 font-bold">{d.critical_exposure.toLocaleString()}</td>
                  <td className="p-3 text-emerald-400 font-semibold">{d.evacuation_centers_active} Shelters</td>
                  <td className="p-3 text-cyan-400">{d.coastal_vulnerability_index} / 1.0</td>
                  <td className="p-3">
                    <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 text-[10px]">
                      Shelters Activated
                    </span>
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
