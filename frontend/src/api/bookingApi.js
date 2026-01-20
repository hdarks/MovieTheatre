import axiosInstance from "./axiosInstance";

export const createBooking = (data) => axiosInstance.post("/bookings", data);
export const getBookingById = (id) => axiosInstance.get(`/bookings/${id}`);
export const confirmBooking = (id) => axiosInstance.patch(`/bookings/${id}/confirm`);
export const cancelBooking = (id) => axiosInstance.patch(`/bookings/${id}/cancel`);
export const refundBooking = (id) => axiosInstance.patch(`/bookings/${id}/refund`);
export const getUserBookings = () => axiosInstance.get("/bookings/me");
export const validateTicketQR = (qrCode) => axiosInstance.post("/bookings/validate", { qrCode });
export const getBookings = () => axiosInstance.get("/bookings");