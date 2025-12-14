import api from "./api";

export const reviewService = {
    getReviewsByFilmId: async (filmId) => {
        const response = await api.get(`/reviews/?film=${filmId}`);
        return response.data.results || response.data;
    },

    createReview: async (filmId, rating, body) => {
        const response = await api.post(`/reviews/`, {
            film: filmId,
            rating: Number(rating),
            body,
        });
        return response.data;
    },

    updateReview: async (reviewId, rating, body) => {
        const response = await api.patch(`/reviews/${reviewId}/`, {
            rating: Number(rating),
            body,
        });
        return response.data;
    },

    deleteReview: async (reviewId) => {
        await api.delete(`/reviews/${reviewId}/`);
    },

    likeReview: async (reviewId) => {
        const response = await api.post(`/review-likes/`, {
            review: reviewId
        });
        return response.data;
    },

    unlikeReview: async (likeId) => {
        await api.delete(`/review-likes/${likeId}/`);
    },

    reportReview: async (reviewId) => {
        const response = await api.post(`/review-reports/`, {
            review: reviewId
        });
        return response.data;
    },

    unreportReview: async (reportId) => {
        await api.delete(`/review-reports/${reportId}/`);
    },
};