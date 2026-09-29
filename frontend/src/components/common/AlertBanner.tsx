import React from 'react';

export interface AlertBannerProps {
  message: string;
  subtext?: string;
  type?: 'warning' | 'danger' | 'info';
  apiTag?: string;
  className?: string;
}

export const AlertBanner: React.FC<AlertBannerProps> = ({
  message,
  subtext,
  type = 'warning',
  apiTag,
  className = ''
}) => {
  const styles = {
    warning: {
      bg: 'bg-gradient-to-r from-red-950/80 via-rose-950/70 to-red-950/80 border-rose-500/40 text-red-200',
      icon: 'warning',
      iconClass: 'text-rose-400 alert-beacon drop-shadow-[0_0_8px_rgba(255,51,102,0.8)]',
      beacon: 'bg-rose-500'
    },
    danger: {
      bg: 'bg-gradient-to-r from-red-950/90 via-rose-950/90 to-red-950/90 border-red-500/60 text-white',
      icon: 'crisis_alert',
      iconClass: 'text-red-400 alert-beacon drop-shadow-[0_0_10px_rgba(239,68,68,0.9)]',
      beacon: 'bg-red-500'
    },
    info: {
      bg: 'bg-gradient-to-r from-cyan-950/80 via-surface-container to-cyan-950/80 border-cyan-500/40 text-cyan-200',
      icon: 'info',
      iconClass: 'text-cyan-400 pulse-beacon',
      beacon: 'bg-cyan-400'
    }
  }[type];

  return (
    <div className={`px-space-lg py-2 border-y flex items-center justify-between shadow-[0_0_16px_rgba(255,51,102,0.15)] ${styles.bg} ${className}`}>
      <div className="flex items-center gap-2.5">
        <span className={`material-symbols-outlined text-[18px] ${styles.iconClass}`}>
          {styles.icon}
        </span>
        <div className="flex flex-col md:flex-row md:items-center md:gap-2">
          <span className="font-data-label text-data-label uppercase tracking-widest font-bold">
            {message}
          </span>
          {subtext && (
            <span className="font-body-sm text-[12px] opacity-80">
              {subtext}
            </span>
          )}
        </div>
      </div>
      {apiTag && (
        <div className="flex items-center gap-2 shrink-0">
          <span className={`w-2 h-2 rounded-full pulse-beacon ${styles.beacon}`} />
          <span className="font-data-value text-data-label hidden md:inline-block text-cyan-300 font-mono">
            {apiTag}
          </span>
        </div>
      )}
    </div>
  );
};
