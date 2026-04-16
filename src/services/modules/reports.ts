import { apiClient } from '../apiClient';

export interface DashboardStats {
  members: {
    total_members: number;
    verified_members: number;
    active_members: number;
  };
  visitors: {
    total_visitors: number;
    active_visitors: number;
    today_visitors: number;
  };
  billing: {
    total_bills: number;
    unpaid_bills: number;
    total_amount: number;
    outstanding_amount: number;
  };
  complaints: {
    total_complaints: number;
    open_complaints: number;
    in_progress_complaints: number;
  };
}

export const reportsApi = {
  // Get dashboard statistics
  getDashboardStats: async () => {
    return apiClient.get('/reports/dashboard');
  },

  // Get monthly report
  getMonthlyReport: async (year: number, month: number) => {
    return apiClient.get(`/reports/monthly?year=${year}&month=${month}`);
  },

  // Get visitor report
  getVisitorReport: async (params?: { start_date?: string; end_date?: string; status?: string }) => {
    const queryParams = new URLSearchParams();
    if (params?.start_date) queryParams.append('start_date', params.start_date);
    if (params?.end_date) queryParams.append('end_date', params.end_date);
    if (params?.status) queryParams.append('status', params.status);
    
    return apiClient.get(`/reports/visitors?${queryParams.toString()}`);
  },

  // Get billing report
  getBillingReport: async (params?: { start_date?: string; end_date?: string; status?: string; bill_type?: string }) => {
    const queryParams = new URLSearchParams();
    if (params?.start_date) queryParams.append('start_date', params.start_date);
    if (params?.end_date) queryParams.append('end_date', params.end_date);
    if (params?.status) queryParams.append('status', params.status);
    if (params?.bill_type) queryParams.append('bill_type', params.bill_type);
    
    return apiClient.get(`/reports/billing?${queryParams.toString()}`);
  },

  // Get complaint report
  getComplaintReport: async (params?: { start_date?: string; end_date?: string; status?: string; category?: string }) => {
    const queryParams = new URLSearchParams();
    if (params?.start_date) queryParams.append('start_date', params.start_date);
    if (params?.end_date) queryParams.append('end_date', params.end_date);
    if (params?.status) queryParams.append('status', params.status);
    if (params?.category) queryParams.append('category', params.category);
    
    return apiClient.get(`/reports/complaints?${queryParams.toString()}`);
  },
};
