import { apiClient } from '../apiClient';

export interface Notice {
  id: number;
  title: string;
  content: string;
  notice_type: 'general' | 'emergency' | 'maintenance' | 'meeting' | 'event';
  priority: 'low' | 'normal' | 'high' | 'urgent';
  target_audience: 'all' | 'committee' | 'members' | 'security';
  is_active: boolean;
  expires_at?: string;
  created_by_name?: string;
  created_at: string;
}

export const noticesApi = {
  // Get all notices (committee)
  getAll: async (params?: {
    page?: number;
    limit?: number;
    type?: string;
    priority?: string;
  }) => {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.type) queryParams.append('type', params.type);
    if (params?.priority) queryParams.append('priority', params.priority);

    return apiClient.get(`/notices?${queryParams.toString()}`);
  },

  // Create notice (committee)
  create: async (data: {
    title: string;
    content: string;
    notice_type?: string;
    priority?: string;
    target_audience?: string;
    expires_at?: string;
  }) => {
    return apiClient.post('/notices', data);
  },

  // Get notice by ID
  getById: async (id: number) => {
    return apiClient.get(`/notices/${id}`);
  },

  // Update notice (committee)
  update: async (id: number, data: Partial<Notice>) => {
    return apiClient.put(`/notices/${id}`, data);
  },

  // Delete notice (committee)
  delete: async (id: number) => {
    return apiClient.delete(`/notices/${id}`);
  },

  // Get my notices (authenticated users)
  getMyNotices: async () => {
    return apiClient.get('/notices/my-notices');
  },
};
