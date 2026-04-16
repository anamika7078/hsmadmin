import api from "../api";

export const staffApi = {
  getAll: () => api.get("/staff"),
  add: (data: Record<string, unknown>) => api.post("/staff", data),
  update: (id: string, data: Record<string, unknown>) => api.put(`/staff/${id}`, data),
  delete: (id: string) => api.delete(`/staff/${id}`),
};
