import api from "../api";

export const flatsApi = {
  getWings: () => api.get("/society/wings"),
  getFlats: () => api.get("/society/flats"),
  addWing: (data: Record<string, unknown>) => api.post("/society/wings", data),
  addFlat: (data: Record<string, unknown>) => api.post("/society/flats", data),
  updateFlat: (id: string, data: Record<string, unknown>) => api.put(`/society/flats/${id}`, data),
  deleteFlat: (id: string) => api.delete(`/society/flats/${id}`),
};
