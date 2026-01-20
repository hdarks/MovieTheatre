import axiosInstance from "./axiosInstance";

export const getAnalytics = () => axiosInstance.get("/analytics");
export const getSystemAnalytics = () => axiosInstance.get("/analytics/system");