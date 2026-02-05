'use client';

import React, { useEffect, useState } from 'react';
import { Plus, Search } from 'lucide-react';
import { DashboardLayout } from '@/components/layout';
import { Card, CardBody, Button, Input, Select, Modal } from '@/components/ui';
import { maintenanceAPI, vehiclesAPI } from '@/lib/api';
import type { Maintenance, Vehicle } from '@/types';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

export default function MaintenancePage() {
  const [maintenances, setMaintenances] = useState<Maintenance[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [formData, setFormData] = useState({
    vehicleId: '',
    description: '',
    scheduledDate: '',
    estimatedCost: '',
    serviceType: '',
    notes: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [maintenancesData, vehiclesData] = await Promise.all([
        maintenanceAPI.getAll(),
        vehiclesAPI.getAll(),
      ]);
      setMaintenances(maintenancesData);
      setVehicles(vehiclesData);
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
      await maintenanceAPI.create({
        vehicleId: parseInt(formData.vehicleId),
        description: formData.description,
        scheduledDate: formData.scheduledDate,
        estimatedCost: parseFloat(formData.estimatedCost),
        serviceType: formData.serviceType,
        notes: formData.notes,
      });
      setShowModal(false);
      setFormData({
        vehicleId: '',
        description: '',
        scheduledDate: '',
        estimatedCost: '',
        serviceType: '',
        notes: '',
      });
      fetchData();
    } catch (error) {
      console.error('Failed to create maintenance:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredMaintenances = maintenances.filter((m) => {
    const matchesSearch =
      m.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.vehicle?.modelName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.vehicle?.plateNumber.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || m.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'SCHEDULED':
        return <span className="px-2 py-1 text-xs font-medium rounded-full bg-amber-100 text-amber-800">Dijadwalkan</span>;
      case 'IN_PROGRESS':
        return <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">Sedang Berlangsung</span>;
      case 'COMPLETED':
        return <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">Selesai</span>;
      case 'CANCELLED':
        return <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800">Dibatalkan</span>;
      default:
        return <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800">{status}</span>;
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
             <h2 className="text-xl font-bold text-[var(--foreground)]">Daftar Pemeliharaan Kendaraan</h2>
          </div>

          {/* Action Row: Search + Filter + Button */}
          <div className="flex flex-col md:flex-row gap-4 items-end">
            
            {/* Search Input (Flexible Width) */}
            <div className="flex-1 w-full">
              <Input
                label="Pencarian"
                placeholder="Cari pemeliharaan..."
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
                  { value: 'SCHEDULED', label: 'Dijadwalkan' },
                  { value: 'IN_PROGRESS', label: 'Sedang Berlangsung' },
                  { value: 'COMPLETED', label: 'Selesai' },
                  { value: 'CANCELLED', label: 'Dibatalkan' },
                ]}
                label="Status"
              />
            </div>

            {/* Button (Aligned Right Next to Status) */}
            <div className="w-full md:w-auto shrink-0">
              <Button 
                onClick={() => setShowModal(true)}
                className="w-full whitespace-nowrap"
              >
                <Plus className="w-4 h-4 mr-2" />
                Jadwal Baru
              </Button>
            </div>
            
          </div>
        </CardBody>
      </Card>

      <div className="space-y-6">
        {/* Maintenance Table */}
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
                      Deskripsi
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tanggal
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Estimasi Biaya
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredMaintenances.map((m) => (
                    <tr key={m.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{m.vehicle?.modelName}</div>
                        <div className="text-sm text-gray-500">{m.vehicle?.plateNumber}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{m.description}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {format(new Date(m.scheduledDate), 'dd MMM yyyy', { locale: id })}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">{getStatusBadge(m.status)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(m.estimatedCost)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredMaintenances.length === 0 && (
                <div className="text-center py-8 text-gray-500">Tidak ada data pemeliharaan ditemukan</div>
              )}
            </div>
          </CardBody>
        </Card>

        {/* Create Maintenance Modal */}
        <Modal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          title="Jadwal Pemeliharaan Baru"
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
              label="Deskripsi"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Masukkan deskripsi pemeliharaan"
              required
            />
            <Input
              label="Tipe Servis"
              value={formData.serviceType}
              onChange={(e) => setFormData({ ...formData, serviceType: e.target.value })}
              placeholder="Contoh: Service Berkala, Ganti Oli"
              required
            />
            <Input
              label="Estimasi Biaya (Rp)"
              type="number"
              value={formData.estimatedCost}
              onChange={(e) => setFormData({ ...formData, estimatedCost: e.target.value })}
              placeholder="Masukkan estimasi biaya"
              required
            />
            <Input
              label="Tanggal Jadwal"
              type="date"
              value={formData.scheduledDate}
              onChange={(e) => setFormData({ ...formData, scheduledDate: e.target.value })}
              required
            />
            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={() => setShowModal(false)}>
                Cancel
              </Button>
              <Button type="submit" isLoading={isSubmitting}>
                Create Schedule
              </Button>
            </div>
          </form>
        </Modal>
      </div>
    </DashboardLayout>
  );
}