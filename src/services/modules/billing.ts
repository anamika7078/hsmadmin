import { apiClient } from '../apiClient';

export interface Bill {
  id: number;
  flat_id: number;
  bill_type: 'maintenance' | 'water' | 'electricity' | 'parking' | 'other';
  amount: number;
  due_date: string;
  period_start?: string;
  period_end?: string;
  description?: string;
  status: 'unpaid' | 'paid' | 'partial' | 'overdue';
  flat_number?: string;
  wing_name?: string;
  generated_by_name?: string;
  paid_amount?: number;
  payment_date?: string;
  is_overdue?: boolean;
  created_at: string;
}

export interface Payment {
  id: number;
  bill_id: number;
  amount: number;
  payment_method: 'cash' | 'online' | 'cheque' | 'upi';
  transaction_id?: string;
  payment_date: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  notes?: string;
  bill_type?: string;
  due_date?: string;
  flat_number?: string;
  wing_name?: string;
}

export interface BillingStats {
  total_bills: number;
  unpaid_bills: number;
  partial_bills: number;
  paid_bills: number;
  overdue_bills: number;
  total_amount: number;
  outstanding_amount: number;
  collected_amount?: number;
}

export const billingApi = {
  // Get all bills (committee)
  getAll: async (params?: {
    page?: number;
    limit?: number;
    status?: string;
    flat_id?: number;
  }) => {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.status) queryParams.append('status', params.status);
    if (params?.flat_id) queryParams.append('flat_id', params.flat_id.toString());

    return apiClient.get(`/billing?${queryParams.toString()}`);
  },

  // Generate bills (committee)
  generate: async (data: {
    bill_type: string;
    amount: number;
    due_date: string;
    period_start?: string;
    period_end?: string;
    description?: string;
    flat_ids: number[];
  }) => {
    return apiClient.post('/billing/generate', data);
  },

  // Get my bills (member)
  getMyBills: async () => {
    return apiClient.get('/billing/my-bills');
  },

  // Make payment (member)
  pay: async (data: {
    bill_id: number;
    amount: number;
    payment_method: string;
    transaction_id?: string;
    notes?: string;
  }) => {
    return apiClient.post('/billing/pay', data);
  },

  // Get payment history (member)
  getPaymentHistory: async (params?: { bill_id?: number }) => {
    const queryParams = new URLSearchParams();
    if (params?.bill_id) queryParams.append('bill_id', params.bill_id.toString());

    return apiClient.get(`/billing/payments?${queryParams.toString()}`);
  },

  // Get billing statistics (committee)
  getStats: async () => {
    return apiClient.get('/billing/stats');
  },

  // Update bill (committee)
  update: async (id: number, data: Partial<Bill>) => {
    return apiClient.put(`/billing/${id}`, data);
  },

  // Delete bill (committee)
  delete: async (id: number) => {
    return apiClient.delete(`/billing/${id}`);
  },
};
