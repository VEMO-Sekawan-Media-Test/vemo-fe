import React from 'react';
import { clsx } from 'clsx';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'gray' | 'red' | 'yellow' | 'green' | 'blue' | 'indigo' | 'amber';
  size?: 'sm' | 'md';
}

export function Badge({ children, variant = 'gray', size = 'md' }: BadgeProps) {
  const variants = {
    gray: 'bg-gray-100 text-gray-800',
    red: 'bg-red-100 text-red-800',
    yellow: 'bg-yellow-100 text-yellow-800',
    green: 'bg-green-100 text-green-800',
    blue: 'bg-blue-100 text-blue-800',
    indigo: 'bg-indigo-100 text-indigo-800',
    amber: 'bg-amber-100 text-amber-800',
  };

  const sizes = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-sm',
  };

  return (
    <span className={clsx('inline-flex items-center font-medium rounded-full', variants[variant], sizes[size])}>
      {children}
    </span>
  );
}

export function BookingStatusBadge({ status }: { status: number }) {
  const config: Record<number, { label: string; variant: 'pending' | 'approved' | 'rejected' | 'lvl1' }> = {
    0: { label: 'Pending', variant: 'pending' as const },
    1: { label: 'Lvl 1 Approved', variant: 'lvl1' as const },
    2: { label: 'Approved', variant: 'approved' as const },
    '-1': { label: 'Rejected', variant: 'rejected' as const },
  };

  const { label, variant } = config[status as keyof typeof config] || { label: 'Unknown', variant: 'gray' as const };

  const variantClasses = {
    pending: 'bg-[#0EA5E9] text-white',      // Sky Blue
    lvl1: 'bg-[#0EA5E9] text-white',        // Sky Blue
    approved: 'bg-[#10B981] text-white',     // Emerald Green
    rejected: 'bg-[#F43F5E] text-white',     // Rose Red
    gray: 'bg-gray-100 text-gray-800',
  };

  return (
    <span className={clsx('inline-flex px-2 py-1 text-xs font-semibold rounded-full', variantClasses[variant])}>
      {label}
    </span>
  );
}

export function MaintenanceStatusBadge({ status }: { status: string }) {
  const config: Record<string, { label: string; variant: 'scheduled' | 'in_progress' | 'completed' | 'cancelled' }> = {
    SCHEDULED: { label: 'Scheduled', variant: 'scheduled' as const },
    IN_PROGRESS: { label: 'In Progress', variant: 'in_progress' as const },
    COMPLETED: { label: 'Completed', variant: 'completed' as const },
    CANCELLED: { label: 'Cancelled', variant: 'cancelled' as const },
  };

  const { label, variant } = config[status as keyof typeof config] || { label: 'Unknown', variant: 'gray' as const };

  const variantClasses = {
    scheduled: 'bg-[#0EA5E9] text-white',    // Sky Blue
    in_progress: 'bg-[#F59E0B] text-white',   // Amber
    completed: 'bg-[#10B981] text-white',     // Emerald Green
    cancelled: 'bg-[#F43F5E] text-white',    // Rose Red
    gray: 'bg-gray-100 text-gray-800',
  };

  return (
    <span className={clsx('inline-flex px-2 py-1 text-xs font-semibold rounded-full', variantClasses[variant])}>
      {label}
    </span>
  );
}
