import React from 'react';

export interface StatCardProps {
  label: string;
  badge?: string;
  badgeType?: 'crimson' | 'cyan' | 'amber' | 'emerald' | 'neutral';
  value: string | number;
  unit?: string;
  trend?: {
    direction: 'up' | 'down' | 'steady';
    text: string;
    type?: 'crimson' | 'cyan' | 'amber' | 'emerald';
  };
  footerLabel?: string;
  footerValue?: string;
  sparklineSvg?: React.ReactNode;
  icon?: string;
  glowColor?: 'crimson' | 'cyan' | 'emerald' | 'amber';
  className?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  label,
  badge,
  badgeType = 'neutral',
  value,
  unit,
  trend,
  footerLabel,
  footerValue,
  sparklineSvg,
  icon,
  glowColor,
  className = ''
}) => {
  const badgeClasses = {
    crimson: 'bg-rose-950/80 border-rose-500/50 text-rose-300',
    cyan: 'bg-cyan-950/80 border-cyan-500/40 text-cyan-300',
    amber: 'bg-amber-950/80 border-amber-500/40 text-amber-300',
    emerald: 'bg-emerald-950/80 border-emerald-500/40 text-emerald-300',
    neutral: 'bg-surface-container border-outline-variant/40 text-on-surface'
  }[badgeType];

  const trendClasses = {
    crimson: 'text-rose-400',
    cyan: 'text-cyan-400',
    amber: 'text-amber-400',
    emerald: 'text-emerald-400'
  }[trend?.type || 'cyan'];

  const glowBlur = {
    crimson: 'bg-rose-500/10',
    cyan: 'bg-cyan-500/10',
    emerald: 'bg-emerald-500/10',
    amber: 'bg-amber-500/10'
  }[glowColor || 'cyan'];

  return (
    <div className={`glass-card p-space-sm rounded-lg flex flex-col justify-between shadow-sm relative overflow-hidden group ${className}`}>
      {glowColor && (
        <div className={`absolute -right-6 -top-6 w-20 h-20 ${glowBlur} rounded-full blur-xl pointer-events-none`} />
      )}
      
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <span className="font-data-label text-data-label text-outline uppercase tracking-wider text-[11px]">
          {label}
        </span>
        {badge && (
          <span className={`font-badge text-badge px-space-xs py-space-2xs rounded border uppercase font-bold tracking-wider ${badgeClasses}`}>
            {badge}
          </span>
        )}
      </div>

      {/* Main Metric */}
      <div className="my-space-xs flex items-baseline justify-between">
        <span className="font-data-metric-lg text-data-metric-lg text-white font-bold filter drop-shadow-[0_0_8px_rgba(0,229,255,0.3)]">
          {value} {unit && <span className="text-body-sm font-data-label text-on-surface-variant font-normal">{unit}</span>}
        </span>
        {trend && (
          <span className={`font-data-value text-data-label font-semibold flex items-center gap-space-2xs ${trendClasses}`}>
            {trend.direction === 'up' && <span className="material-symbols-outlined text-[14px]">arrow_upward</span>}
            {trend.direction === 'down' && <span className="material-symbols-outlined text-[14px]">arrow_downward</span>}
            {trend.text}
          </span>
        )}
      </div>

      {/* Footer / Sparkline */}
      <div className="flex items-center justify-between font-data-label text-[11px] text-outline">
        <div>
          {footerLabel && <span>{footerLabel}: </span>}
          {footerValue && <strong className="text-on-surface">{footerValue}</strong>}
        </div>
        {sparklineSvg}
        {icon && <span className="material-symbols-outlined text-[16px] text-cyan-400">{icon}</span>}
      </div>
    </div>
  );
};
