import { apiClient } from '../apiClient';

export interface LoginResponse {
  success: boolean;
  message: string;
  data: {
    token: string;
    user: {
      id: number;
      name: string;
      email: string;
      mobile: string;
      role: 'committee' | 'member' | 'security';
      is_verified: boolean;
    };
  };
}

export interface OTPResponse {
  success: boolean;
  message: string;
  data: {
    mobile: string;
    name: string;
    role: string;
    otp?: string;
  };
}

export const authApi = {
  // Login with email & password
  login: async (data: { email: string; password: string }): Promise<LoginResponse> => {
    return apiClient.post('/auth/login', data);
  },

  // Send OTP
  sendOTP: async (mobile: string): Promise<OTPResponse> => {
    return apiClient.post('/auth/send-otp', { mobile });
  },

  // Verify OTP
  verifyOTP: async (mobile: string, otp: string): Promise<LoginResponse> => {
    return apiClient.post('/auth/verify-otp', { mobile, otp });
  },

  // Get profile
  getProfile: async () => {
    return apiClient.get('/auth/profile');
  },

  // Update profile
  updateProfile: async (data: { name?: string; email?: string }) => {
    return apiClient.put('/auth/profile', data);
  },

  // Change password
  changePassword: async (data: { currentPassword: string; newPassword: string }) => {
    return apiClient.put('/auth/change-password', data);
  },

  // Register user (committee only)
  registerUser: async (data: {
    name: string;
    email?: string;
    mobile: string;
    password?: string;
    role: 'committee' | 'member' | 'security';
  }) => {
    return apiClient.post('/auth/register', data);
  },

  // Logout
  logout: () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/login";
  },
};
