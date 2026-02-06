'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { Plus, Search } from 'lucide-react';
import { DashboardLayout } from '@/components/layout';
import { Card, CardBody, Button, Input, Select, Modal, DateTimePicker, LoadingSpinner, StatusBadge } from '@/components/ui';
import { bookingsAPI, vehiclesAPI, usersAPI } from '@/lib/api';
import type { Booking, Vehicle, User } from '@/types';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { BOOKING_INITIAL_FORM_DATA, BOOKING_STATUS_FILTERS } from '@/constants';

const BookingsTable = ({ bookings }: { bookings: Booking[] }) => (
  <table className="w-full">
    <thead className="bg-gray-50">
      <tr>
        {['Kendaraan', 'Driver', 'Tanggal Mulai', 'Tanggal Selesai', 'Status'].map(header => (
          <th key={header} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{header}</th>
        ))}
      </tr>
    </thead>
    <tbody className="divide-y divide-gray-200">
      {bookings.map(booking => (
        <tr key={booking.id} className="hover:bg-gray-50">
          <td className="px-6 py-4 whitespace-nowrap">
            <div className="text-sm font-medium text-gray-900">{booking.vehicle?.modelName}</div>
            <div className="text-sm text-gray-500">{booking.vehicle?.plateNumber}</div>
          </td>
          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{booking.driverName}</td>
          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{format(new Date(booking.startDate), 'dd MMM yyyy HH:mm', { locale: id })}</td>
          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{format(new Date(booking.endDate), 'dd MMM yyyy HH:mm', { locale: id })}</td>
          <td className="px-6 py-4 whitespace-nowrap"><StatusBadge status={booking.status} /></td>
        </tr>
      ))}
    </tbody>
  </table>
);

const BookingFormModal = ({ isOpen, onClose, onSubmit, isSubmitting, formData, setFormData, vehicles, approvers }: any) => (
  <Modal isOpen={isOpen} onClose={onClose} title="Pemesanan Kendaraan Baru" size="lg">
    <form onSubmit={onSubmit} className="space-y-4">
      <Select label="Kendaraan" value={formData.vehicleId} onChange={e => setFormData({ ...formData, vehicleId: e.target.value })} options={vehicles.map((v: Vehicle) => ({ value: v.id.toString(), label: `${v.modelName} - ${v.plateNumber}` }))} required />
      <Input label="Nama Driver" value={formData.driverName} onChange={e => setFormData({ ...formData, driverName: e.target.value })} placeholder="Masukkan nama driver" required />
      <Select label="Approver Level 1" value={formData.approver1Id} onChange={e => setFormData({ ...formData, approver1Id: e.target.value })} options={approvers.map((a: User) => ({ value: a.id.toString(), label: a.name }))} required />
      <Select label="Approver Level 2" value={formData.approver2Id} onChange={e => setFormData({ ...formData, approver2Id: e.target.value })} options={approvers.map((a: User) => ({ value: a.id.toString(), label: a.name }))} required />
      <DateTimePicker label="Tanggal & Waktu Mulai" value={formData.startDate ? new Date(formData.startDate) : undefined} onChange={date => setFormData({ ...formData, startDate: date?.toISOString() || '' })} />
      <DateTimePicker label="Tanggal & Waktu Selesai" value={formData.endDate ? new Date(formData.endDate) : undefined} onChange={date => setFormData({ ...formData, endDate: date?.toISOString() || '' })} />
      <div className="flex justify-end gap-3 pt-4">
        <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
        <Button type="submit" isLoading={isSubmitting}>Create Booking</Button>
      </div>
    </form>
  </Modal>
);

export default function BookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [approvers, setApprovers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [formData, setFormData] = useState(BOOKING_INITIAL_FORM_DATA);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const [bookingsData, vehiclesData, approversData] = await Promise.all([bookingsAPI.getAll(), vehiclesAPI.getAll(), usersAPI.getApprovers()]);
      setBookings(bookingsData);
      setVehicles(vehiclesData);
      setApprovers(approversData);
    } catch (error) { console.error('Failed to fetch data:', error); }
    finally { setIsLoading(false); }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await bookingsAPI.create({ vehicleId: parseInt(formData.vehicleId), driverName: formData.driverName, approver1Id: parseInt(formData.approver1Id), approver2Id: parseInt(formData.approver2Id), startDate: formData.startDate, endDate: formData.endDate });
      setShowModal(false);
      setFormData(BOOKING_INITIAL_FORM_DATA);
      const bookingsData = await bookingsAPI.getAll();
      setBookings(bookingsData);
    } catch (error) { console.error('Failed to create booking:', error); }
    finally { setIsSubmitting(false); }
  };

  const filteredBookings = useMemo(() => {
    return bookings.filter(booking => {
      const matchesSearch = booking.driverName.toLowerCase().includes(searchTerm.toLowerCase()) || booking.vehicle?.modelName.toLowerCase().includes(searchTerm.toLowerCase()) || booking.vehicle?.plateNumber.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || (statusFilter === 'pending' && booking.status === 0) || (statusFilter === 'approved' && booking.status === 2) || (statusFilter === 'rejected' && booking.status === -1);
      return matchesSearch && matchesStatus;
    });
  }, [bookings, searchTerm, statusFilter]);

  if (isLoading) return <DashboardLayout><LoadingSpinner /></DashboardLayout>;

  return (
    <DashboardLayout>
      <Card className="mb-6">
        <CardBody>
          <h2 className="text-xl font-bold text-[var(--foreground)] mb-6">Daftar Pemesanan Kendaraan</h2>
          <div className="flex flex-col md:flex-row gap-4 items-end">
            <div className="flex-1 w-full">
              <Input label="Pencarian" placeholder="Cari driver, kendaraan, atau plat..." value={searchInput} onChange={e => setSearchInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && setSearchTerm(searchInput)} icon={<Search className="w-4 h-4" />} />
            </div>
            <div className="w-full md:w-56 shrink-0">
              <Select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} options={BOOKING_STATUS_FILTERS} label="Status" />
            </div>
            <div className="w-full md:w-auto shrink-0">
              <Button onClick={() => setShowModal(true)} className="w-full whitespace-nowrap"><Plus className="w-4 h-4 mr-2" />Pemesanan Baru</Button>
            </div>
          </div>
        </CardBody>
      </Card>

      <div className="space-y-6">
        <Card>
          <CardBody className="p-0">
            <div className="overflow-x-auto">
              {filteredBookings.length > 0 ? <BookingsTable bookings={filteredBookings} /> : <div className="text-center py-8 text-gray-500">Tidak ada pemesanan ditemukan</div>}
            </div>
          </CardBody>
        </Card>

        <BookingFormModal isOpen={showModal} onClose={() => setShowModal(false)} onSubmit={handleSubmit} isSubmitting={isSubmitting} formData={formData} setFormData={setFormData} vehicles={vehicles} approvers={approvers} />
      </div>
    </DashboardLayout>
  );
}
