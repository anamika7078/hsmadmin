import { apiClient } from '../apiClient';

export interface Society {
  id: number;
  name: string;
  address?: string;
  landmark?: string;
  city?: string;
  state?: string;
  pincode?: string;
  registration_number?: string;
  occupied_flats?: number;
  email?: string;
  phone?: string;
  logo?: string;
  created_at: string;
}

export interface Wing {
  id: number;
  society_id: number;
  name: string;
  floors: number;
  flats_per_floor: number;
  total_flats?: number;
  occupied_flats?: number;
  created_at: string;
}

export interface Flat {
  id: number;
  wing_id: number;
  flat_number: string;
  floor_number: number;
  type?: '1BHK' | '2BHK' | '3BHK' | '4BHK' | 'Penthouse';
  area_sqft?: number;
  is_occupied: boolean;
  wing_name?: string;
  owner_id?: number;
  owner_name?: string;
  owner_mobile?: string;
  ownership_type?: string;
  created_at: string;
}

export const societyApi = {
  // Get society details
  getDetails: async () => {
    return apiClient.get('/society/details');
  },

  // Update society details (committee)
  updateDetails: async (data: Partial<Society>) => {
    return apiClient.put('/society/details', data);
  },

  // Get all wings
  getWings: async () => {
    return apiClient.get('/society/wings');
  },

  // Create wing (committee)
  createWing: async (data: {
    name: string;
    floors?: number;
    flats_per_floor?: number;
  }) => {
    return apiClient.post('/society/wings', data);
  },

  // Update wing (committee)
  updateWing: async (id: number, data: Partial<Wing>) => {
    return apiClient.put(`/society/wings/${id}`, data);
  },

  // Delete wing (committee)
  deleteWing: async (id: number) => {
    return apiClient.delete(`/society/wings/${id}`);
  },

  // Get all flats
  getFlats: async (params?: { wing_id?: number }) => {
    const queryParams = new URLSearchParams();
    if (params?.wing_id) queryParams.append('wingId', params.wing_id.toString());
    
    return apiClient.get(`/society/flats?${queryParams.toString()}`);
  },

  // Create flat (committee)
  createFlat: async (data: {
    wing_id: number;
    flat_number: string;
    floor_number: number;
    type?: string;
    area_sqft?: number;
  }) => {
    return apiClient.post('/society/flats', data);
  },

  // Update flat (committee)
  updateFlat: async (id: number, data: Partial<Flat>) => {
    return apiClient.put(`/society/flats/${id}`, data);
  },

  // Delete flat (committee)
  deleteFlat: async (id: number) => {
    return apiClient.delete(`/society/flats/${id}`);
  },

  // Upload logo (committee)
  uploadLogo: async (file: File) => {
    const formData = new FormData();
    formData.append('logo', file);
    return apiClient.post('/society/logo', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
};
