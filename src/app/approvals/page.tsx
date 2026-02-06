'use client';

import React, { useEffect, useState } from 'react';
import { Check, X, Eye } from 'lucide-react';
import { DashboardLayout } from '@/components/layout';
import { Card, CardBody, Button, Modal, LoadingSpinner, useToast } from '@/components/ui';
import { bookingsAPI } from '@/lib/api';
import type { Booking } from '@/types';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { useAuth } from '@/context/AuthContext';

const ApprovalCard = ({ booking, isAdmin, onApprove, onReject, onView }: { booking: Booking; isAdmin: boolean; onApprove: (id: number) => void; onReject: (id: number) => void; onView: (b: Booking) => void }) => (
  <Card className="card-hover">
    <CardBody>
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h3 className="text-lg font-semibold text-gray-900">{booking.vehicle?.modelName}</h3>
            <span className="text-sm text-gray-500">({booking.vehicle?.plateNumber})</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
            <p><span className="text-gray-500">Driver:</span> <span className="font-medium">{booking.driverName}</span></p>
            <p><span className="text-gray-500">Jenis:</span> <span className="font-medium">{booking.vehicle?.type}</span></p>
            <p><span className="text-gray-500">Mulai:</span> <span className="font-medium">{format(new Date(booking.startDate), 'dd MMM yyyy HH:mm', { locale: id })}</span></p>
            <p><span className="text-gray-500">Selesai:</span> <span className="font-medium">{format(new Date(booking.endDate), 'dd MMM yyyy HH:mm', { locale: id })}</span></p>
            <p><span className="text-gray-500">Approver 1:</span> <span className="font-medium">{booking.approver1?.name}</span></p>
            <p><span className="text-gray-500">Approver 2:</span> <span className="font-medium">{booking.approver2?.name}</span></p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => onView(booking)}><Eye className="w-4 h-4 mr-1" />Detail</Button>
          {!isAdmin && (
            <>
              <Button variant="danger" size="sm" onClick={() => onReject(booking.id)}><X className="w-4 h-4 mr-1" />Tolak</Button>
              <Button variant="primary" size="sm" onClick={() => onApprove(booking.id)}><Check className="w-4 h-4 mr-1" />Setuju</Button>
            </>
          )}
        </div>
      </div>
    </CardBody>
  </Card>
);

const DetailModal = ({ isOpen, onClose, booking }: { isOpen: boolean; onClose: () => void; booking: Booking | null }) => {
  if (!booking) return null;
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Detail Pemesanan" size="lg">
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          {[
            { label: 'Kendaraan', value: `${booking.vehicle?.modelName} (${booking.vehicle?.plateNumber})` },
            { label: 'Driver', value: booking.driverName },
            { label: 'Tanggal Mulai', value: format(new Date(booking.startDate), 'dd MMMM yyyy HH:mm', { locale: id }) },
            { label: 'Tanggal Selesai', value: format(new Date(booking.endDate), 'dd MMMM yyyy HH:mm', { locale: id }) },
            { label: 'Jenis Kendaraan', value: booking.vehicle?.type || '-' },
            { label: 'Kepemilikan', value: booking.vehicle?.ownership || '-' },
            { label: 'Status', value: booking.status === 0 ? 'Menunggu Approver 1' : booking.status === 1 ? 'Menunggu Approver 2' : booking.status === 2 ? 'Disetujui' : 'Ditolak' },
            { label: 'Dibuat Oleh', value: booking.creator?.name || '-' },
            { label: 'Approver Level 1', value: booking.approver1?.name || '-' },
            { label: 'Approver Level 2', value: booking.approver2?.name || '-' },
          ].map(({ label, value }) => (
            <div key={label}><p className="text-sm text-gray-500">{label}</p><p className="font-medium">{value}</p></div>
          ))}
        </div>
        <div className="flex justify-end pt-4"><Button variant="outline" onClick={onClose}>Tutup</Button></div>
      </div>
    </Modal>
  );
};

export default function ApprovalsPage() {
  const [pendingBookings, setPendingBookings] = useState<Booking[]>([]);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { isAdmin } = useAuth();
  const { showSuccess, showError } = useToast();

  useEffect(() => { fetchPendingApprovals(); }, []);

  const fetchPendingApprovals = async () => {
    try {
      const data = isAdmin ? await bookingsAPI.getAllPendingApprovals() : await bookingsAPI.getPendingApprovals();
      setPendingBookings(data);
    } catch (error) { console.error('Failed to fetch pending approvals:', error); }
    finally { setIsLoading(false); }
  };

  const handleApprove = async (id: number) => {
    try {
      await bookingsAPI.approve(id);
      showSuccess('Pemesanan berhasil disetujui!');
      fetchPendingApprovals();
    } catch (error) {
      console.error('Failed to approve booking:', error);
      showError('Gagal menyetujui pemesanan. Silakan coba lagi.');
    }
  };

  const handleReject = async (id: number) => {
    try {
      await bookingsAPI.reject(id);
      showSuccess('Pemesanan berhasil ditolak!');
      fetchPendingApprovals();
    } catch (error) {
      console.error('Failed to reject booking:', error);
      showError('Gagal menolak pemesanan. Silakan coba lagi.');
    }
  };

  const viewDetails = (booking: Booking) => { setSelectedBooking(booking); setShowDetailModal(true); };

  if (isLoading) return <DashboardLayout><LoadingSpinner /></DashboardLayout>;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="bg-opacity-10 border border-gray-200 rounded-lg p-4">
          <p className="text-gray-500 font-medium">
            {isAdmin ? `${pendingBookings.length} pemesanan menunggu persetujuan (Semua)` : `${pendingBookings.length} pemesanan menunggu persetujuan Anda`}
          </p>
        </div>

        <div className="grid gap-4">
          {pendingBookings.length === 0 ? (
            <Card><CardBody className="text-center py-12"><p className="text-gray-500">Tidak ada persetujuan yang menunggu</p></CardBody></Card>
          ) : pendingBookings.map(booking => (
            <ApprovalCard key={booking.id} booking={booking} isAdmin={isAdmin} onApprove={handleApprove} onReject={handleReject} onView={viewDetails} />
          ))}
        </div>

        <DetailModal isOpen={showDetailModal} onClose={() => setShowDetailModal(false)} booking={selectedBooking} />
      </div>
    </DashboardLayout>
  );
}
