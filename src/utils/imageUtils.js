import {
    BASE_MEDIA_URL,
    TMDB_IMAGE_BASE,
    TMDB_DEFAULT_SIZE
} from "./constants";

// Build a TMDB or backend poster URL with optional size hint (no visual change, smaller payloads when downscaling).
export function buildPosterUrl(rawPath, size = TMDB_DEFAULT_SIZE) {
    if (!rawPath) return null;
    const poster_path = String(rawPath);

    if (poster_path.startsWith("http://") || poster_path.startsWith("https://")) {
        return poster_path;
    }

    if (poster_path.startsWith("/media/")) {
        return `${BASE_MEDIA_URL}${poster_path}`;
    }

    const safeSize = size || TMDB_DEFAULT_SIZE;
    return `${TMDB_IMAGE_BASE}/${safeSize}${poster_path}`;
}