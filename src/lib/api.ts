import axios from 'axios';
import type { 
  LoginRequest, 
  LoginResponse, 
  User, 
  Vehicle, 
  Booking, 
  Maintenance,
  CreateBookingRequest,
  CompleteBookingRequest,
  DashboardStats
} from '@/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: async (data: LoginRequest): Promise<LoginResponse> => {
    const response = await api.post('/auth/login', data);
    return response.data;
  },
  me: async (): Promise<User> => {
    const response = await api.get('/auth/me');
    return response.data;
  },
};

// Vehicles API
export const vehiclesAPI = {
  getAll: async (): Promise<Vehicle[]> => {
    const response = await api.get('/vehicles');
    return response.data;
  },
  getById: async (id: number): Promise<Vehicle> => {
    const response = await api.get(`/vehicles/${id}`);
    return response.data;
  },
  create: async (data: Partial<Vehicle>): Promise<Vehicle> => {
    const response = await api.post('/vehicles', data);
    return response.data;
  },
  update: async (id: number, data: Partial<Vehicle>): Promise<Vehicle> => {
    const response = await api.patch(`/vehicles/${id}`, data);
    return response.data;
  },
  delete: async (id: number): Promise<void> => {
    await api.delete(`/vehicles/${id}`);
  },
};

// Bookings API
export const bookingsAPI = {
  getAll: async (): Promise<Booking[]> => {
    const response = await api.get('/bookings');
    return response.data;
  },
  getById: async (id: number): Promise<Booking> => {
    const response = await api.get(`/bookings/${id}`);
    return response.data;
  },
  create: async (data: CreateBookingRequest): Promise<Booking> => {
    const response = await api.post('/bookings', data);
    return response.data;
  },
  approve: async (id: number): Promise<Booking> => {
    const response = await api.post(`/bookings/${id}/approve`);
    return response.data;
  },
  reject: async (id: number): Promise<Booking> => {
    const response = await api.post(`/bookings/${id}/reject`);
    return response.data;
  },
  complete: async (id: number, data: CompleteBookingRequest): Promise<Booking> => {
    const response = await api.post(`/bookings/${id}/complete`, data);
    return response.data;
  },
  getPendingApprovals: async (): Promise<Booking[]> => {
    const response = await api.get('/bookings/pending-approvals');
    return response.data;
  },
  getAllPendingApprovals: async (): Promise<Booking[]> => {
    const response = await api.get('/bookings/all-pending-approvals');
    return response.data;
  },
  getMyBookings: async (): Promise<Booking[]> => {
    const response = await api.get('/bookings/my-bookings');
    return response.data;
  },
};

// Maintenance API
export const maintenanceAPI = {
  getAll: async (): Promise<Maintenance[]> => {
    const response = await api.get('/maintenance');
    return response.data;
  },
  getById: async (id: number): Promise<Maintenance> => {
    const response = await api.get(`/maintenance/${id}`);
    return response.data;
  },
  create: async (data: Partial<Maintenance>): Promise<Maintenance> => {
    const response = await api.post('/maintenance', data);
    return response.data;
  },
  update: async (id: number, data: Partial<Maintenance>): Promise<Maintenance> => {
    const response = await api.put(`/maintenance/${id}`, data);
    return response.data;
  },
  delete: async (id: number): Promise<void> => {
    await api.delete(`/maintenance/${id}`);
  },
};

// Reports API
export const reportsAPI = {
  getDashboard: async (): Promise<DashboardStats> => {
    const response = await api.get('/reports/dashboard');
    return response.data;
  },
  exportBookings: async (startDate?: string, endDate?: string): Promise<Blob> => {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    const response = await api.get(`/reports/export?${params.toString()}`, {
      responseType: 'blob',
    });
    return response.data;
  },
};

// Users API
export const usersAPI = {
  getAll: async (): Promise<User[]> => {
    const response = await api.get('/users');
    return response.data;
  },
  getApprovers: async (): Promise<User[]> => {
    const response = await api.get('/users/approvers');
    return response.data;
  },
};

export default api;
