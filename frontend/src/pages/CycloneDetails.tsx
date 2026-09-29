import React from 'react';
import { 
  Wind, 
  Compass, 
  Activity, 
  MapPin, 
  Clock, 
  AlertTriangle, 
  Sparkles, 
  Layers, 
  ArrowLeft,
  ChevronRight,
  Radar
} from 'lucide-react';
import { 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  AreaChart, 
  Area 
} from 'recharts';
import { useCycloneStore } from '../store/cycloneStore';
import { aiApi } from '../services/aiApi';

export const CycloneDetails: React.FC = () => {
  const { 
    cycloneDetail, 
    selectedCycloneId, 
    riskAssessment, 
    setActiveTab, 
    openAiModal, 
    setIsAiLoading 
  } = useCycloneStore();

  if (!cycloneDetail) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 space-y-3 font-telemetry text-center bg-[#070d18] text-[#dee2f1]">
        <div className="text-slate-400 text-sm">No cyclone details loaded.</div>
        <button
          onClick={() => setActiveTab('cyclones')}
          className="px-4 py-2 rounded-lg bg-gradient-to-r from-cyan-400 to-[#00e5ff] text-[#070d18] text-xs font-bold"
        >
          SELECT ACTIVE CYCLONE
        </button>
      </div>
    );
  }

  // Combined track points for timeline charts
  const combinedPoints = [
    ...(cycloneDetail.observed_track || []).map(p => ({
      time: p.timestamp.split(' ')[1] || p.timestamp,
      fullTime: p.timestamp,
      wind: p.wind_speed,
      pressure: p.pressure,
      type: 'Observed',
      lat: p.latitude,
      lon: p.longitude
    })),
    ...(cycloneDetail.forecast_track || []).map(p => ({
      time: p.timestamp.split(' ')[1] || p.timestamp,
      fullTime: p.timestamp,
      wind: p.wind_speed,
      pressure: p.pressure,
      type: 'Forecast',
      lat: p.latitude,
      lon: p.longitude
    }))
  ];

  const handleExplain = async () => {
    setIsAiLoading(true);
    try {
      const res = await aiApi.explainRisk(selectedCycloneId);
      openAiModal(res);
    } catch (e) {
      console.error(e);
    } finally {
      setIsAiLoading(false);
    }
  };

  return (
    <div className="flex-1 p-4 lg:p-6 space-y-6 overflow-y-auto w-full bg-[#070d18] text-[#dee2f1] select-none font-telemetry">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#1e293b] pb-4">
        <div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setActiveTab('cyclones')}
              className="p-1.5 rounded-lg bg-[#0f1a30] text-slate-400 hover:text-white border border-[#1e293b]"
              title="Back to fleet"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <h2 className="text-xl lg:text-2xl font-headline font-bold text-white flex items-center gap-2.5">
              <span>{cycloneDetail.name}</span>
              <span className="text-xs font-telemetry text-cyan-300 bg-cyan-950/80 border border-cyan-400 px-2.5 py-0.5 rounded-full font-bold">
                {cycloneDetail.category}
              </span>
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Comprehensive synoptic dossier, observed trajectory telemetry, intensity curves, and forecast uncertainty.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setActiveTab('dashboard')}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#0f1a30] hover:bg-[#13223f] text-slate-200 border border-[#1e293b] text-xs font-semibold transition"
          >
            <Layers className="w-4 h-4 text-[#00e5ff]" />
            <span>VIEW ON GIS MAP</span>
          </button>

          <button
            onClick={handleExplain}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-gradient-to-r from-cyan-400 to-[#00e5ff] text-[#070d18] font-headline text-xs font-bold shadow-[0_0_16px_rgba(0,229,255,0.4)] transition"
          >
            <Sparkles className="w-4 h-4" />
            <span>AI RISK BRIEFING</span>
          </button>
        </div>
      </div>

      {/* Primary Telemetry Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
        <div className="bg-[#0d1527] border border-[#1e293b] rounded-xl p-3">
          <span className="text-slate-400 text-[10px] uppercase">Current Position</span>
          <div className="text-white font-bold text-sm mt-1">{cycloneDetail.current_latitude}°N</div>
          <div className="text-cyan-300 text-[11px]">{cycloneDetail.current_longitude}°E</div>
        </div>

        <div className="bg-[#0d1527] border border-rose-500/40 rounded-xl p-3">
          <span className="text-rose-400 text-[10px] uppercase">Sustained Wind</span>
          <div className="text-white font-bold text-lg mt-1 font-headline">
            {cycloneDetail.wind_speed} <span className="text-xs font-normal text-slate-400">km/h</span>
          </div>
          <div className="text-rose-300 text-[10px] uppercase">Category {cycloneDetail.category.split(' ')[0]}</div>
        </div>

        <div className="bg-[#0d1527] border border-cyan-500/40 rounded-xl p-3">
          <span className="text-cyan-400 text-[10px] uppercase">Central Pressure</span>
          <div className="text-cyan-300 font-bold text-lg mt-1 font-headline">
            {cycloneDetail.central_pressure} <span className="text-xs font-normal text-slate-400">hPa</span>
          </div>
          <div className="text-slate-400 text-[10px]">Deep barometric drop</div>
        </div>

        <div className="bg-[#0d1527] border border-[#1e293b] rounded-xl p-3">
          <span className="text-slate-400 text-[10px] uppercase">Movement</span>
          <div className="text-[#00e5ff] font-bold text-sm mt-1">{cycloneDetail.movement_direction}</div>
          <div className="text-slate-300 text-[11px]">@ {cycloneDetail.movement_speed} km/h</div>
        </div>

        <div className="bg-[#0d1527] border border-rose-500/40 rounded-xl p-3 col-span-2">
          <span className="text-rose-400 text-[10px] uppercase font-bold">Predicted Landfall</span>
          <div className="text-white font-bold text-sm mt-1 truncate">
            {cycloneDetail.landfall ? cycloneDetail.landfall.location_name : 'Tracking over Bay of Bengal'}
          </div>
          <div className="text-rose-300 text-[11px]">
            {cycloneDetail.landfall ? `${cycloneDetail.landfall.estimated_time} (${cycloneDetail.landfall.district})` : 'Under observation'}
          </div>
        </div>
      </div>

      {/* Intensity Curves: Wind & Pressure Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Wind Speed Evolution */}
        <div className="bg-[#0d1527] border border-[#1e293b] rounded-xl p-5 shadow-xl space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm font-headline font-bold text-white">
              <Wind className="w-4 h-4 text-amber-400" />
              <span>WIND SPEED TRAJECTORY (KM/H)</span>
            </div>
            <span className="text-[10px] text-slate-400">Observed → Forecast</span>
          </div>

          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={combinedPoints}>
                <defs>
                  <linearGradient id="windGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="time" stroke="#64748b" textAnchor="end" />
                <YAxis stroke="#64748b" unit=" km/h" domain={[0, 240]} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f1a30', borderColor: '#1e293b', borderRadius: '8px' }}
                  labelStyle={{ color: '#f8fafc', fontWeight: 'bold' }}
                />
                <Area type="monotone" dataKey="wind" stroke="#f59e0b" strokeWidth={2.5} fillOpacity={1} fill="url(#windGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Central Pressure Evolution */}
        <div className="bg-[#0d1527] border border-[#1e293b] rounded-xl p-5 shadow-xl space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm font-headline font-bold text-white">
              <Activity className="w-4 h-4 text-cyan-400" />
              <span>CENTRAL MINIMUM PRESSURE (HPA)</span>
            </div>
            <span className="text-[10px] text-slate-400">Barometric Depression</span>
          </div>

          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={combinedPoints}>
                <defs>
                  <linearGradient id="pressGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00e5ff" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#00e5ff" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="time" stroke="#64748b" textAnchor="end" />
                <YAxis stroke="#64748b" unit=" hPa" domain={[920, 1010]} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f1a30', borderColor: '#1e293b', borderRadius: '8px' }}
                  labelStyle={{ color: '#f8fafc', fontWeight: 'bold' }}
                />
                <Area type="monotone" dataKey="pressure" stroke="#00e5ff" strokeWidth={2.5} fillOpacity={1} fill="url(#pressGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Trajectory Point Log Table */}
      <div className="bg-[#0d1527] border border-[#1e293b] rounded-xl p-5 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Radar className="w-5 h-5 text-[#00e5ff]" />
            <span className="font-headline text-sm font-bold text-white">
              SYNOPTIC TRACK POINT TELEMETRY LOGS ({combinedPoints.length} SAMPLES)
            </span>
          </div>
          <span className="text-xs text-cyan-300">GEOJSON PARSED</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#0f1a30] text-slate-400 border-b border-[#1e293b]">
              <tr>
                <th className="p-3">Type</th>
                <th className="p-3">Timestamp</th>
                <th className="p-3">Coordinates</th>
                <th className="p-3">Wind Speed</th>
                <th className="p-3">Pressure</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1e293b]">
              {combinedPoints.map((pt, i) => (
                <tr key={i} className="hover:bg-[#0f1a30]/60 transition-colors">
                  <td className="p-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      pt.type === 'Observed' 
                        ? 'bg-cyan-950 text-cyan-300 border border-cyan-500/40' 
                        : 'bg-amber-950 text-amber-300 border border-amber-500/40'
                    }`}>
                      {pt.type}
                    </span>
                  </td>
                  <td className="p-3 text-slate-300 font-mono">{pt.fullTime}</td>
                  <td className="p-3 text-white font-mono">{pt.lat.toFixed(2)}°N, {pt.lon.toFixed(2)}°E</td>
                  <td className="p-3 text-rose-300 font-bold">{pt.wind} km/h</td>
                  <td className="p-3 text-cyan-300 font-mono">{pt.pressure} hPa</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default CycloneDetails;
