import React from 'react';
import { clsx } from 'clsx';

interface StatusBadgeProps {
  status: string | number;
  type?: 'booking' | 'maintenance' | 'custom';
  customConfig?: Record<string, { class: string; label: string }>;
  className?: string;
}

const defaultConfigs: Record<string, Record<string, { class: string; label: string }>> = {
  booking: {
    '0': { class: 'bg-amber-100 text-amber-800', label: 'Menunggu' },
    '1': { class: 'bg-blue-100 text-blue-800', label: 'Disetujui Level 1' },
    '2': { class: 'bg-green-100 text-green-800', label: 'Disetujui' },
    '-1': { class: 'bg-red-100 text-red-800', label: 'Ditolak' },
  },
  maintenance: {
    SCHEDULED: { class: 'bg-amber-100 text-amber-800', label: 'Dijadwalkan' },
    IN_PROGRESS: { class: 'bg-blue-100 text-blue-800', label: 'Sedang Berlangsung' },
    COMPLETED: { class: 'bg-green-100 text-green-800', label: 'Selesai' },
    CANCELLED: { class: 'bg-red-100 text-red-800', label: 'Dibatalkan' },
  },
};

export default function StatusBadge({ status, type = 'booking', customConfig, className }: StatusBadgeProps) {
  const config = customConfig || defaultConfigs[type] || {};
  const statusKey = String(status);
  const statusConfig = config[statusKey] || { class: 'bg-gray-100 text-gray-800', label: String(status) };

  return (
    <span className={clsx('px-2 py-1 text-xs font-medium rounded-full inline-flex items-center', statusConfig.class, className)}>
      {statusConfig.label}
    </span>
  );
}

export function ReportStatusBadge({ status }: { status: number }) {
  const configs: Record<number, { class: string; label: string }> = {
    2: { class: 'bg-emerald-500/20 text-emerald-400', label: 'Disetujui' },
    [-1]: { class: 'bg-rose-500/20 text-rose-400', label: 'Ditolak' },
    1: { class: 'bg-sky-500/20 text-sky-400', label: 'Level 1' },
    0: { class: 'bg-amber-500/20 text-amber-400', label: 'Menunggu' },
  };
  const config = configs[status] || configs[0];

  return (
    <span className={clsx('inline-flex px-3 py-1 text-xs font-medium rounded-full', config.class)}>
      {config.label}
    </span>
  );
}
