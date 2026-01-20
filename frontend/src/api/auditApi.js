import axiosInstance from "./axiosInstance";

export const getAudits = () => axiosInstance.get("/audits");
export const getAuditByEntity = (entity, entityId) => axiosInstance.get(`/audits/${entity}/${entityId}`);