import api from "../api";

export const vehiclesApi = {
  getLogs: () => api.get("/vehicles/logs"),
  getActive: () => api.get("/vehicles/active"),
  addEntry: (data: Record<string, unknown>) => api.post("/vehicles/entry", data),
  markExit: (id: string) => api.post(`/vehicles/exit/${id}`),
};
