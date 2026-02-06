export const VEHICLE_LOCATION_OPTIONS = [
  { value: 'Kantor Pusat', label: 'Kantor Pusat' },
  { value: 'Kantor Cabang', label: 'Kantor Cabang' },
  { value: 'Tambang 1', label: 'Tambang 1' },
  { value: 'Tambang 2', label: 'Tambang 2' },
  { value: 'Tambang 3', label: 'Tambang 3' },
  { value: 'Tambang 4', label: 'Tambang 4' },
  { value: 'Tambang 5', label: 'Tambang 5' },
  { value: 'Tambang 6', label: 'Tambang 6' },
];

export const VEHICLE_TYPE_OPTIONS = [
  { value: 'Personnel', label: 'Personnel (Angkutan Orang)' },
  { value: 'Freight', label: 'Freight (Angkutan Barang)' },
];

export const VEHICLE_OWNERSHIP_OPTIONS = [
  { value: 'Company', label: 'Company Owned' },
  { value: 'Rental', label: 'Rental' },
];

export const VEHICLE_INITIAL_FORM_DATA = {
  modelName: '',
  plateNumber: '',
  type: 'Personnel',
  ownership: 'Company',
  location: 'Kantor Pusat',
  fuelConsumption: '',
};
