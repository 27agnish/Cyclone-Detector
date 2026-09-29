import React from 'react';

export interface Column<T> {
  key: string;
  header: string;
  render?: (item: T, index: number) => React.ReactNode;
  align?: 'left' | 'center' | 'right';
  className?: string;
}

export interface DataTableProps<T> {
  title: string;
  icon?: string;
  subtitle?: string;
  columns: Column<T>[];
  data: T[];
  keyExtractor: (item: T, index: number) => string;
  rowClassName?: (item: T, index: number) => string;
  className?: string;
}

export function DataTable<T>({
  title,
  icon = 'table_rows',
  subtitle,
  columns,
  data,
  keyExtractor,
  rowClassName,
  className = ''
}: DataTableProps<T>) {
  return (
    <div className={`bg-surface-container-low/90 border border-outline-variant/30 rounded-lg p-space-sm shadow-md flex flex-col gap-space-xs ${className}`}>
      {/* Table Header */}
      <div className="flex items-center justify-between pb-space-xs border-b border-outline-variant/30">
        <div className="flex items-center gap-space-xs">
          <span className="material-symbols-outlined text-cyan-400 text-[18px]">{icon}</span>
          <span className="font-headline-sm text-body-md font-bold text-white tracking-wide">{title}</span>
        </div>
        {subtitle && (
          <div className="flex items-center gap-space-xs font-data-label text-[11px] text-outline">
            {subtitle}
          </div>
        )}
      </div>

      {/* Table Body */}
      <div className="overflow-x-auto">
        <table className="w-full text-left font-data-label text-data-label">
          <thead>
            <tr className="text-outline uppercase bg-surface-container-lowest/80 border-b border-outline-variant/30 text-[10px] tracking-wider">
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={`py-space-xs px-space-sm ${col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : 'text-left'} ${col.className || ''}`}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant/20 font-data-value text-data-value">
            {data.map((item, index) => {
              const customRowClass = rowClassName ? rowClassName(item, index) : '';
              return (
                <tr
                  key={keyExtractor(item, index)}
                  className={`hover:bg-surface-container-high/60 transition-colors ${customRowClass}`}
                >
                  {columns.map((col) => (
                    <td
                      key={col.key}
                      className={`py-space-xs px-space-sm ${col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : 'text-left'}`}
                    >
                      {col.render ? col.render(item, index) : (item as any)[col.key]}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
