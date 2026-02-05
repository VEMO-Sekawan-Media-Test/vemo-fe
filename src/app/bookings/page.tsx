'use client';

import React, { useEffect, useState } from 'react';
import { Plus, Search } from 'lucide-react';
import { DashboardLayout } from '@/components/layout';
import { Card, CardBody, Button, Input, Select, Modal, DateTimePicker } from '@/components/ui';
import { bookingsAPI, vehiclesAPI, usersAPI } from '@/lib/api';
import type { Booking, Vehicle, User } from '@/types';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

export default function BookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [approvers, setApprovers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [formData, setFormData] = useState({
    vehicleId: '',
    driverName: '',
    approver1Id: '',
    approver2Id: '',
    startDate: '',
    endDate: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [bookingsData, vehiclesData, approversData] = await Promise.all([
        bookingsAPI.getAll(),
        bookingsAPI.getAll(), // Note: Double check if this intended to be vehiclesAPI
        usersAPI.getApprovers(),
      ]);
      // Correction: Assuming the second call was meant for vehicles if not already correct in your API logic
      const realVehiclesData = await vehiclesAPI.getAll(); 
      
      setBookings(bookingsData);
      setVehicles(realVehiclesData);
      setApprovers(approversData);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await bookingsAPI.create({
        vehicleId: parseInt(formData.vehicleId),
        driverName: formData.driverName,
        approver1Id: parseInt(formData.approver1Id),
        approver2Id: parseInt(formData.approver2Id),
        startDate: formData.startDate,
        endDate: formData.endDate,
      });
      setShowModal(false);
      setFormData({
        vehicleId: '',
        driverName: '',
        approver1Id: '',
        approver2Id: '',
        startDate: '',
        endDate: '',
      });
      // Refresh data
      const bookingsData = await bookingsAPI.getAll();
      setBookings(bookingsData);
    } catch (error) {
      console.error('Failed to create booking:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredBookings = bookings.filter((booking) => {
    const matchesSearch =
      booking.driverName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.vehicle?.modelName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.vehicle?.plateNumber.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'pending' && booking.status === 0) ||
      (statusFilter === 'approved' && booking.status === 2) ||
      (statusFilter === 'rejected' && booking.status === -1);
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: number) => {
    switch (status) {
      case 0:
        return <span className="px-2 py-1 text-xs font-medium rounded-full bg-amber-100 text-amber-800">Menunggu</span>;
      case 1:
        return <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">Disetujui Level 1</span>;
      case 2:
        return <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">Disetujui</span>;
      case -1:
        return <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800">Ditolak</span>;
      default:
        return <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800">Unknown</span>;
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="flex space-x-1">
            <div className="w-3 h-3 bg-[#F59E0B] rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
            <div className="w-3 h-3 bg-[#F59E0B] rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
            <div className="w-3 h-3 bg-[#F59E0B] rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      {/* Header Card with Filters and Button */}
      <Card className="mb-6">
        <CardBody>
          {/* Title Row */}
          <div className="mb-6">
            <h2 className="text-xl font-bold text-[var(--foreground)]">Daftar Pemesanan Kendaraan</h2>
          </div>

          {/* Action Row: Search + Filter + Button */}
          {/* items-end memastikan tombol sejajar dengan input field meskipun ada label */}
          <div className="flex flex-col md:flex-row gap-4 items-end">
            
            {/* Search Input (Flexible Width) */}
            <div className="flex-1 w-full">
              <Input
                label="Pencarian" 
                placeholder="Cari driver, kendaraan, atau plat..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    setSearchTerm(searchInput);
                  }
                }}
                icon={<Search className="w-4 h-4" />}
              />
            </div>

            {/* Status Filter (Fixed Width) */}
            <div className="w-full md:w-56 shrink-0">
              <Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                options={[
                  { value: 'all', label: 'Semua Status' },
                  { value: 'pending', label: 'Menunggu' },
                  { value: 'approved', label: 'Disetujui' },
                  { value: 'rejected', label: 'Ditolak' },
                ]}
                label="Status"
              />
            </div>

            {/* New Booking Button (Next to Status) */}
            <div className="w-full md:w-auto shrink-0">
              <Button 
                onClick={() => setShowModal(true)}
                className="w-full whitespace-nowrap"
              >
                <Plus className="w-4 h-4 mr-2" />
                Pemesanan Baru
              </Button>
            </div>

          </div>
        </CardBody>
      </Card>

      <div className="space-y-6">
        {/* Bookings Table */}
        <Card>
          <CardBody className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Kendaraan
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Driver
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tanggal Mulai
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tanggal Selesai
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredBookings.map((booking) => (
                    <tr key={booking.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{booking.vehicle?.modelName}</div>
                        <div className="text-sm text-gray-500">{booking.vehicle?.plateNumber}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{booking.driverName}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {format(new Date(booking.startDate), 'dd MMM yyyy HH:mm', { locale: id })}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {format(new Date(booking.endDate), 'dd MMM yyyy HH:mm', { locale: id })}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">{getStatusBadge(booking.status)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredBookings.length === 0 && (
                <div className="text-center py-8 text-gray-500">Tidak ada pemesanan ditemukan</div>
              )}
            </div>
          </CardBody>
        </Card>

        {/* Create Booking Modal */}
        <Modal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          title="Pemesanan Kendaraan Baru"
          size="lg"
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <Select
              label="Kendaraan"
              value={formData.vehicleId}
              onChange={(e) => setFormData({ ...formData, vehicleId: e.target.value })}
              options={vehicles.map((v) => ({ value: v.id.toString(), label: `${v.modelName} - ${v.plateNumber}` }))}
              required
            />
            <Input
              label="Nama Driver"
              value={formData.driverName}
              onChange={(e) => setFormData({ ...formData, driverName: e.target.value })}
              placeholder="Masukkan nama driver"
              required
            />
            <Select
              label="Approver Level 1"
              value={formData.approver1Id}
              onChange={(e) => setFormData({ ...formData, approver1Id: e.target.value })}
              options={approvers.map((a) => ({ value: a.id.toString(), label: a.name }))}
              required
            />
            <Select
              label="Approver Level 2"
              value={formData.approver2Id}
              onChange={(e) => setFormData({ ...formData, approver2Id: e.target.value })}
              options={approvers.map((a) => ({ value: a.id.toString(), label: a.name }))}
              required
            />
            <DateTimePicker
              label="Tanggal & Waktu Mulai"
              value={formData.startDate ? new Date(formData.startDate) : undefined}
              onChange={(date) => setFormData({ ...formData, startDate: date?.toISOString() || '' })}
            />
            <DateTimePicker
              label="Tanggal & Waktu Selesai"
              value={formData.endDate ? new Date(formData.endDate) : undefined}
              onChange={(date) => setFormData({ ...formData, endDate: date?.toISOString() || '' })}
            />
            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={() => setShowModal(false)}>
                Cancel
              </Button>
              <Button type="submit" isLoading={isSubmitting}>
                Create Booking
              </Button>
            </div>
          </form>
        </Modal>
      </div>
    </DashboardLayout>
  );
}