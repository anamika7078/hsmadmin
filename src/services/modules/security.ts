import { apiClient } from "../apiClient";

export interface Guard {
  id: number;
  name: string;
  mobile: string;
  email?: string;
  shift: 'day' | 'night';
  is_active: boolean;
  created_at: string;
}

export interface GuardStats {
  total_guards: number;
  active_guards: number;
  inactive_guards: number;
  day_shift_guards: number;
  night_shift_guards: number;
}

export const securityApi = {
  // Get all guards (committee)
  getAll: (params?: { page?: number; limit?: number; is_active?: string }) => {
    return apiClient.get('/guards', { params });
  },

  // Create guard (committee)
  create: (data: Partial<Guard>) => {
    return apiClient.post('/guards', data);
  },

  // Update guard (committee)
  update: (id: number, data: Partial<Guard>) => {
    return apiClient.put(`/guards/${id}`, data);
  },

  // Delete guard (committee)
  delete: (id: number) => {
    return apiClient.delete(`/guards/${id}`);
  },

  // Get guard statistics
  getStats: () => {
    return apiClient.get('/guards/stats');
  },

  // Get guard logs
  getLogs: (params?: { page?: number; limit?: number; guard_id?: number; date?: string }) => {
    return apiClient.get('/guards/logs', { params });
  },

  // Duty Management
  checkIn: (data: { notes?: string }) => {
    return apiClient.post('/guards/check-in', data);
  },

  checkOut: (data: { notes?: string }) => {
    return apiClient.post('/guards/check-out', data);
  },

  getDuty: () => {
    return apiClient.get('/guards/duty');
  },

  // Vehicle Logs
  logVehicleEntry: (data: { vehicle_number: string; vehicle_type: string; visiting_flat_id?: number }) => {
    return apiClient.post('/vehicles/entry', data);
  },

  logVehicleExit: (id: number) => {
    return apiClient.put(`/vehicles/exit/${id}`);
  },

  getVehicleLogs: (params?: { status?: 'inside' | 'exited'; limit?: number }) => {
    return apiClient.get('/vehicles', { params });
  },

  // Emergency Alert
  triggerEmergency: (data: { message: string }) => {
    return apiClient.post('/emergency/trigger', data);
  }
};
