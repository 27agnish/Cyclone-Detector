import React from 'react';

export interface RiskGaugeProps {
  score: number;
  maxScore?: number;
  category: string;
  size?: number;
  strokeWidth?: number;
  className?: string;
}

export const RiskGauge: React.FC<RiskGaugeProps> = ({
  score,
  maxScore = 100,
  category,
  size = 180,
  strokeWidth = 12,
  className = ''
}) => {
  const radius = (size - strokeWidth * 2) / 2;
  const circumference = 2 * Math.PI * radius;
  const percentage = Math.min(Math.max(score / maxScore, 0), 1);
  const strokeDashoffset = circumference * (1 - percentage);

  // Gradient ID
  const gradId = `riskGaugeGrad_${Math.round(score)}`;

  return (
    <div className={`relative flex items-center justify-center filter drop-shadow-[0_0_24px_rgba(255,51,102,0.6)] ${className}`}>
      <svg width={size} height={size} className="transform -rotate-90">
        <defs>
          <linearGradient id={gradId} x1="0%" x2="100%" y1="0%" y2="100%">
            <stop offset="0%" stopColor="#00e5ff" />
            <stop offset="40%" stopColor="#ff5370" />
            <stop offset="100%" stopColor="#ff3366" />
          </linearGradient>
        </defs>
        {/* Track Circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="transparent"
          stroke="#1e293b"
          strokeWidth={strokeWidth}
        />
        {/* Indicator Circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="transparent"
          stroke={`url(#${gradId})`}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className="transition-all duration-1000 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <span className="font-data-metric-lg text-4xl text-white font-extrabold tracking-tight drop-shadow-[0_0_12px_rgba(255,51,102,0.8)]">
          {Math.round(score)}
        </span>
        <span className="font-data-label text-data-label text-cyan-300 uppercase tracking-widest -mt-1 font-semibold">
          / {maxScore}
        </span>
        <span className="font-badge text-[10px] text-rose-300 uppercase font-bold tracking-wider mt-1 px-2.5 py-0.5 rounded-full bg-rose-950/90 border border-rose-500 shadow-[0_0_8px_rgba(255,51,102,0.6)]">
          {category}
        </span>
      </div>
    </div>
  );
};
