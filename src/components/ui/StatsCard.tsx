'use client';

import React from 'react';
import { clsx } from 'clsx';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  iconColor: string;
  badge?: {
    text: string;
    icon?: React.ReactNode;
    color: string;
  };
  className?: string;
}

export function StatsCard({ title, value, icon, iconColor, badge, className }: StatsCardProps) {
  return (
    <div className={clsx(
      'relative overflow-hidden rounded-xl sm:rounded-2xl transition-all duration-300 p-4 sm:p-6 bg-[var(--card-bg)] border border-[var(--card-border)] hover:shadow-md group',
      className
    )}>
      <div className="relative">
        <div className="flex items-center justify-between mb-3 sm:mb-4">
          <div className={clsx('w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl flex items-center justify-center shadow-lg', iconColor)}>
            {icon}
          </div>
          {badge && (
            <span className={clsx('text-xs sm:text-sm font-medium flex items-center gap-1 px-2 py-1 rounded-full', badge.color)}>
              {badge.icon}
              {badge.text}
            </span>
          )}
        </div>
        <p className="text-[var(--color-gray-500)] text-xs sm:text-sm font-medium">{title}</p>
        <p className="text-xl sm:text-2xl lg:text-3xl font-bold mt-1 text-[var(--foreground)]">{value}</p>
      </div>
    </div>
  );
}
