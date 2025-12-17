import api from "./api";

export const filmService = {
    getFilmById: async (id) => {
        const response = await api.get(`/films/${id}/`);
        return response.data;
    },
    getCompromiseFilms: async (filmAId, filmBId, alpha = 0.5, limit = 20) => {
        const response = await api.post("/compromise/", {
            film_a_id: filmAId,
            film_b_id: filmBId,
            alpha,
            limit,
        });
        return response.data;
    },
};