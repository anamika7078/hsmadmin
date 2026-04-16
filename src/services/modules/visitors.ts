import { apiClient } from '../apiClient';

export interface Visitor {
  id: number;
  name: string;
  mobile: string;
  visitor_type?: 'guest' | 'delivery' | 'maid' | 'service' | 'other';
  purpose?: string;
  vehicle_number?: string;
  expected_arrival?: string;
  actual_arrival?: string;
  actual_departure?: string;
  status: 'pending' | 'approved' | 'rejected' | 'checked_in' | 'checked_out';
  flat_id?: number;
  flat_number?: string;
  wing_name?: string;
  member_name?: string;
  member_mobile?: string;
  approved_by_name?: string;
  created_at: string;
}

export interface VisitorStats {
  total_visitors: number;
  pending_visitors: number;
  approved_visitors: number;
  checked_in_visitors: number;
  checked_out_visitors: number;
  today_visitors: number;
}

export const visitorsApi = {
  // Get all visitors
  getAll: async (params?: {
    page?: number;
    limit?: number;
    status?: string;
    date?: string;
  }) => {
    return apiClient.get('/visitors', { params });
  },

  // Get active visitors (already inside)
  getActive: async () => {
    return apiClient.get('/visitors/active');
  },

  // Get visitor statistics
  getStats: async () => {
    return apiClient.get('/visitors/stats');
  },

  // Create visitor request (member/security)
  createRequest: async (data: unknown) => {
    return apiClient.post('/visitors/request', data);
  },

  // Respond to visitor (member)
  respond: async (id: number, status: 'approved' | 'rejected') => {
    return apiClient.post('/visitors/respond', { id, status });
  },

  // Get my visitors (member)
  getMyVisitors: async () => {
    return apiClient.get('/visitors/my-visitors');
  },

  // Check in visitor (security)
  checkIn: async (id: number, notes?: string) => {
    return apiClient.post(`/visitors/${id}/check-in`, { notes });
  },

  // Check out visitor (security)
  checkOut: async (id: number) => {
    return apiClient.post(`/visitors/${id}/check-out`);
  },

  update: async (id: number, data: unknown) => {
    return apiClient.put(`/visitors/${id}`, data);
  },

  delete: async (id: number) => {
    return apiClient.delete(`/visitors/${id}`);
  }
};
