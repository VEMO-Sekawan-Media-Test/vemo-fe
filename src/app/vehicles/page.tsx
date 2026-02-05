'use client';

import React, { useEffect, useState } from 'react';
import { Plus, Search } from 'lucide-react';
import { DashboardLayout } from '@/components/layout';
import { Card, CardBody, Button, Input, Select, Modal, ConfirmModal, useToast } from '@/components/ui';
import { vehiclesAPI } from '@/lib/api';
import type { Vehicle } from '@/types';

export default function VehiclesPage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [formData, setFormData] = useState({
    modelName: '',
    plateNumber: '',
    type: 'Personnel',
    ownership: 'Company',
    location: 'Kantor Pusat',
    fuelConsumption: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingVehicleId, setDeletingVehicleId] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const { showSuccess, showError } = useToast();

  useEffect(() => {
    fetchVehicles();
  }, []);

  const fetchVehicles = async () => {
    try {
      const data = await vehiclesAPI.getAll();
      setVehicles(data);
    } catch (error) {
      console.error('Failed to fetch vehicles:', error);
    } finally {
      setIsLoading(false);
    }
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
      
      if (editingVehicle) {
        await vehiclesAPI.update(editingVehicle.id, vehicleData);
      } else {
        await vehiclesAPI.create(vehicleData);
      }
      setShowModal(false);
      setFormData({
        modelName: '',
        plateNumber: '',
        type: 'Personnel',
        ownership: 'Company',
        location: 'Kantor Pusat',
        fuelConsumption: '',
      });
      setEditingVehicle(null);
      fetchVehicles();
      showSuccess(editingVehicle ? 'Kendaraan berhasil diperbarui!' : 'Kendaraan berhasil ditambahkan!');
    } catch (error) {
      console.error('Failed to save vehicle:', error);
      showError('Gagal menyimpan kendaraan. Silakan coba lagi.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (vehicle: Vehicle) => {
    setEditingVehicle(vehicle);
    setFormData({
      modelName: vehicle.modelName,
      plateNumber: vehicle.plateNumber,
      type: vehicle.type,
      ownership: vehicle.ownership,
      location: vehicle.location,
      fuelConsumption: vehicle.fuelConsumption.toString(),
    });
    setShowModal(true);
  };

  const handleDelete = async (id: number) => {
    setDeletingVehicleId(id);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (deletingVehicleId === null) return;
    setIsDeleting(true);
    try {
      await vehiclesAPI.delete(deletingVehicleId);
      fetchVehicles();
      showSuccess('Kendaraan berhasil dihapus!');
    } catch (error) {
      console.error('Failed to delete vehicle:', error);
      showError('Gagal menghapus kendaraan. Silakan coba lagi.');
    } finally {
      setIsDeleting(false);
      setShowDeleteModal(false);
      setDeletingVehicleId(null);
    }
  };

  const filteredVehicles = vehicles.filter(
    (v) =>
      v.modelName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.plateNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
      {/* Header Card with Button and Search */}
      <Card className="mb-6">
        <CardBody>
          <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
            <div className="flex-1 w-full">
              <Input
                placeholder="Cari kendaraan..."
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
            <Button 
              onClick={() => {
                setEditingVehicle(null);
                setShowModal(true);
              }}
              className="w-full md:w-auto whitespace-nowrap"
            >
              <Plus className="w-4 h-4 mr-2" />
              Tambah Kendaraan
            </Button>
          </div>
        </CardBody>
      </Card>

      <div className="space-y-6">

        {/* Vehicles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredVehicles.map((vehicle) => (
            <Card key={vehicle.id} className="card-hover">
              <CardBody>
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-gray-900">{vehicle.modelName}</h3>
                    <p className="text-sm text-gray-500">{vehicle.plateNumber}</p>
                  </div>
                  <span
                    className={`px-2 py-1 text-xs font-medium rounded-full ${
                      vehicle.ownership === 'Company'
                        ? 'bg-[#10B981] text-white'
                        : 'bg-[#F59E0B] text-white'
                    }`}
                  >
                    {vehicle.ownership}
                  </span>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Type</span>
                    <span className="font-medium">{vehicle.type}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Location</span>
                    <span className="font-medium">{vehicle.location}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Fuel Consumption</span>
                    <span className="font-medium">{vehicle.fuelConsumption} L/km</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Current Fuel</span>
                    <span className="font-medium">{vehicle.currentFuel}%</span>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-gray-200 flex gap-2">
                  <Button variant="outline" size="sm" className="flex-1" onClick={() => handleEdit(vehicle)}>
                    Edit
                  </Button>
                  <Button variant="danger" size="sm" className="flex-1" onClick={() => handleDelete(vehicle.id)}>
                    Delete
                  </Button>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>

        {/* Vehicle Modal */}
        <Modal
          isOpen={showModal}
          onClose={() => {
            setShowModal(false);
            setEditingVehicle(null);
            setFormData({
              modelName: '',
              plateNumber: '',
              type: 'Personnel',
              ownership: 'Company',
              location: 'Kantor Pusat',
              fuelConsumption: '',
            });
          }}
          title={editingVehicle ? 'Edit Vehicle' : 'Add New Vehicle'}
          size="lg"
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Model Name"
              value={formData.modelName}
              onChange={(e) => setFormData({ ...formData, modelName: e.target.value })}
              placeholder="e.g., Toyota Avanza"
              required
            />
            <Input
              label="Plate Number"
              value={formData.plateNumber}
              onChange={(e) => setFormData({ ...formData, plateNumber: e.target.value })}
              placeholder="e.g., B 1234 ABC"
              required
            />
            <Select
              label="Type"
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              options={[
                { value: 'Personnel', label: 'Personnel (Angkutan Orang)' },
                { value: 'Freight', label: 'Freight (Angkutan Barang)' },
              ]}
              required
            />
            <Select
              label="Ownership"
              value={formData.ownership}
              onChange={(e) => setFormData({ ...formData, ownership: e.target.value })}
              options={[
                { value: 'Company', label: 'Company Owned' },
                { value: 'Rental', label: 'Rental' },
              ]}
              required
            />
            <Select
              label="Location"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              options={[
                { value: 'Kantor Pusat', label: 'Kantor Pusat' },
                { value: 'Kantor Cabang', label: 'Kantor Cabang' },
                { value: 'Tambang 1', label: 'Tambang 1' },
                { value: 'Tambang 2', label: 'Tambang 2' },
                { value: 'Tambang 3', label: 'Tambang 3' },
                { value: 'Tambang 4', label: 'Tambang 4' },
                { value: 'Tambang 5', label: 'Tambang 5' },
                { value: 'Tambang 6', label: 'Tambang 6' },
              ]}
              required
            />
            <Input
              label="Fuel Consumption (L/km)"
              type="number"
              step="0.01"
              value={formData.fuelConsumption}
              onChange={(e) => setFormData({ ...formData, fuelConsumption: e.target.value })}
              placeholder="e.g., 0.1"
              required
            />
            <div className="flex justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowModal(false);
                  setEditingVehicle(null);
                }}
              >
                Cancel
              </Button>
              <Button type="submit" isLoading={isSubmitting}>
                {editingVehicle ? 'Update' : 'Create'}
              </Button>
            </div>
          </form>
        </Modal>

        {/* Delete Confirmation Modal */}
        <ConfirmModal
          isOpen={showDeleteModal}
          onClose={() => {
            setShowDeleteModal(false);
            setDeletingVehicleId(null);
          }}
          onConfirm={confirmDelete}
          title="Hapus Kendaraan"
          message="Apakah Anda yakin ingin menghapus kendaraan ini? Tindakan ini tidak dapat dibatalkan."
          confirmText="Hapus"
          cancelText="Batal"
          variant="danger"
          isLoading={isDeleting}
        />
      </div>
    </DashboardLayout>
  );
}
