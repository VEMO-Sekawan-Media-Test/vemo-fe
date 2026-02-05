'use client';

import React, { useEffect, useState } from 'react';
import { Check, X, Eye } from 'lucide-react';
import { DashboardLayout } from '@/components/layout';
import { Card, CardHeader, CardBody, Button, Modal } from '@/components/ui';
import { bookingsAPI } from '@/lib/api';
import type { Booking } from '@/types';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { useAuth } from '@/context/AuthContext';

export default function ApprovalsPage() {
  const [pendingBookings, setPendingBookings] = useState<Booking[]>([]);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { user, isAdmin } = useAuth();

  useEffect(() => {
    fetchPendingApprovals();
  }, []);

  const fetchPendingApprovals = async () => {
    try {
      let data;
      if (isAdmin) {
        // Admin sees all pending bookings
        data = await bookingsAPI.getAllPendingApprovals();
      } else {
        // Regular approver sees only their assigned approvals
        data = await bookingsAPI.getPendingApprovals();
      }
      setPendingBookings(data);
    } catch (error) {
      console.error('Failed to fetch pending approvals:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprove = async (id: number) => {
    try {
      await bookingsAPI.approve(id);
      fetchPendingApprovals();
    } catch (error) {
      console.error('Failed to approve booking:', error);
    }
  };

  const handleReject = async (id: number) => {
    try {
      await bookingsAPI.reject(id);
      fetchPendingApprovals();
    } catch (error) {
      console.error('Failed to reject booking:', error);
    }
  };

  const viewDetails = (booking: Booking) => {
    setSelectedBooking(booking);
    setShowDetailModal(true);
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
      <div className="space-y-6">
        {/* Pending Approvals Count - Amber/Gold theme */}
        <div className="bg-opacity-10 border border-gray-200 rounded-lg p-4">
          <p className="text-gray-500 font-medium">
            {isAdmin 
              ? `${pendingBookings.length} pemesanan menunggu persetujuan (Semua)`
              : `${pendingBookings.length} pemesanan menunggu persetujuan Anda`
            }
          </p>
        </div>

        {/* Approvals List */}
        <div className="grid gap-4">
          {pendingBookings.length === 0 ? (
            <Card>
              <CardBody className="text-center py-12">
                <p className="text-gray-500">Tidak ada persetujuan yang menunggu</p>
              </CardBody>
            </Card>
          ) : (
            pendingBookings.map((booking) => (
              <Card key={booking.id} className="card-hover">
                <CardBody>
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {booking.vehicle?.modelName}
                        </h3>
                        <span className="text-sm text-gray-500">({booking.vehicle?.plateNumber})</span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                        <p>
                          <span className="text-gray-500">Driver:</span>{' '}
                          <span className="font-medium">{booking.driverName}</span>
                        </p>
                        <p>
                          <span className="text-gray-500">Jenis:</span>{' '}
                          <span className="font-medium">{booking.vehicle?.type}</span>
                        </p>
                        <p>
                          <span className="text-gray-500">Mulai:</span>{' '}
                          <span className="font-medium">
                            {format(new Date(booking.startDate), 'dd MMM yyyy HH:mm', { locale: id })}
                          </span>
                        </p>
                        <p>
                          <span className="text-gray-500">Selesai:</span>{' '}
                          <span className="font-medium">
                            {format(new Date(booking.endDate), 'dd MMM yyyy HH:mm', { locale: id })}
                          </span>
                        </p>
                        <p>
                          <span className="text-gray-500">Approver 1:</span>{' '}
                          <span className="font-medium">{booking.approver1?.name}</span>
                        </p>
                        <p>
                          <span className="text-gray-500">Approver 2:</span>{' '}
                          <span className="font-medium">{booking.approver2?.name}</span>
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" onClick={() => viewDetails(booking)}>
                        <Eye className="w-4 h-4 mr-1" />
                        Detail
                      </Button>
                      {!isAdmin && (
                        <>
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() => handleReject(booking.id)}
                          >
                            <X className="w-4 h-4 mr-1" />
                            Tolak
                          </Button>
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => handleApprove(booking.id)}
                          >
                            <Check className="w-4 h-4 mr-1" />
                            Setuju
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </CardBody>
              </Card>
            ))
          )}
        </div>

        {/* Detail Modal */}
        <Modal
          isOpen={showDetailModal}
          onClose={() => setShowDetailModal(false)}
          title="Detail Pemesanan"
          size="lg"
        >
          {selectedBooking && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Kendaraan</p>
                  <p className="font-medium">{selectedBooking.vehicle?.modelName}</p>
                  <p className="text-sm text-gray-600">{selectedBooking.vehicle?.plateNumber}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Driver</p>
                  <p className="font-medium">{selectedBooking.driverName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Tanggal Mulai</p>
                  <p className="font-medium">
                    {format(new Date(selectedBooking.startDate), 'dd MMMM yyyy HH:mm', { locale: id })}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Tanggal Selesai</p>
                  <p className="font-medium">
                    {format(new Date(selectedBooking.endDate), 'dd MMMM yyyy HH:mm', { locale: id })}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Jenis Kendaraan</p>
                  <p className="font-medium">{selectedBooking.vehicle?.type}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Kepemilikan</p>
                  <p className="font-medium">{selectedBooking.vehicle?.ownership}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Status</p>
                  <p className="font-medium">
                    {selectedBooking.status === 0 ? 'Menunggu Approver 1' : 
                     selectedBooking.status === 1 ? 'Menunggu Approver 2' :
                     selectedBooking.status === 2 ? 'Disetujui' :
                     'Ditolak'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Dibuat Oleh</p>
                  <p className="font-medium">{selectedBooking.creator?.name || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Approver Level 1</p>
                  <p className="font-medium">{selectedBooking.approver1?.name || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Approver Level 2</p>
                  <p className="font-medium">{selectedBooking.approver2?.name || '-'}</p>
                </div>
              </div>
              <div className="flex justify-end pt-4">
                <Button variant="outline" onClick={() => setShowDetailModal(false)}>
                  Tutup
                </Button>
              </div>
            </div>
          )}
        </Modal>
      </div>
    </DashboardLayout>
  );
}
