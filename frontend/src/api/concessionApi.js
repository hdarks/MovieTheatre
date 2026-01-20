import axiosInstance from "./axiosInstance";

export const getConcessions = () => axiosInstance.get("/concessions");
export const getConcessionById = (id) => axiosInstance.get(`/concessions/${id}`);
export const createConcession = (data) => axiosInstance.post("/concessions", data);
export const updateConcession = (id, data) => axiosInstance.put(`/concessions/${id}`, data);
export const deleteConcession = (id) => axiosInstance.delete(`/concessions/${id}`);
export const adjustStock = (id, delta) => axiosInstance.patch(`/concessions/${id}/stock`, { delta });