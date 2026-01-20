import axiosInstance from "./axiosInstance";

export const getMovies = () => axiosInstance.get("/movies");
export const getMovieById = (id) => axiosInstance.get(`/movies/${id}`);
export const createMovie = (data) => axiosInstance.post("/movies", data);
export const updateMovie = (id, data) => axiosInstance.patch(`/movies/${id}`, data);
export const deleteMovie = (id) => axiosInstance.delete(`/movies/${id}`);