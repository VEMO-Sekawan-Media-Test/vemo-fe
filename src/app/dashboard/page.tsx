'use client';

import React, { useEffect, useState } from 'react';
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
import { Line, Doughnut } from 'react-chartjs-2';
import { Car, Calendar, CheckCircle, Fuel, TrendingUp, Clock, AlertCircle, Activity, MapPin } from 'lucide-react';
import { DashboardLayout } from '@/components/layout';
import { Card, CardHeader, CardBody } from '@/components/ui';
import { reportsAPI, bookingsAPI } from '@/lib/api';
import type { DashboardStats, Booking } from '@/types';
import { clsx } from 'clsx';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

// --- KONFIGURASI WARNA ---

// Warna standar (Light Mode)
const CHART_COLORS = {
  amberGold: '#F59E0B',
};

// Warna lebih terang/neon (Dark Mode) agar kontras tinggi
const CHART_COLORS_DARK = {
  amberGold: '#FBBF24', // Lebih terang dari amber biasa
};

// Warna Kategori/Lokasi (Light Mode)
const LOCATION_COLORS = [
  '#1E293B', // Slate 800
  '#F59E0B', // Amber 500
  '#0284C7', // Sky 600
  '#059669', // Emerald 600
  '#DC2626', // Red 600
  '#7C3AED', // Violet 600
  '#0D9488', // Teal 600
];

// Warna Kategori/Lokasi (Dark Mode) - Dibuat lebih pastel/neon agar terlihat di background gelap
const LOCATION_COLORS_DARK = [
  '#94A3B8', // Slate 400 (Pengganti hitam/slate tua)
  '#FCD34D', // Amber 300
  '#38BDF8', // Sky 400
  '#34D399', // Emerald 400
  '#F87171', // Red 400
  '#A78BFA', // Violet 400
  '#2DD4BF', // Teal 400
];

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentBookings, setRecentBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // State untuk mendeteksi dark mode secara real-time
  const [isDark, setIsDark] = useState(false);

  // 1. IMPROVED THEME DETECTION
  // Menggunakan MutationObserver untuk mendeteksi perubahan class 'dark' di elemen <html>
  useEffect(() => {
    const checkTheme = () => {
      const isDarkMode = document.documentElement.classList.contains('dark');
      setIsDark(isDarkMode);
    };

    // Cek awal
    checkTheme();

    // Pantau perubahan atribut class pada elemen html
    const observer = new MutationObserver(checkTheme);
    observer.observe(document.documentElement, { 
      attributes: true, 
      attributeFilter: ['class'] 
    });

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsData, bookingsData] = await Promise.all([
          reportsAPI.getDashboard(),
          bookingsAPI.getAll(),
        ]);
        setStats(statsData);
        setRecentBookings(bookingsData.slice(0, 6));
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const formatNumber = (num: number) => num.toLocaleString('id-ID');

  // --- LOGIKA PEMILIHAN WARNA ---
  const locationColors = isDark ? LOCATION_COLORS_DARK : LOCATION_COLORS;
  const chartColor = isDark ? CHART_COLORS_DARK.amberGold : CHART_COLORS.amberGold;
  
  // Warna background card untuk border chart (agar terlihat seperti "cutout")
  // Light: #FFFFFF, Dark: #1E293B (sesuai --card-bg di CSS)
  const chartBorderColor = isDark ? '#1E293B' : '#FFFFFF';
  
  // Warna teks
  const textColor = isDark ? '#F1F5F9' : '#1E293B'; // Slate 100 vs Slate 800
  const gridColor = isDark ? '#334155' : '#E2E8F0'; // Slate 700 vs Slate 200

  // --- DATA CHARTS ---

  // 1. Doughnut Data (Vehicles by Location)
  const doughnutData = stats
    ? {
        labels: Object.keys(stats.vehiclesByLocation),
        datasets: [
          {
            data: Object.values(stats.vehiclesByLocation),
            backgroundColor: locationColors,
            // Perbaikan: Tambahkan border agar irisan terpisah jelas
            borderColor: chartBorderColor, 
            borderWidth: 2,
            hoverOffset: 4,
          },
        ],
      }
    : { labels: [], datasets: [{ data: [], backgroundColor: [] }] };

  // 2. Line Chart Data (Monthly Bookings)
  const sortedMonths = stats
    ? Object.entries(stats.bookingsByMonth).sort(([a], [b]) => a.localeCompare(b))
    : [];

  const lineData = {
    labels: sortedMonths.map(([month]) => month),
    datasets: [
      {
        label: 'Pemesanan',
        data: sortedMonths.map(([, count]) => count),
        borderColor: chartColor,
        // Gradasi transparan untuk area fill
        backgroundColor: (context: any) => {
          const ctx = context.chart.ctx;
          const gradient = ctx.createLinearGradient(0, 0, 0, 300);
          if (isDark) {
            gradient.addColorStop(0, 'rgba(251, 191, 36, 0.5)'); // Amber terang
            gradient.addColorStop(1, 'rgba(251, 191, 36, 0.0)');
          } else {
            gradient.addColorStop(0, 'rgba(245, 158, 11, 0.5)'); // Amber normal
            gradient.addColorStop(1, 'rgba(245, 158, 11, 0.0)');
          }
          return gradient;
        },
        fill: true,
        tension: 0.4,
        pointBackgroundColor: chartColor,
        pointBorderColor: chartBorderColor, // Border titik menyesuaikan bg
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
      },
    ],
  };

  // --- OPTIONS CHARTS ---

  const lineOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
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
        grid: { color: 'transparent' }, // Grid X dihilangkan agar lebih bersih
        ticks: { color: isDark ? '#94A3B8' : '#64748B' },
      },
      y: {
        grid: { color: gridColor, borderDash: [4, 4] }, // Grid Y putus-putus
        ticks: { color: isDark ? '#94A3B8' : '#64748B' },
        beginAtZero: true,
      },
    },
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '65%',
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          // Perbaikan: Warna teks legend dinamis
          color: textColor, 
          padding: 20,
          usePointStyle: true,
          pointStyle: 'circle',
          font: {
            size: 11,
            weight: 500 as any,
          },
        },
      },
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

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <div className="flex space-x-2">
            <div className="w-4 h-4 bg-amber-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
            <div className="w-4 h-4 bg-amber-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
            <div className="w-4 h-4 bg-amber-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl transition-all duration-300 p-6 lg:p-8 mb-6 bg-[var(--card-bg)] border border-[var(--card-border)] shadow-sm">
        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-sky-500/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 pointer-events-none"></div>
        <div className="relative z-10">
          <h1 className="text-2xl lg:text-3xl font-bold mb-2 text-[var(--foreground)]">Selamat Datang di VEMO</h1>
          <p className="text-[var(--color-gray-500)]">Sistem Monitoring Kendaraan PT. Nikel Indonesia</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-6">
        {/* Total Vehicles */}
        <div className="relative overflow-hidden rounded-2xl transition-all duration-300 p-6 bg-[var(--card-bg)] border border-[var(--card-border)] hover:border-[var(--color-secondary)] hover:shadow-md group">
          <div className="relative">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center shadow-lg bg-gradient-to-br from-amber-400 to-amber-600">
                <Car className="w-6 h-6 text-white" />
              </div>
              <span className="text-[var(--color-approved)] text-sm font-medium flex items-center gap-1 bg-emerald-500/10 px-2 py-1 rounded-full">
                <TrendingUp className="w-3 h-3" /> +12%
              </span>
            </div>
            <p className="text-[var(--color-gray-500)] text-sm font-medium">Total Kendaraan</p>
            <p className="text-2xl lg:text-3xl font-bold mt-1 text-[var(--foreground)]">{formatNumber(stats?.totalVehicles || 0)}</p>
          </div>
        </div>

        {/* Active Bookings */}
        <div className="relative overflow-hidden rounded-2xl transition-all duration-300 p-6 bg-[var(--card-bg)] border border-[var(--card-border)] hover:border-[var(--color-approved)] hover:shadow-md group">
          <div className="relative">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center shadow-lg bg-gradient-to-br from-emerald-400 to-emerald-600">
                <Calendar className="w-6 h-6 text-white" />
              </div>
              <span className="text-[var(--color-approved)] text-sm font-medium flex items-center gap-1 bg-emerald-500/10 px-2 py-1 rounded-full">
                <Activity className="w-3 h-3" /> Aktif
              </span>
            </div>
            <p className="text-[var(--color-gray-500)] text-sm font-medium">Pemesanan Aktif</p>
            <p className="text-2xl lg:text-3xl font-bold mt-1 text-[var(--foreground)]">{formatNumber(stats?.activeBookings || 0)}</p>
          </div>
        </div>

        {/* Pending Approvals */}
        <div className="relative overflow-hidden rounded-2xl transition-all duration-300 p-6 bg-[var(--card-bg)] border border-[var(--card-border)] hover:border-[var(--color-pending)] hover:shadow-md group">
          <div className="relative">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center shadow-lg bg-gradient-to-br from-sky-400 to-sky-600">
                <Clock className="w-6 h-6 text-white" />
              </div>
              <span className="text-[var(--color-in-progress)] text-sm font-medium flex items-center gap-1 bg-amber-500/10 px-2 py-1 rounded-full">
                <AlertCircle className="w-3 h-3" /> Pending
              </span>
            </div>
            <p className="text-[var(--color-gray-500)] text-sm font-medium">Menunggu Persetujuan</p>
            <p className="text-2xl lg:text-3xl font-bold mt-1 text-[var(--foreground)]">{formatNumber(stats?.pendingApprovals || 0)}</p>
          </div>
        </div>

        {/* Completed This Month */}
        <div className="relative overflow-hidden rounded-2xl transition-all duration-300 p-6 bg-[var(--card-bg)] border border-[var(--card-border)] hover:border-[var(--color-approved)] hover:shadow-md group">
          <div className="relative">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center shadow-lg bg-gradient-to-br from-purple-400 to-purple-600">
                <Fuel className="w-6 h-6 text-white" />
              </div>
              <span className="text-[var(--color-gray-500)] text-xs font-medium flex items-center gap-1">
                 Bulan Ini
              </span>
            </div>
            <p className="text-[var(--color-gray-500)] text-sm font-medium">Total BBM Digunakan</p>
            <p className="text-2xl lg:text-3xl font-bold mt-1 text-[var(--foreground)]">{formatNumber(stats?.totalFuelUsed || 0)} L</p>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Monthly Bookings - Line Chart */}
        <Card className="shadow-sm">
          <CardHeader className="border-b border-[var(--card-border)]">
            <div className="flex items-center gap-2">
                 <TrendingUp className="w-5 h-5 text-[var(--color-secondary)]" />
              <h3 className="font-semibold text-[var(--foreground)]">Tren Pemesanan</h3>
            </div>
          </CardHeader>
          <CardBody>
            <div style={{ height: '300px' }} className="w-full">
              <Line data={lineData} options={lineOptions} />
            </div>
          </CardBody>
        </Card>

        {/* Vehicle Usage by Location - Doughnut Chart */}
        <Card className="shadow-sm">
          <CardHeader className="border-b border-[var(--card-border)]">
            <div className="flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-sky-600 dark:text-sky-400" />
              <h3 className="font-semibold text-[var(--foreground)]">Sebaran Kendaraan</h3>
            </div>
          </CardHeader>
          <CardBody>
            <div style={{ height: '300px' }} className="w-full flex items-center justify-center">
              <Doughnut data={doughnutData} options={doughnutOptions} />
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Recent Bookings */}
      <Card className="shadow-sm overflow-hidden">
        <CardHeader className="border-b border-[var(--card-border)]">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-[var(--color-secondary)]" />
            <h3 className="font-semibold text-[var(--foreground)]">Pemesanan Terbaru</h3>
          </div>
        </CardHeader>
        <CardBody className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[var(--color-gray-100)] dark:bg-[var(--color-surface-elevated)]">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-[var(--color-gray-500)] uppercase tracking-wider">Kendaraan</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-[var(--color-gray-500)] uppercase tracking-wider">Driver</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-[var(--color-gray-500)] uppercase tracking-wider">Tanggal</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-[var(--color-gray-500)] uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--card-border)]">
                {recentBookings.map((booking) => (
                  <tr key={booking.id} className="hover:bg-[var(--color-gray-50)] dark:hover:bg-[var(--color-primary-light)]/20 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 rounded-lg flex items-center justify-center mr-3 shadow-sm" style={{ backgroundColor: '#F59E0B' }}>
                          <Car className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-[var(--foreground)]">{booking.vehicle?.modelName || '-'}</p>
                          <p className="text-xs text-[var(--color-gray-500)] font-mono">{booking.vehicle?.plateNumber || '-'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-[var(--foreground)] font-medium">{booking.driverName}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-[var(--color-gray-500)]">
                      {new Date(booking.startDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={clsx(
                        'inline-flex px-3 py-1 text-xs font-bold rounded-full border',
                                                booking.status === 0 && 'bg-[var(--color-pending)]/20 text-[var(--color-pending)]',
                        booking.status === 1 && 'bg-sky-500/20 text-sky-400',
                        booking.status === 2 && 'bg-[var(--color-approved)]/20 text-[var(--color-approved)]',
                        booking.status === -1 && 'bg-[var(--color-rejected)]/20 text-[var(--color-rejected)]',
                      )}>
                        {booking.status === 0 ? 'Menunggu' : booking.status === 1 ? 'Disetujui' : booking.status === 2 ? 'Selesai' : 'Ditolak'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardBody>
      </Card>
    </DashboardLayout>
  );
}