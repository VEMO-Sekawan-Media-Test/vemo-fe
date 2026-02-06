export const MAINTENANCE_STATUS_FILTERS = [
  { value: 'all', label: 'Semua Status' },
  { value: 'SCHEDULED', label: 'Dijadwalkan' },
  { value: 'IN_PROGRESS', label: 'Sedang Berlangsung' },
  { value: 'COMPLETED', label: 'Selesai' },
  { value: 'CANCELLED', label: 'Dibatalkan' },
];

export const MAINTENANCE_INITIAL_FORM_DATA = {
  vehicleId: '',
  description: '',
  scheduledDate: '',
  estimatedCost: '',
  serviceType: '',
  notes: '',
};
