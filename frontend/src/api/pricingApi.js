import axiosInstance from "./axiosInstance";

export const getPricingRules = (showtimeId) => axiosInstance.get(`/showtimes/${showtimeId}/pricing`);
export const addPricingRule = (showtimeId, data) => axiosInstance.post(`/showtimes/${showtimeId}/pricing`, data);
export const updatePricingRule = (showtimeId, ruleId, data) =>
    axiosInstance.put(`/showtimes/${showtimeId}/pricing/${ruleId}`, data);
export const deletePricingRule = (showtimeId, ruleId) =>
    axiosInstance.delete(`/showtimes/${showtimeId}/pricing/${ruleId}`);