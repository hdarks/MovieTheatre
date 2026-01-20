import axiosInstance from "./axiosInstance";

export const getTheatres = () => axiosInstance.get("/theatres");
export const getTheatreById = (id) => axiosInstance.get(`/theatres/${id}`);
export const createTheatre = (data) => axiosInstance.post("/theatres", data);
export const updateTheatre = (id, data) => axiosInstance.patch(`/theatres/${id}`, data);
export const deleteTheatre = (id) => axiosInstance.delete(`/theatres/${id}`);
export const addScreen = (theatreId, data) => axiosInstance.post(`/theatres/${theatreId}/screens`, data);
export const updateScreenLayout = (theatreId, screenId, data) => axiosInstance.patch(`/theatres/${theatreId}/screens/${screenId}`, { data });
export const removeScreen = (theatreId, screenId) => axiosInstance.delete(`/theatres/${theatreId}/screens/${screenId}`);
export const getScreenLayout = (theatreId, screenId) => axiosInstance.get(`/theatres/${theatreId}/screens/${screenId}/layout`);