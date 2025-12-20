const API_ROOT = process.env.REACT_APP_API_URL || "http://localhost:8000";
export const BASE_MEDIA_URL = API_ROOT;
export const TMDB_IMAGE_BASE = "https://image.tmdb.org/t/p";
export const TMDB_DEFAULT_SIZE = "w500";
export const TMDB_BASE_URL = `${TMDB_IMAGE_BASE}/${TMDB_DEFAULT_SIZE}`;
export const FALLBACK_POSTER_URL = "https://placehold.co/400x600?text=No+Poster";