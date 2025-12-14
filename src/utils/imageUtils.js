import {
    BASE_MEDIA_URL,
    TMDB_BASE_URL
} from "./constants";

export function buildPosterUrl(rawPath) {
    if (!rawPath) return null;
    const poster_path = String(rawPath);

    if (poster_path.startsWith("http://") || poster_path.startsWith("https://")) {
        return poster_path;
    }

    if (poster_path.startsWith("/media/")) {
        return `${BASE_MEDIA_URL}${poster_path}`;
    }

    return `${TMDB_BASE_URL}${poster_path}`;
}