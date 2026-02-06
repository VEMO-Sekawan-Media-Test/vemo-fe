'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { Line, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Car, Calendar, Fuel, TrendingUp, Clock, MapPin, Filter, ChevronDown, Check } from 'lucide-react';
import { DashboardLayout } from '@/components/layout';
import { Card, CardHeader, CardBody, StatsCard, LoadingSpinner } from '@/components/ui';
import { reportsAPI, bookingsAPI } from '@/lib/api';
import type { DashboardStats, Booking } from '@/types';
import { clsx } from 'clsx';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, ArcElement, Title, Tooltip, Legend, Filler);

const CHART_CONFIG = {
  colors: {
    amberGold: '#F59E0B',
    amberGoldDark: '#FBBF24',
    locations: ['#1E293B', '#F59E0B', '#0284C7', '#059669', '#DC2626', '#7C3AED', '#0D9488'],
    locationsDark: ['#94A3B8', '#FCD34D', '#38BDF8', '#34D399', '#F87171', '#A78BFA', '#2DD4BF'],
  },
};

const RecentBookingsTable = ({ bookings, isDark }: { bookings: Booking[]; isDark: boolean }) => (
  <table className="w-full">
    <thead className={clsx('bg-gray-50', isDark && 'dark:bg-slate-800')}>
      <tr>
        {['Kendaraan', 'Driver', 'Tanggal', 'Status'].map(header => (
          <th key={header} className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">{header}</th>
        ))}
      </tr>
    </thead>
    <tbody className={clsx('divide-y divide-gray-200', isDark && 'dark:divide-slate-700')}>
      {bookings.map(booking => (
        <tr key={booking.id} className={clsx('hover:bg-gray-50', isDark && 'dark:hover:bg-slate-700/50')}>
          <td className="px-6 py-4 whitespace-nowrap">
            <div className={clsx('text-sm font-medium', isDark ? 'dark:text-white' : 'text-gray-900')}>{booking.vehicle?.modelName}</div>
            <div className="text-sm text-gray-500">{booking.vehicle?.plateNumber}</div>
          </td>
          <td className={clsx('px-6 py-4 whitespace-nowrap text-sm', isDark ? 'dark:text-gray-400' : 'text-gray-500')}>{booking.driverName}</td>
          <td className={clsx('px-6 py-4 whitespace-nowrap text-sm', isDark ? 'dark:text-gray-400' : 'text-gray-500')}>
            {new Date(booking.startDate).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}
          </td>
          <td className="px-6 py-4 whitespace-nowrap">
            <span className={clsx(
              'px-2 py-1 text-xs font-medium rounded-full',
              booking.status === 0 ? 'bg-amber-100 text-amber-800' :
              booking.status === 2 ? 'bg-green-100 text-green-800' :
              booking.status === -1 ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'
            )}>
              {booking.status === 0 ? 'Menunggu' : booking.status === 2 ? 'Disetujui' : booking.status === -1 ? 'Ditolak' : 'Level 1'}
            </span>
          </td>
        </tr>
      ))}
    </tbody>
  </table>
);

const getStatsCards = (stats: DashboardStats | null, formatNumber: (n: number) => string) => [
  { title: 'Total Kendaraan', value: formatNumber(stats?.totalVehicles || 0), icon: Car, iconColor: 'from-amber-400 to-amber-600', badgeText: '+12%', badgeColor: 'bg-emerald-500/10 text-emerald-600' },
  { title: 'Pemesanan Aktif', value: formatNumber(stats?.activeBookings || 0), icon: Calendar, iconColor: 'from-emerald-400 to-emerald-600', badgeText: 'Aktif', badgeColor: 'bg-emerald-500/10 text-emerald-600' },
  { title: 'Menunggu Persetujuan', value: formatNumber(stats?.pendingApprovals || 0), icon: Clock, iconColor: 'from-sky-400 to-sky-600', badgeText: 'Pending', badgeColor: 'bg-amber-500/10 text-amber-600' },
  { title: 'Total BBM Digunakan', value: `${formatNumber(stats?.totalFuelUsed || 0)} L`, icon: Fuel, iconColor: 'from-purple-400 to-purple-600', badgeText: 'Bulan Ini', badgeColor: 'text-gray-500' },
];

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentBookings, setRecentBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDark, setIsDark] = useState(false);
  const [visibleLocations, setVisibleLocations] = useState<string[]>([]);
  
  useEffect(() => {
    const checkTheme = () => setIsDark(document.documentElement.classList.contains('dark'));
    checkTheme();
    const observer = new MutationObserver(checkTheme);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsData, bookingsData] = await Promise.all([reportsAPI.getDashboard(), bookingsAPI.getAll()]);
        setStats(statsData);
        setRecentBookings(bookingsData.slice(0, 6));
        if (statsData?.vehiclesByLocation) setVisibleLocations(Object.keys(statsData.vehiclesByLocation));
      } catch (error) { console.error('Failed to fetch dashboard data:', error); }
      finally { setIsLoading(false); }
    };
    fetchData();
  }, []);
  
  const formatNumber = (num: number) => num.toLocaleString('id-ID');
  const statsCards = useMemo(() => getStatsCards(stats, formatNumber), [stats]);
  const locationColors = isDark ? CHART_CONFIG.colors.locationsDark : CHART_CONFIG.colors.locations;
  
  const lineData = useMemo(() => {
    if (!stats) return { labels: [], datasets: [] };
    const sortedMonths = Object.entries(stats.bookingsByMonth).sort(([a], [b]) => a.localeCompare(b));
    return {
      labels: sortedMonths.map(([month]) => month),
      datasets: [{
        label: 'Pemesanan',
        data: sortedMonths.map(([, count]) => count),
        borderColor: isDark ? CHART_CONFIG.colors.amberGoldDark : CHART_CONFIG.colors.amberGold,
        backgroundColor: (ctx: any) => {
          const gradient = ctx.chart.ctx.createLinearGradient(0, 0, 0, 300);
          gradient.addColorStop(0, isDark ? 'rgba(251, 191, 36, 0.5)' : 'rgba(245, 158, 11, 0.5)');
          gradient.addColorStop(1, isDark ? 'rgba(251, 191, 36, 0.0)' : 'rgba(245, 158, 11, 0.0)');
          return gradient;
        },
        fill: true, tension: 0.4, pointRadius: 4, pointHoverRadius: 6,
      }],
    };
  }, [stats, isDark]);
  
  const doughnutData = useMemo(() => {
    if (!stats) return { labels: [], datasets: [] };
    const allLocations = Object.keys(stats.vehiclesByLocation);
    const filteredLabels = allLocations.filter(loc => visibleLocations.includes(loc));
    return {
      labels: filteredLabels,
      datasets: [{
        data: filteredLabels.map(loc => stats.vehiclesByLocation[loc]),
        backgroundColor: filteredLabels.map((loc, i) => locationColors[allLocations.indexOf(loc) % locationColors.length]),
        borderColor: isDark ? '#1E293B' : '#FFFFFF', borderWidth: 2, hoverOffset: 4,
      }],
    };
  }, [stats, visibleLocations, locationColors, isDark]);
  
  if (isLoading) return <DashboardLayout><LoadingSpinner /></DashboardLayout>;
  
  return (
    <DashboardLayout>
      <div className="relative overflow-hidden rounded-2xl p-6 lg:p-8 mb-6 bg-[var(--card-bg)] border border-[var(--card-border)] shadow-sm">
        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-sky-500/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 pointer-events-none" />
        <div className="relative z-10">
          <h1 className="text-2xl lg:text-3xl font-bold mb-2 text-[var(--foreground)]">Selamat Datang di VEMO</h1>
          <p className="text-[var(--color-gray-500)]">Sistem Monitoring Kendaraan PT. Nikel Indonesia</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 mb-6">
        {statsCards.map((card, i) => (
          <StatsCard key={i} title={card.title} value={card.value} icon={<card.icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />} iconColor={`bg-gradient-to-br ${card.iconColor}`} badge={{ text: card.badgeText, color: card.badgeColor }} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <Card className="shadow-sm">
          <CardHeader className="border-b border-[var(--card-border)]">
            <div className="flex items-center gap-2"><TrendingUp className="w-5 h-5 text-amber-500" /><h3 className="font-semibold text-[var(--foreground)]">Tren Pemesanan</h3></div>
          </CardHeader>
          <CardBody><div style={{ height: '300px' }} className="w-full"><Line data={lineData} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }} /></div></CardBody>
        </Card>

        <Card className="shadow-sm overflow-visible z-10">
          <CardHeader className="border-b border-[var(--card-border)]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2"><MapPin className="w-5 h-5 text-sky-600 dark:text-sky-400" /><h3 className="font-semibold text-[var(--foreground)]">Sebaran Kendaraan</h3></div>
              <LocationFilterDropdown visibleLocations={visibleLocations} onToggle={(loc: string) => setVisibleLocations(p => p.includes(loc) ? p.filter(l => l !== loc) : [...p, loc])} isDark={isDark} allLocations={stats ? Object.keys(stats.vehiclesByLocation) : []} />
            </div>
          </CardHeader>
          <CardBody>
            <div style={{ height: '300px' }} className="w-full flex items-center justify-center">
              {doughnutData.labels.length > 0 ? <Doughnut data={doughnutData} options={{ responsive: true, maintainAspectRatio: false, cutout: '60%', plugins: { legend: { display: false } } }} plugins={[createOutsideLabelsPlugin(isDark)]} /> : <p className="text-sm text-gray-500">Pilih lokasi untuk menampilkan data.</p>}
            </div>
          </CardBody>
        </Card>
      </div>

      <Card className="shadow-sm overflow-hidden z-0">
        <CardHeader className="border-b border-[var(--card-border)]">
          <div className="flex items-center gap-2"><Clock className="w-5 h-5 text-amber-500" /><h3 className="font-semibold text-[var(--foreground)]">Pemesanan Terbaru</h3></div>
        </CardHeader>
        <CardBody className="p-0"><div className="overflow-x-auto"><RecentBookingsTable bookings={recentBookings} isDark={isDark} /></div></CardBody>
      </Card>
    </DashboardLayout>
  );
}

function LocationFilterDropdown({ visibleLocations, onToggle, isDark, allLocations }: any) {
  const [isOpen, setIsOpen] = useState(false);
  const ref = React.useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const handleClick = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setIsOpen(false); };
    if (isOpen) document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [isOpen]);
  
  const colors = isDark ? CHART_CONFIG.colors.locationsDark : CHART_CONFIG.colors.locations;
  
  return (
    <div className="relative" ref={ref}>
      <button onClick={() => setIsOpen(!isOpen)} className={clsx('flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all border cursor-pointer', isDark ? 'border-slate-700 hover:bg-slate-800 text-slate-300' : 'border-gray-200 hover:bg-gray-50 text-gray-700')}>
        <Filter className="w-4 h-4 cursor-pointer" /><span>Filter</span><ChevronDown className="w-3 h-3 ml-1" />
      </button>
      {isOpen && (
        <div className={clsx('absolute right-0 mt-2 w-56 rounded-xl shadow-xl border z-50 p-2', isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-100')}>
          <div className="space-y-1">
            {allLocations.map((loc: string, i: number) => {
              const isSelected = visibleLocations.includes(loc);
              return (
                <div key={loc} onClick={() => onToggle(loc)} className={clsx('flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer text-sm transition-colors', isDark ? 'hover:bg-slate-700 text-slate-200' : 'hover:bg-gray-50 text-gray-700')}>
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: colors[i % colors.length] }} />
                    <span className="truncate max-w-[120px]">{loc}</span>
                  </div>
                  <div className={clsx('w-4 h-4 rounded border flex items-center justify-center', isSelected ? 'bg-amber-500 border-amber-500' : isDark ? 'border-slate-600' : 'border-gray-300')}>
                    {isSelected && <Check className="w-3 h-3 text-white" />}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function createOutsideLabelsPlugin(isDark: boolean) {
  return {
    id: 'outsideLabels',
    afterDraw: (chart: any) => {
      const { ctx, width, height } = chart;
      const { datasets } = chart.data;
      ctx.save();
      ctx.font = 'bold 11px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      const meta = chart.getDatasetMeta(0);
      const centerX = width / 2;
      const centerY = height / 2;
      const offset = 25;
      
      meta.data.forEach((element: any, index: number) => {
        if (element.hidden) return;
        const { x, y } = element.tooltipPosition();
        const value = datasets[0].data[index] as number;
        const angle = Math.atan2(y - centerY, x - centerX);
        const tx = x + Math.cos(angle) * offset;
        const ty = y + Math.sin(angle) * offset;
        const textWidth = ctx.measureText(String(value)).width + 8;
        ctx.fillStyle = isDark ? '#1E293B' : '#FFFFFF';
        ctx.shadowColor = 'rgba(0,0,0,0.2)';
        ctx.shadowBlur = 4;
        ctx.beginPath();
        ctx.roundRect(tx - textWidth/2, ty - 10, textWidth, 20, 10);
        ctx.fill();
        ctx.shadowColor = 'transparent';
        ctx.fillStyle = isDark ? '#F1F5F9' : '#1E293B';
        ctx.fillText(String(value), tx, ty);
      });
      ctx.restore();
    },
  };
}
