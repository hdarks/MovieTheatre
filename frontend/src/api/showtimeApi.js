import axiosInstance from "./axiosInstance";

export const getShowtimes = () => axiosInstance.get("/showtimes");
export const getShowtimeById = (id) => axiosInstance.get(`/showtimes/${id}`);
export const createShowtime = (data) => axiosInstance.post("/showtimes", data);
export const updateShowtime = (id, data) => axiosInstance.patch(`/showtimes/${id}`, data);
export const cancelShowtime = (id) => axiosInstance.post(`/showtimes/${id}/cancel`);
export const getSeatMap = (id) => axiosInstance.get(`/showtimes/${id}/seatmap`);
export const lockSeat = (id, seatKeys, sessionId) => axiosInstance.post(`/showtimes/${id}/lock`, { seatKeys, sessionId });
export const releaseLockSeat = (id, seatKeys, sessionId) => axiosInstance.post(`/showtimes/${id}/release-locks`, { seatKeys, sessionId });