import React from 'react';
import { Line } from 'react-chartjs-2';
import { clsx } from 'clsx';
import { CHART_COLORS, CHART_COLORS_DARK } from './chart-utils';

interface LineChartProps {
  data: {
    labels: string[];
    datasets: Array<{ 
      label: string; 
      data: number[]; 
      borderColor: string; 
      backgroundColor: string | ((context: any) => string);
      fill: boolean;
      tension: number;
      pointBackgroundColor: string;
      pointBorderColor: string;
      pointBorderWidth: number;
      pointRadius: number;
      pointHoverRadius: number;
    }>;
  };
  options: any;
  height?: number;
  className?: string;
}

export default function LineChart({ data, options, height = 300, className }: LineChartProps) {
  return (
    <div className={clsx('w-full', className)}>
      <div style={{ height }} className='w-full'>
        <Line data={data} options={options} />
      </div>
    </div>
  );
}

export const useLineChartOptions = (isDark: boolean) => {
  const textColor = isDark ? '#F1F5F9' : '#1E293B';
  const gridColor = isDark ? '#334155' : '#E2E8F0';

  return {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: isDark ? '#0F172A' : '#FFFFFF',
        titleColor: textColor,
        bodyColor: isDark ? '#CBD5E1' : '#475569',
        borderColor: gridColor,
        borderWidth: 1,
        padding: 12,
        cornerRadius: 8,
        displayColors: false,
        titleFont: { weight: 'bold' as any },
      },
    },
    scales: {
      x: {
        grid: { color: 'transparent' },
        ticks: { color: isDark ? '#94A3B8' : '#64748B' },
      },
      y: {
        grid: { color: gridColor, borderDash: [4, 4] },
        ticks: { color: isDark ? '#94A3B8' : '#64748B' },
        beginAtZero: true,
      },
    },
  };
};

export const useLineChartData = (isDark: boolean, stats: any) => {
  const chartColor = isDark ? CHART_COLORS_DARK.amberGold : CHART_COLORS.amberGold;
  const chartBorderColor = isDark ? '#1E293B' : '#FFFFFF';

  const sortedMonths = stats
    ? Object.entries(stats.bookingsByMonth).sort(([a], [b]) => a.localeCompare(b))
    : [];

  return {
    labels: sortedMonths.map(([month]) => month),
    datasets: [
      {
        label: 'Pemesanan',
        data: sortedMonths.map(([, count]) => count),
        borderColor: chartColor,
        backgroundColor: (context: any) => {
          const ctx = context.chart.ctx;
          const gradient = ctx.createLinearGradient(0, 0, 0, 300);
          gradient.addColorStop(0, isDark ? 'rgba(251, 191, 36, 0.5)' : 'rgba(245, 158, 11, 0.5)');
          gradient.addColorStop(1, isDark ? 'rgba(251, 191, 36, 0.0)' : 'rgba(245, 158, 11, 0.0)');
          return gradient;
        },
        fill: true,
        tension: 0.4,
        pointBackgroundColor: chartColor,
        pointBorderColor: chartBorderColor,
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
      },
    ],
  };
};