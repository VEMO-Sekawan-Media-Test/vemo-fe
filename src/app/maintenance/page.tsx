'use client';

import React, { useEffect, useState, useMemo, useRef } from 'react';
import { Plus, Search, ChevronDown } from 'lucide-react';
import { DashboardLayout } from '@/components/layout';
import { Card, CardBody, Button, Input, Select, Modal, LoadingSpinner, useToast } from '@/components/ui';
import { maintenanceAPI, vehiclesAPI } from '@/lib/api';
import type { Maintenance, Vehicle } from '@/types';
import { useAuth } from '@/context/AuthContext';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { MAINTENANCE_INITIAL_FORM_DATA, MAINTENANCE_STATUS_FILTERS } from '@/constants';

type MaintenanceStatus = 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';

const STATUS_CONFIG: Record<string, { class: string; label: string }> = {
  SCHEDULED: { class: 'bg-amber-100 text-amber-800', label: 'Dijadwalkan' },
  IN_PROGRESS: { class: 'bg-blue-100 text-blue-800', label: 'Sedang Berlangsung' },
  COMPLETED: { class: 'bg-green-100 text-green-800', label: 'Selesai' },
  CANCELLED: { class: 'bg-red-100 text-red-800', label: 'Dibatalkan' },
};

const STATUS_OPTIONS = [
  { value: 'SCHEDULED', label: 'Dijadwalkan' },
  { value: 'IN_PROGRESS', label: 'Sedang Berlangsung' },
  { value: 'COMPLETED', label: 'Selesai' },
  { value: 'CANCELLED', label: 'Dibatalkan' },
];

const StatusBadge = ({ status }: { status: string }) => {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.SCHEDULED;
  return <span className={`px-2 py-1 text-xs font-medium rounded-full ${config.class}`}>{config.label}</span>;
};

const ClickableStatusBadge = ({ 
  status, 
  onChange,
  isAdmin 
}: { 
  status: string; 
  onChange: (newStatus: MaintenanceStatus) => void;
  isAdmin: boolean;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.SCHEDULED;

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!isAdmin) {
    return <StatusBadge status={status} />;
  }

  return (
    <div className="relative inline-block" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full ${config.class} hover:opacity-80 transition-opacity cursor-pointer`}
      >
        {config.label}
        <ChevronDown className="w-3 h-3" />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-200 py-1 z-[100] flex flex-col min-w-[180px]">
          {STATUS_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => {
                onChange(opt.value as MaintenanceStatus);
                setIsOpen(false);
              }}
              className={`w-full text-left px-4 py-2.5 text-sm transition-colors hover:bg-gray-50 cursor-pointer
                ${status === opt.value ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-700'}
              `}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

const MaintenanceTable = ({ 
  maintenances, 
  isAdmin, 
  onStatusChange 
}: { 
  maintenances: Maintenance[]; 
  isAdmin: boolean;
  onStatusChange: (id: number, status: MaintenanceStatus) => void;
}) => (
  <table className="w-full">
    <thead className="bg-gray-50">
      <tr>
        {['Kendaraan', 'Deskripsi', 'Tanggal', 'Status', 'Estimasi Biaya'].map(header => (
          <th key={header} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{header}</th>
        ))}
      </tr>
    </thead>
    <tbody className="divide-y divide-gray-200">
      {maintenances.map(m => (
        <tr key={m.id} className="hover:bg-gray-50 transition-colors">
          <td className="px-6 py-4 whitespace-nowrap">
            <div className="text-sm font-medium text-gray-900">{m.vehicle?.modelName}</div>
            <div className="text-sm text-gray-500">{m.vehicle?.plateNumber}</div>
          </td>
          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{m.description}</td>
          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
            {format(new Date(m.scheduledDate), 'dd MMM yyyy', { locale: id })}
          </td>
          <td className="px-6 py-4 whitespace-nowrap">
            <ClickableStatusBadge 
              status={m.status} 
              onChange={(status) => onStatusChange(m.id, status)} 
              isAdmin={isAdmin} 
            />
          </td>
          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
            {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(m.estimatedCost)}
          </td>
        </tr>
      ))}
    </tbody>
  </table>
);

const MaintenanceFormModal = ({ isOpen, onClose, onSubmit, isSubmitting, formData, setFormData, vehicles }: any) => (
  <Modal isOpen={isOpen} onClose={onClose} title="Jadwal Pemeliharaan Baru" size="lg">
    <form onSubmit={onSubmit} className="space-y-4">
      <Select 
        label="Kendaraan" 
        value={formData.vehicleId} 
        onChange={e => setFormData({ ...formData, vehicleId: e.target.value })} 
        options={vehicles.map((v: Vehicle) => ({ value: v.id.toString(), label: `${v.modelName} - ${v.plateNumber}` }))} 
        required 
      />
      <Input 
        label="Deskripsi" 
        value={formData.description} 
        onChange={e => setFormData({ ...formData, description: e.target.value })} 
        placeholder="Masukkan deskripsi pemeliharaan" 
        required 
      />
      <Input 
        label="Tipe Servis" 
        value={formData.serviceType} 
        onChange={e => setFormData({ ...formData, serviceType: e.target.value })} 
        placeholder="Contoh: Service Berkala, Ganti Oli" 
        required 
      />
      <Input 
        label="Estimasi Biaya (Rp)" 
        type="number" 
        value={formData.estimatedCost} 
        onChange={e => setFormData({ ...formData, estimatedCost: e.target.value })} 
        placeholder="Masukkan estimasi biaya" 
        required 
      />
      <Input 
        label="Tanggal Jadwal" 
        type="date" 
        value={formData.scheduledDate} 
        onChange={e => setFormData({ ...formData, scheduledDate: e.target.value })} 
        required 
      />
      <div className="flex justify-end gap-3 pt-4">
        <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
        <Button type="submit" isLoading={isSubmitting}>Create Schedule</Button>
      </div>
    </form>
  </Modal>
);

export default function MaintenancePage() {
  const { user } = useAuth();
  const { showSuccess, showError } = useToast();
  const isAdmin = user?.role === 'ADMIN';
  const [maintenances, setMaintenances] = useState<Maintenance[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [formData, setFormData] = useState(MAINTENANCE_INITIAL_FORM_DATA);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const [maintenancesData, vehiclesData] = await Promise.all([maintenanceAPI.getAll(), vehiclesAPI.getAll()]);
      setMaintenances(maintenancesData);
      setVehicles(vehiclesData);
    } catch (error) { console.error('Failed to fetch data:', error); }
    finally { setIsLoading(false); }
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
        notes: formData.notes 
      });
      setShowModal(false);
      setFormData(MAINTENANCE_INITIAL_FORM_DATA);
      fetchData();
    } catch (error) { console.error('Failed to create maintenance:', error); }
    finally { setIsSubmitting(false); }
  };

  const handleStatusChange = async (id: number, status: MaintenanceStatus) => {
    try {
      await maintenanceAPI.updateStatus(id, status);
      showSuccess(`Status berhasil diubah menjadi ${STATUS_CONFIG[status].label}`);
      fetchData();
    } catch (error) {
      showError('Gagal mengubah status pemeliharaan');
      console.error('Failed to update status:', error);
    }
  };

  const filteredMaintenances = useMemo(() => {
    return maintenances.filter(m => {
      const matchesSearch = m.description.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          m.vehicle?.modelName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          m.vehicle?.plateNumber.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || m.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [maintenances, searchTerm, statusFilter]);

  if (isLoading) return <DashboardLayout><LoadingSpinner /></DashboardLayout>;

  return (
    <DashboardLayout>
      <Card className="mb-6">
        <CardBody>
          <h2 className="text-xl font-bold text-[var(--foreground)] mb-6">Daftar Pemeliharaan Kendaraan</h2>
          <div className="flex flex-col md:flex-row gap-4 items-end">
            <div className="flex-1 w-full">
              <Input 
                label="Pencarian" 
                placeholder="Cari pemeliharaan..." 
                value={searchInput} 
                onChange={e => setSearchInput(e.target.value)} 
                onKeyDown={e => e.key === 'Enter' && setSearchTerm(searchInput)} 
                icon={<Search className="w-4 h-4" />} 
              />
            </div>
            <div className="w-full md:w-56 shrink-0">
              <Select 
                value={statusFilter} 
                onChange={e => setStatusFilter(e.target.value)} 
                options={MAINTENANCE_STATUS_FILTERS} 
                label="Status" 
              />
            </div>
            <div className="w-full md:w-auto shrink-0">
              <Button onClick={() => setShowModal(true)} className="w-full whitespace-nowrap">
                <Plus className="w-4 h-4 mr-2" />Jadwal Baru
              </Button>
            </div>
          </div>
        </CardBody>
      </Card>

      <div className="space-y-6">
        <Card>
          <CardBody className="p-0">
            <div className="overflow-x-auto min-h-[300px]"> 
              {filteredMaintenances.length > 0 ? 
                <MaintenanceTable maintenances={filteredMaintenances} isAdmin={isAdmin} onStatusChange={handleStatusChange} /> : 
                <div className="text-center py-8 text-gray-500">Tidak ada data pemeliharaan ditemukan</div>
              }
            </div>
          </CardBody>
        </Card>

        <MaintenanceFormModal 
          isOpen={showModal} 
          onClose={() => setShowModal(false)} 
          onSubmit={handleSubmit} 
          isSubmitting={isSubmitting} 
          formData={formData} 
          setFormData={setFormData} 
          vehicles={vehicles} 
        />
      </div>
    </DashboardLayout>
  );
}