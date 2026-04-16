import api from "../api";

export const settingsApi = {
  getSocietyProfile: () => api.get("/settings/society"),
  updateSocietyProfile: (data: Record<string, unknown>) => api.put("/settings/society", data),
  getPaymentConfig: () => api.get("/settings/payments"),
  updatePaymentConfig: (data: Record<string, unknown>) => api.put("/settings/payments", data),
};
