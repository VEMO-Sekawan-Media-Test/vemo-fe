'use client';

import React, { useEffect, useState } from 'react';
import { Plus, Search } from 'lucide-react';
import { DashboardLayout } from '@/components/layout';
import { Card, CardBody, Button, Input, Select, Modal, ConfirmModal, useToast, LoadingSpinner } from '@/components/ui';
import { vehiclesAPI } from '@/lib/api';
import type { Vehicle } from '@/types';
import { VEHICLE_LOCATION_OPTIONS, VEHICLE_TYPE_OPTIONS, VEHICLE_OWNERSHIP_OPTIONS, VEHICLE_INITIAL_FORM_DATA } from '@/constants';

type FormDataType = typeof VEHICLE_INITIAL_FORM_DATA;

const VehicleCard = ({ vehicle, onEdit, onDelete }: { vehicle: Vehicle; onEdit: (v: Vehicle) => void; onDelete: (id: number) => void }) => (
  <Card className="card-hover">
    <CardBody>
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="font-semibold text-gray-900">{vehicle.modelName}</h3>
          <p className="text-sm text-gray-500">{vehicle.plateNumber}</p>
        </div>
        <span className={`px-2 py-1 text-xs font-medium rounded-full ${vehicle.ownership === 'Company' ? 'bg-[#10B981] text-white' : 'bg-[#F59E0B] text-white'}`}>
          {vehicle.ownership}
        </span>
      </div>
      <div className="space-y-2 text-sm">
        <div className="flex justify-between"><span className="text-gray-500">Type</span><span className="font-medium">{vehicle.type}</span></div>
        <div className="flex justify-between"><span className="text-gray-500">Location</span><span className="font-medium">{vehicle.location}</span></div>
        <div className="flex justify-between"><span className="text-gray-500">Fuel Consumption</span><span className="font-medium">{vehicle.fuelConsumption} L/km</span></div>
        <div className="flex justify-between"><span className="text-gray-500">Current Fuel</span><span className="font-medium">{vehicle.currentFuel}%</span></div>
      </div>
      <div className="mt-4 pt-4 border-t border-gray-200 flex gap-2">
        <Button variant="outline" size="sm" className="flex-1" onClick={() => onEdit(vehicle)}>Ubah</Button>
        <Button variant="danger" size="sm" className="flex-1" onClick={() => onDelete(vehicle.id)}>Hapus</Button>
      </div>
    </CardBody>
  </Card>
);

const VehicleFormModal = ({ isOpen, onClose, onSubmit, isSubmitting, editingVehicle, formData, setFormData }: any) => (
  <Modal isOpen={isOpen} onClose={onClose} title={editingVehicle ? 'Edit Vehicle' : 'Add New Vehicle'} size="lg">
    <form onSubmit={onSubmit} className="space-y-4">
      <Input label="Model Name" value={formData.modelName} onChange={e => setFormData({ ...formData, modelName: e.target.value })} placeholder="e.g., Toyota Avanza" required />
      <Input label="Plate Number" value={formData.plateNumber} onChange={e => setFormData({ ...formData, plateNumber: e.target.value })} placeholder="e.g., B 1234 ABC" required />
      <Select label="Type" value={formData.type} onChange={e => setFormData({ ...formData, type: e.target.value })} options={VEHICLE_TYPE_OPTIONS} required />
      <Select label="Ownership" value={formData.ownership} onChange={e => setFormData({ ...formData, ownership: e.target.value })} options={VEHICLE_OWNERSHIP_OPTIONS} required />
      <Select label="Location" value={formData.location} onChange={e => setFormData({ ...formData, location: e.target.value })} options={VEHICLE_LOCATION_OPTIONS} required />
      <Input label="Fuel Consumption (L/km)" type="number" step="0.01" value={formData.fuelConsumption} onChange={e => setFormData({ ...formData, fuelConsumption: e.target.value })} placeholder="e.g., 0.1" required />
      <div className="flex justify-end gap-3 pt-4">
        <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
        <Button type="submit" isLoading={isSubmitting}>{editingVehicle ? 'Update' : 'Create'}</Button>
      </div>
    </form>
  </Modal>
);

export default function VehiclesPage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [formData, setFormData] = useState<FormDataType>(VEHICLE_INITIAL_FORM_DATA);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingVehicleId, setDeletingVehicleId] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const { showSuccess, showError } = useToast();

  useEffect(() => { fetchVehicles(); }, []);

  const fetchVehicles = async () => {
    try {
      const data = await vehiclesAPI.getAll();
      setVehicles(data);
    } catch (error) { console.error('Failed to fetch vehicles:', error); }
    finally { setIsLoading(false); }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const vehicleData = {
        modelName: formData.modelName,
        plateNumber: formData.plateNumber,
        type: formData.type as 'Personnel' | 'Freight',
        ownership: formData.ownership as 'Company' | 'Rental',
        location: formData.location,
        fuelConsumption: parseFloat(formData.fuelConsumption),
      };
      editingVehicle ? await vehiclesAPI.update(editingVehicle.id, vehicleData) : await vehiclesAPI.create(vehicleData);
      setShowModal(false);
      setFormData(VEHICLE_INITIAL_FORM_DATA);
      setEditingVehicle(null);
      fetchVehicles();
      showSuccess(editingVehicle ? 'Kendaraan berhasil diperbarui!' : 'Kendaraan berhasil ditambahkan!');
    } catch (error) { console.error('Failed to save vehicle:', error); showError('Gagal menyimpan kendaraan. Silakan coba lagi.'); }
    finally { setIsSubmitting(false); }
  };

  const handleEdit = (vehicle: Vehicle) => {
    setEditingVehicle(vehicle);
    setFormData({ modelName: vehicle.modelName, plateNumber: vehicle.plateNumber, type: vehicle.type, ownership: vehicle.ownership, location: vehicle.location, fuelConsumption: vehicle.fuelConsumption.toString() });
    setShowModal(true);
  };

  const handleDelete = (id: number) => { setDeletingVehicleId(id); setShowDeleteModal(true); };

  const confirmDelete = async () => {
    if (deletingVehicleId === null) return;
    setIsDeleting(true);
    try {
      await vehiclesAPI.delete(deletingVehicleId);
      fetchVehicles();
      showSuccess('Kendaraan berhasil dihapus!');
    } catch (error) { console.error('Failed to delete vehicle:', error); showError('Gagal menghapus kendaraan. Silakan coba lagi.'); }
    finally { setIsDeleting(false); setShowDeleteModal(false); setDeletingVehicleId(null); }
  };

  const filteredVehicles = vehicles.filter(v => v.modelName.toLowerCase().includes(searchTerm.toLowerCase()) || v.plateNumber.toLowerCase().includes(searchTerm.toLowerCase()) || v.location.toLowerCase().includes(searchTerm.toLowerCase()));

  const resetModal = () => { setShowModal(false); setEditingVehicle(null); setFormData(VEHICLE_INITIAL_FORM_DATA); };

  if (isLoading) return <DashboardLayout><LoadingSpinner /></DashboardLayout>;

  return (
    <DashboardLayout>
      <Card className="mb-6">
        <CardBody>
          <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
            <div className="flex-1 w-full">
              <Input placeholder="Cari kendaraan..." value={searchInput} onChange={e => setSearchInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && setSearchTerm(searchInput)} icon={<Search className="w-4 h-4" />} />
            </div>
            <Button onClick={() => { setEditingVehicle(null); setShowModal(true); }} className="w-full md:w-auto whitespace-nowrap">
              <Plus className="w-4 h-4 mr-2" />Tambah Kendaraan
            </Button>
          </div>
        </CardBody>
      </Card>

      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredVehicles.map(vehicle => (
            <VehicleCard key={vehicle.id} vehicle={vehicle} onEdit={handleEdit} onDelete={handleDelete} />
          ))}
        </div>

        <VehicleFormModal isOpen={showModal} onClose={resetModal} onSubmit={handleSubmit} isSubmitting={isSubmitting} editingVehicle={editingVehicle} formData={formData} setFormData={setFormData} />

        <ConfirmModal isOpen={showDeleteModal} onClose={() => { setShowDeleteModal(false); setDeletingVehicleId(null); }} onConfirm={confirmDelete} title="Hapus Kendaraan" message="Apakah Anda yakin ingin menghapus kendaraan ini? Tindakan ini tidak dapat dibatalkan." confirmText="Hapus" cancelText="Batal" variant="danger" isLoading={isDeleting} />
      </div>
    </DashboardLayout>
  );
}
