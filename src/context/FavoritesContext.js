import { createContext, useCallback, useEffect, useState } from "react";
import { useContext } from "react";
import { AuthContext } from "./AuthContext";
import api from "../services/api";
import { filmService } from "../services/filmService";
import { useContext as useReactContext } from "react";
import { NotificationContext } from "./NotificationContext";

export const FavoritesContext = createContext(null);

export function FavoritesProvider({ children }) {
  const { isAuthenticated, isBooting } = useContext(AuthContext);
  const { showSuccess, setActionError } = useReactContext(NotificationContext) || {};
  const [favorites, setFavorites] = useState(new Set());
  const [favoriteFilms, setFavoriteFilms] = useState([]);
  // Map filmId -> favouriteId (needed because DELETE expects favourite id)
  const [favouriteIdByFilm, setFavouriteIdByFilm] = useState(new Map());
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch all favorites for the current user
  const fetchFavorites = useCallback(async (opts = {}) => {
    const background = Boolean(opts.background);
    if (!isAuthenticated) {
      setFavorites(new Set());
      setFavoriteFilms([]);
      return;
    }

    if (!background) setIsLoading(true);
    setError(null);
    try {
      const res = await api.get("/favourites/");

      const items = Array.isArray(res.data) ? res.data : [];
      // Accept shapes: [{ film: {id,...} }, {film: <id>}] or [<id>]
      const ids = items
        .map((it) => (it && typeof it === "object" && "film" in it ? it.film : it))
        .map((v) => (v && typeof v === "object" ? v.id : v))
        .filter(Boolean);

      const uniqueIds = Array.from(new Set(ids));
      setFavorites(new Set(uniqueIds));

      // Build filmId -> favouriteId map for quick DELETE
      const nextMap = new Map();
      items.forEach((it) => {
        const favId = it && typeof it === "object" ? it.id : null;
        const filmId = it && typeof it === "object" ? (typeof it.film === "object" ? it.film?.id : it.film) : it;
        if (favId && filmId) nextMap.set(filmId, favId);
      });
      setFavouriteIdByFilm(nextMap);

      // Fetch full film objects so UI has poster_path etc.
      const films = await Promise.all(
        uniqueIds.map(async (id) => {
          try {
            return await filmService.getFilmById(id);
          } catch (e) {
            return null;
          }
        })
      );
      setFavoriteFilms(films.filter(Boolean));
    } catch (err) {
      console.error("Error fetching favorites:", err); // DEBUG
      setError(err?.response?.data?.detail || err?.message || "Failed to fetch favorites");
    } finally {
      if (!background) setIsLoading(false);
    }
  }, [isAuthenticated]);

  // Fetch favorites on auth state change
  useEffect(() => {
    if (isAuthenticated && !isBooting) {
      fetchFavorites({ background: false });
    } else if (!isAuthenticated && !isBooting) {
      // Clear stale favorites when user logs out
      setFavorites(new Set());
      setFavoriteFilms([]);
      setFavouriteIdByFilm(new Map());
    }
  }, [isAuthenticated, isBooting, fetchFavorites]);

  // Add a film to favorites
  const addFavorite = useCallback(
    async (filmId) => {
      if (!isAuthenticated) {
        setError("Must be logged in to favorite films");
        return false;
      }

      try {
        setError(null);
        const res = await api.post("/favourites/", { film: filmId });
        setFavorites((prev) => new Set([...prev, filmId]));
        // Save favourite id if backend returns it
        const favId = res?.data?.id;
        if (favId) {
          setFavouriteIdByFilm((prev) => {
            const copy = new Map(prev);
            copy.set(filmId, favId);
            return copy;
          });
        } else {
          // As a fallback, re-fetch to update map
          fetchFavorites();
        }
        // Ensure film details available
        try {
          const film = await filmService.getFilmById(filmId);
          setFavoriteFilms((prev) => {
            const exists = prev.some((f) => f.id === filmId);
            return exists ? prev : [...prev, film];
          });
        } catch (e) {
          console.warn("Added favorite but failed to fetch film details", filmId, e);
        }
        if (typeof showSuccess === "function") {
          showSuccess("Added to favourites", { durationMs: 1500 });
        }
        return true;
      } catch (err) {
        const errorMsg = err?.response?.data?.detail || err?.message || "Failed to add favorite";
        setError(errorMsg);
        if (typeof setActionError === "function") setActionError(errorMsg);
        console.error("Error adding favorite:", err);
        return false;
      }
    },
    [isAuthenticated, fetchFavorites, showSuccess, setActionError]
  );

  // Remove a film from favorites
  const removeFavorite = useCallback(
    async (filmId) => {
      if (!isAuthenticated) {
        setError("Must be logged in to remove favorites");
        return false;
      }

      try {
        setError(null);
        // Prefer deleting by favourite id if known
        const favId = favouriteIdByFilm.get(filmId);
        if (favId) {
          await api.delete(`/favourites/${favId}/`);
        } else {
          // Fallback: try DELETE by film id; if 404, re-fetch and retry once
          try {
            await api.delete(`/favourites/${filmId}/`);
          } catch (err) {
            if (err?.response?.status === 404) {
              await fetchFavorites();
              const retryId = favouriteIdByFilm.get(filmId);
              if (retryId) {
                await api.delete(`/favourites/${retryId}/`);
              } else {
                throw err;
              }
            } else {
              throw err;
            }
          }
        }
        setFavorites((prev) => {
          const next = new Set(prev);
          next.delete(filmId);
          return next;
        });
        setFavoriteFilms((prev) => prev.filter((film) => film.id !== filmId));
        setFavouriteIdByFilm((prev) => {
          const copy = new Map(prev);
          copy.delete(filmId);
          return copy;
        });
        if (typeof showSuccess === "function") {
          showSuccess("Removed from favourites", { durationMs: 1500 });
        }
        return true;
      } catch (err) {
        const errorMsg = err?.response?.data?.detail || err?.message || "Failed to remove favorite";
        setError(errorMsg);
        if (typeof setActionError === "function") setActionError(errorMsg);
        console.error("Error removing favorite:", err);
        return false;
      }
    },
    [isAuthenticated, favouriteIdByFilm, fetchFavorites, showSuccess, setActionError]
  );

  // Toggle favorite status
  const toggleFavorite = useCallback(
    async (filmId) => {
      const isFav = favorites.has(filmId);
      const ok = await (isFav ? removeFavorite(filmId) : addFavorite(filmId));
      if (ok) {
        // Background re-sync to avoid flashing spinners
        fetchFavorites({ background: true });
      }
      return ok;
    },
    [favorites, addFavorite, removeFavorite, fetchFavorites]
  );

  // Check if a specific film is favorited
  const isFavorited = useCallback(
    (filmId) => {
      return favorites.has(filmId);
    },
    [favorites]
  );

  const value = {
    favorites,
    favoriteFilms,
    isLoading,
    error,
    fetchFavorites,
    addFavorite,
    removeFavorite,
    toggleFavorite,
    isFavorited,
  };

  return (
    <FavoritesContext.Provider value={value}>
      {children}
    </FavoritesContext.Provider>
  );
}
