import React from 'react';

export interface ChartCardProps {
  label: string;
  title: string;
  peakBadge?: string;
  peakBadgeColor?: 'crimson' | 'cyan' | 'amber' | 'emerald';
  children: React.ReactNode;
  footerLeft?: string;
  footerCenter?: string;
  footerRight?: string;
  className?: string;
}

export const ChartCard: React.FC<ChartCardProps> = ({
  label,
  title,
  peakBadge,
  peakBadgeColor = 'cyan',
  children,
  footerLeft,
  footerCenter,
  footerRight,
  className = ''
}) => {
  const badgeClasses = {
    crimson: 'text-rose-400 bg-rose-950/60 border-rose-500/40',
    cyan: 'text-cyan-300 bg-cyan-950/60 border-cyan-500/40',
    amber: 'text-amber-300 bg-amber-950/60 border-amber-500/40',
    emerald: 'text-emerald-400 bg-emerald-950/60 border-emerald-500/40'
  }[peakBadgeColor];

  return (
    <div className={`glass-card p-space-sm rounded-lg shadow-md flex flex-col justify-between ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-space-xs">
        <div className="flex flex-col">
          <span className="font-data-label text-data-label text-outline uppercase tracking-wider text-[11px]">
            {label}
          </span>
          <span className="font-body-md text-body-md font-semibold text-white">
            {title}
          </span>
        </div>
        {peakBadge && (
          <span className={`font-data-value text-data-label font-bold px-2 py-0.5 rounded border ${badgeClasses}`}>
            {peakBadge}
          </span>
        )}
      </div>

      {/* Chart Canvas */}
      <div className="w-full h-36 bg-surface-container-lowest/90 border border-outline-variant/30 rounded p-space-xs relative flex items-end">
        {children}
      </div>

      {/* Footer Horizon Labels */}
      {(footerLeft || footerCenter || footerRight) && (
        <div className="flex items-center justify-between font-data-label text-[10px] text-outline mt-space-xs">
          <span>{footerLeft}</span>
          <span className="text-cyan-300 font-bold">{footerCenter}</span>
          <span>{footerRight}</span>
        </div>
      )}
    </div>
  );
};
