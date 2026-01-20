import axiosInstance from "./axiosInstance";

export const registerUser = (data) => axiosInstance.post("/users/register", data);
export const loginUser = (data) => axiosInstance.post("/users/login", data);
export const getProfile = () => axiosInstance.get("/users/me");
export const updatePreferences = (data) => axiosInstance.patch("/users/preferences", data);
export const addLoyaltyPoints = (data) => axiosInstance.patch("/users/loyalty", data);
export const getUsersByRole = (role) => axiosInstance.get(`/users/role/${role}`);
export const deleteUser = (id) => axiosInstance.delete(`/users/${id}`);