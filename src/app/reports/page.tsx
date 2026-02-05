'use client';

import React, { useEffect, useState } from 'react';
import { clsx } from 'clsx';
import { Download, Calendar as CalendarIcon, FileText, Filter, RefreshCw } from 'lucide-react';
import { DashboardLayout } from '@/components/layout';
import { Card, CardHeader, CardBody, Button, Input, DateRangePicker } from '@/components/ui';
import { bookingsAPI } from '@/lib/api';
import type { Booking } from '@/types';
import * as XLSX from 'xlsx';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

export default function ReportsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [filteredBookings, setFilteredBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false); // State untuk loading tombol refresh

  const [dateRange, setDateRange] = useState<{ start: Date | null; end: Date | null }>({
    start: null,
    end: null,
  });
  const [statusFilter, setStatusFilter] = useState<string>('all');
  
  // State 1: Untuk menampung apa yang diketik user di text box
  const [searchInput, setSearchInput] = useState('');
  // State 2: Untuk menampung kata kunci yang "dikunci" setelah tekan Enter
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  // Filter hanya berjalan ketika 'searchTerm' berubah (setelah Enter), bukan saat mengetik
  useEffect(() => {
    applyFilters();
  }, [bookings, dateRange, statusFilter, searchTerm]);

  const fetchData = async () => {
    try {
      const bookingsData = await bookingsAPI.getAll();
      setBookings(bookingsData);
      // Jangan setFilteredBookings di sini secara manual jika useEffect sudah menangani filter,
      // tapi untuk inisialisasi awal ok. Nanti useEffect akan menimpa ini.
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchData();
    setIsRefreshing(false);
  };

  const applyFilters = () => {
    let result = [...bookings];

    // Date filter
    if (dateRange.start) {
      result = result.filter((b) => new Date(b.startDate) >= dateRange.start!);
    }
    if (dateRange.end) {
      result = result.filter((b) => new Date(b.startDate) <= dateRange.end!);
    }

    // Status filter
    if (statusFilter !== 'all') {
      const statusNum = parseInt(statusFilter);
      result = result.filter((b) => b.status === statusNum);
    }

    // Search filter (Menggunakan searchTerm yang sudah di-Enter)
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        (b) =>
          b.vehicle?.modelName?.toLowerCase().includes(term) ||
          b.vehicle?.plateNumber?.toLowerCase().includes(term) ||
          b.driverName?.toLowerCase().includes(term)
      );
    }

    setFilteredBookings(result);
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      setSearchTerm(searchInput); // Pindahkan text dari input ke logic filter
    }
  };

  const exportToExcel = () => {
    const data = filteredBookings.map((b) => ({
      ID: b.id,
      Kendaraan: b.vehicle?.modelName || '-',
      'Plat Nomor': b.vehicle?.plateNumber || '-',
      'Jenis Kendaraan': b.vehicle?.type || '-',
      'Nama Driver': b.driverName,
      'Tanggal Mulai': format(new Date(b.startDate), 'dd/MM/yyyy HH:mm'),
      'Tanggal Selesai': format(new Date(b.endDate), 'dd/MM/yyyy HH:mm'),
      Status:
        b.status === 0
          ? 'Menunggu'
          : b.status === 1
          ? 'Disetujui Level 1'
          : b.status === 2
          ? 'Disetujui'
          : 'Ditolak',
      'BBM Awal (L)': b.fuelStart || '-',
      'BBM akhir (L)': b.fuelEnd || '-',
      'Jarak Tempuh (km)': b.distanceKm || '-',
      'BBM Digunakan (L)': b.fuelUsed || '-',
      'Tanggal Dibuat': format(new Date(b.createdAt), 'dd/MM/yyyy HH:mm'),
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Laporan Pemesanan');
    XLSX.writeFile(wb, `laporan_pemesanan_${format(new Date(), 'yyyyMMdd_HHmmss')}.xlsx`);
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <div className="flex space-x-2">
            <div className="w-4 h-4 bg-[#F59E0B] rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
            <div className="w-4 h-4 bg-[#F59E0B] rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
            <div className="w-4 h-4 bg-[#F59E0B] rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      {/* Header Card with Buttons and Filters */}
      <Card className="mb-6">
        <CardBody>
          <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
                <Filter className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-[var(--foreground)]">Filter Data</h3>
                <p className="text-sm text-[var(--color-gray-500)]">Filter dan cari data pemesanan kendaraan</p>
              </div>
            </div>
            <div className="flex gap-2 w-full md:w-auto">
              <Button 
                variant="outline" 
                onClick={handleRefresh} 
                className="flex-1 md:flex-none"
                disabled={isRefreshing}
              >
                <RefreshCw className={clsx("w-4 h-4 mr-2", isRefreshing && "animate-spin")} />
                {isRefreshing ? 'Refreshing...' : 'Refresh'}
              </Button>
              <Button onClick={exportToExcel} className="bg-emerald-600 hover:bg-emerald-700 text-white flex-1 md:flex-none">
                <Download className="w-4 h-4 mr-2" />
                Export Excel
              </Button>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Input Pencarian Diperbaiki */}
            <Input
              label="Pencarian"
              placeholder="Ketik & tekan Enter..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={handleSearchKeyDown} // Trigger Enter di sini
            />
            
            <div className="rounded-lg">
                <DateRangePicker
                  className="w-full"
                  value={dateRange.start ? { start: dateRange.start, end: dateRange.end || undefined } : undefined}
                  onChange={(range) => {
                    if (range) {
                      setDateRange({ start: range.start || null, end: range.end || null });
                    } else {
                      setDateRange({ start: null, end: null });
                    }
                  }}
                />
              </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-[var(--color-gray-700)]">Status</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className={clsx(
                  'w-full px-3 py-2 border rounded-lg transition-colors',
                  'bg-[var(--card-bg)] text-[var(--foreground)]',
                  'border-[var(--card-border)]',
                  'focus:outline-none focus:ring-2 focus:ring-amber-500'
                )}
              >
                <option value="all">Semua Status</option>
                <option value="0">Menunggu</option>
                <option value="1">Level 1</option>
                <option value="2">Disetujui</option>
                <option value="-1">Ditolak</option>
              </select>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="rounded-2xl transition-all duration-300 p-6 bg-[var(--card-bg)] border border-[var(--card-border)]">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: '#334155' }}>
              <FileText className="w-5 h-5 text-slate-300" />
            </div>
          </div>
          <p className="text-2xl font-bold text-[var(--foreground)]">{filteredBookings.length}</p>
          <p className="text-sm text-[var(--color-gray-500)]">Total Data</p>
        </div>
        <div className="rounded-2xl p-6 border" style={{ backgroundColor: '#F59E0B', borderColor: '#D97706' }}>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
              <CalendarIcon className="w-5 h-5 text-white" />
            </div>
          </div>
          <p className="text-2xl font-bold text-white">{filteredBookings.filter((b) => b.status === 0).length}</p>
          <p className="text-sm text-amber-100">Menunggu</p>
        </div>
        <div className="rounded-2xl p-6 border" style={{ backgroundColor: '#10B981', borderColor: '#059669' }}>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
              <CalendarIcon className="w-5 h-5 text-white" />
            </div>
          </div>
          <p className="text-2xl font-bold text-white">{filteredBookings.filter((b) => b.status === 2).length}</p>
          <p className="text-sm text-emerald-100">Disetujui</p>
        </div>
        <div className="rounded-2xl p-6 border" style={{ backgroundColor: '#F43F5E', borderColor: '#E11D48' }}>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
              <CalendarIcon className="w-5 h-5 text-white" />
            </div>
          </div>
          <p className="text-2xl font-bold text-white">{filteredBookings.filter((b) => b.status === -1).length}</p>
          <p className="text-sm text-rose-100">Ditolak</p>
        </div>
      </div>

      {/* Data Table */}
      <Card>
        <CardBody>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-500 to-cyan-600 flex items-center justify-center">
              <FileText className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-[var(--foreground)]">Data Pemesanan</h3>
              <p className="text-sm text-[var(--color-gray-500)]">Daftar lengkap pemesanan kendaraan</p>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[var(--color-gray-100)]">
                <tr className="border-b border-[var(--card-border)]">
                  <th className="text-left py-3 px-4 text-xs font-medium text-[var(--color-gray-600)] uppercase tracking-wider">ID</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-[var(--color-gray-600)] uppercase tracking-wider">Kendaraan</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-[var(--color-gray-600)] uppercase tracking-wider">Driver</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-[var(--color-gray-600)] uppercase tracking-wider">Tanggal Mulai</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-[var(--color-gray-600)] uppercase tracking-wider">Tanggal Selesai</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-[var(--color-gray-600)] uppercase tracking-wider">Status</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-[var(--color-gray-600)] uppercase tracking-wider">BBM Digunakan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--card-border)]">
                {filteredBookings.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-[var(--color-gray-500)]">
                      Tidak ada data yang sesuai dengan filter
                    </td>
                  </tr>
                ) : (
                  filteredBookings.map((booking) => (
                    <tr key={booking.id} className="hover:bg-[var(--color-gray-50)] transition-colors">
                      <td className="py-4 px-4 whitespace-nowrap text-sm font-medium text-[var(--foreground)]">#{booking.id}</td>
                      <td className="py-4 px-4 whitespace-nowrap">
                        <div>
                          <p className="text-sm font-medium text-[var(--foreground)]">{booking.vehicle?.modelName || 'N/A'}</p>
                          <p className="text-xs text-[var(--color-gray-500)]">{booking.vehicle?.plateNumber || '-'}</p>
                        </div>
                      </td>
                      <td className="py-4 px-4 whitespace-nowrap text-sm text-[var(--foreground)]">{booking.driverName}</td>
                      <td className="py-4 px-4 whitespace-nowrap text-sm text-[var(--color-gray-500)]">
                        {format(new Date(booking.startDate), 'dd MMM yyyy', { locale: id })}
                      </td>
                      <td className="py-4 px-4 whitespace-nowrap text-sm text-slate-400">
                        {format(new Date(booking.endDate), 'dd MMM yyyy', { locale: id })}
                      </td>
                      <td className="py-4 px-4 whitespace-nowrap">
                        <span className={`inline-flex px-3 py-1 text-xs font-medium rounded-full ${
                          booking.status === 2
                            ? 'bg-emerald-500/20 text-emerald-400'
                            : booking.status === -1
                            ? 'bg-rose-500/20 text-rose-400'
                            : booking.status === 1
                            ? 'bg-sky-500/20 text-sky-400'
                            : 'bg-amber-500/20 text-amber-400'
                        }`}>
                          {booking.status === 0 ? 'Menunggu' : booking.status === 1 ? 'Level 1' : booking.status === 2 ? 'Disetujui' : 'Ditolak'}
                        </span>
                      </td>
                      <td className="py-4 px-4 whitespace-nowrap text-sm text-slate-400">
                        {booking.fuelUsed ? `${booking.fuelUsed.toFixed(2)} L` : '-'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardBody>
      </Card>
    </DashboardLayout>
  );
}