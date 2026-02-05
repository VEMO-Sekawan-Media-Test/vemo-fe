// Types for the application

export type Role = 'ADMIN' | 'APPROVER';

export interface User {
  id: number;
  username: string;
  name: string;
  role: Role;
}

export interface Vehicle {
  id: number;
  modelName: string;
  plateNumber: string;
  type: 'Personnel' | 'Freight';
  ownership: 'Company' | 'Rental';
  location: string;
  fuelConsumption: number;
  lastService: string | null;
  currentFuel: number;
}

export interface Booking {
  id: number;
  vehicleId: number;
  vehicle?: Vehicle;
  driverName: string;
  creatorId: number;
  creator?: User;
  approver1Id: number;
  approver1?: User;
  approver2Id: number;
  approver2?: User;
  status: 0 | 1 | 2 | -1; // 0: Pending, 1: Lvl1 Approved, 2: Final Approved, -1: Rejected
  startDate: string;
  endDate: string;
  createdAt: string;
  fuelStart: number | null;
  fuelEnd: number | null;
  distanceKm: number | null;
  fuelUsed: number | null;
}

export interface Maintenance {
  id: number;
  vehicleId: number;
  vehicle?: Vehicle;
  description: string;
  scheduledDate: string;
  completedDate: string | null;
  status: 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  estimatedCost: number;
  actualCost: number | null;
  serviceType: string | null;
  notes: string | null;
  createdAt: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  user: User;
}

export interface CreateBookingRequest {
  vehicleId: number;
  driverName: string;
  approver1Id: number;
  approver2Id: number;
  startDate: string;
  endDate: string;
}

export interface CompleteBookingRequest {
  fuelStart: number;
  fuelEnd: number;
  distanceKm: number;
}

export interface DashboardStats {
  totalVehicles: number;
  activeBookings: number;
  pendingApprovals: number;
  totalFuelUsed: number;
  vehiclesByLocation: Record<string, number>;
  bookingsByMonth: Record<string, number>;
  bookingsByVehicleType: Record<string, number>;
}
