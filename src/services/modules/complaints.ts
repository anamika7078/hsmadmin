import { apiClient } from '../apiClient';

export interface Complaint {
  id: number;
  complainant_id: number;
  title: string;
  description: string;
  category: 'plumbing' | 'electrical' | 'civil' | 'security' | 'parking' | 'other';
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'open' | 'in_progress' | 'resolved' | 'closed' | 'rejected';
  assigned_to?: number;
  flat_id?: number;
  resolution_notes?: string;
  resolved_at?: string;
  complainant_name?: string;
  complainant_mobile?: string;
  assigned_to_name?: string;
  flat_number?: string;
  wing_name?: string;
  created_at: string;
  updated_at: string;
}

export interface ComplaintStats {
  total_complaints: number;
  open_complaints: number;
  in_progress_complaints: number;
  resolved_complaints: number;
  closed_complaints: number;
  critical_complaints: number;
  today_complaints: number;
}

export const complaintsApi = {
  // Get all complaints (committee)
  getAll: async (params?: {
    page?: number;
    limit?: number;
    status?: string;
    category?: string;
  }) => {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.status) queryParams.append('status', params.status);
    if (params?.category) queryParams.append('category', params.category);

    return apiClient.get(`/complaints?${queryParams.toString()}`);
  },

  // Create complaint (member)
  create: async (data: {
    title: string;
    description: string;
    category?: string;
    priority?: string;
    flat_id?: number;
  }) => {
    return apiClient.post('/complaints', data);
  },

  // Get complaint by ID
  getById: async (id: number) => {
    return apiClient.get(`/complaints/${id}`);
  },

  // Update complaint status (committee)
  updateStatus: async (id: number, data: {
    status: string;
    assigned_to?: number;
    resolution_notes?: string;
  }) => {
    return apiClient.put(`/complaints/${id}/status`, data);
  },

  // Get my complaints (member)
  getMyComplaints: async () => {
    return apiClient.get('/complaints/my-complaints');
  },

  // Get complaint statistics (committee)
  getStats: async () => {
    return apiClient.get('/complaints/stats');
  },

  // Delete complaint (committee)
  delete: async (id: number) => {
    return apiClient.delete(`/complaints/${id}`);
  },
};
