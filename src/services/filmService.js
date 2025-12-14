import api from "./api";

export const filmService = {
    getFilmById: async (id) => {
        const response = await api.get(`/films/${id}/`);
        return response.data;
    },
};