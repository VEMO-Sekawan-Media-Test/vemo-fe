import React from 'react';
import { Doughnut } from 'react-chartjs-2';
import { clsx } from 'clsx';
import { createOutsideLabelsPlugin } from './chart-utils';

interface DoughnutChartProps {
  data: {
    labels: string[];
    datasets: Array<{
      data: number[];
      backgroundColor: string[];
      borderColor: string;
      borderWidth: number;
      hoverOffset: number;
    }>;
  };
  options: any;
  plugins?: any[];
  height?: number;
  className?: string;
}

export default function DoughnutChart({ data, options, plugins = [], height = 300, className }: DoughnutChartProps) {
  return (
    <div className={clsx('w-full', className)}>
      <div style={{ height }} className='w-full flex items-center justify-center'>
        {data.labels.length > 0 ? (
          <Doughnut 
            data={data} 
            options={options}
            plugins={[...plugins, createOutsideLabelsPlugin(false)]} 
          />
        ) : (
          <p className='text-sm text-gray-500'>No data available</p>
        )}
      </div>
    </div>
  );
}

export const useDoughnutChartOptions = (isDark: boolean) => {
  const textColor = isDark ? '#F1F5F9' : '#1E293B';
  const gridColor = isDark ? '#334155' : '#E2E8F0';

  return {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '60%',
    layout: {
      padding: 30 
    },
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
        titleFont: { weight: 'bold' as any },
        callbacks: {
          label: function(context: any) {
            return ` ${context.label}: ${context.raw} unit`;
          }
        }
      },
    },
  };
};

export const useDoughnutChartData = (isDark: boolean, stats: any, visibleLocations: string[]) => {
  const locationColors = isDark ? [
    '#94A3B8', // Slate 400
    '#FCD34D', // Amber 300
    '#38BDF8', // Sky 400
    '#34D399', // Emerald 400
    '#F87171', // Red 400
    '#A78BFA', // Violet 400
    '#2DD4BF', // Teal 400
  ] : [
    '#1E293B', // Slate 800
    '#F59E0B', // Amber 500
    '#0284C7', // Sky 600
    '#059669', // Emerald 600
    '#DC2626', // Red 600
    '#7C3AED', // Violet 600
    '#0D9488', // Teal 600
  ];

  const allLocations = stats ? Object.keys(stats.vehiclesByLocation) : [];
  
  const filteredLabels = allLocations.filter(loc => visibleLocations.includes(loc));
  const filteredDataValues = filteredLabels.map(loc => stats?.vehiclesByLocation[loc] || 0);
  
  const filteredColors = filteredLabels.map(loc => {
    const originalIndex = allLocations.indexOf(loc);
    return locationColors[originalIndex % locationColors.length];
  });

  return {
    labels: filteredLabels,
    datasets: [
      {
        data: filteredDataValues,
        backgroundColor: filteredColors,
        borderColor: isDark ? '#1E293B' : '#FFFFFF',
        borderWidth: 2,
        hoverOffset: 4,
      },
    ],
  };
};