import { apiClient } from '../apiClient';

export interface Member {
  id: number;
  name: string;
  email: string;
  mobile: string;
  role: string;
  is_active: boolean;
  is_verified: boolean;
  created_at: string;
  flat_number?: string;
  wing_name?: string;
  society_name?: string;
  ownership_type?: string;
  start_date?: string;
}

export interface MemberStats {
  total_members: number;
  verified_members: number;
  unverified_members: number;
  active_members: number;
  inactive_members: number;
}

export const membersApi = {
  // Get all members
  getAll: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
  }) => {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.search) queryParams.append('search', params.search);
    if (params?.status) queryParams.append('status', params.status);

    return apiClient.get(`/members?${queryParams.toString()}`);
  },

  // Get member by ID
  getById: async (id: number) => {
    return apiClient.get(`/members/${id}`);
  },

  // Approve member
  approve: async (id: number, data: { flatId?: number; ownershipType?: string }) => {
    return apiClient.post(`/members/${id}/approve`, data);
  },

  // Reject member
  reject: async (id: number, data: { reason?: string }) => {
    return apiClient.post(`/members/${id}/reject`, data);
  },

  // Update member
  update: async (id: number, data: Partial<Member>) => {
    return apiClient.put(`/members/${id}`, data);
  },

  // Delete member
  delete: async (id: number) => {
    return apiClient.delete(`/members/${id}`);
  },

  // Get member statistics
  getStats: async () => {
    return apiClient.get('/members/stats');
  },
};
