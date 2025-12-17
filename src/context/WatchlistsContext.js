import { createContext, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useContext as useReactContext } from "react";
import api from "../services/api";
import { AuthContext } from "./AuthContext";
import { NotificationContext } from "./NotificationContext";
import { filmService } from "../services/filmService";

export const WatchlistsContext = createContext(null);

function normalizeItems(data) {
  if (!data) return [];
  if (Array.isArray(data)) return data;
  if (Array.isArray(data.results)) return data.results;
  return [];
}

export function WatchlistsProvider({ children }) {
  const { isAuthenticated, isBooting } = useReactContext(AuthContext);
  const { showSuccess, setActionError } = useReactContext(NotificationContext) || {};

  const [items, setItems] = useState([]);
  const [filmCache, setFilmCache] = useState(new Map());
  const filmCacheRef = useRef(new Map());
  const [isLoading, setIsLoading] = useState(false);
  const [isMutating, setIsMutating] = useState(false);
  const [error, setError] = useState("");

  const hydrateFilms = useCallback(async (filmIds) => {
    const ids = Array.from(new Set(filmIds)).filter(Boolean);
    const missing = ids.filter((id) => !filmCacheRef.current.has(id));
    if (missing.length === 0) return;

    const results = await Promise.all(
      missing.map(async (id) => {
        try {
          return await filmService.getFilmById(id);
        } catch (e) {
          return null;
        }
      })
    );

    setFilmCache((prev) => {
      const next = new Map(prev);
      missing.forEach((id, idx) => {
        const film = results[idx];
        if (film) next.set(id, film);
      });
      filmCacheRef.current = next;
      return next;
    });
  }, []);

  const loadWatchlists = useCallback(
    async (opts = {}) => {
      const { name, background } = opts;
      if (!isAuthenticated) {
        setItems([]);
        setFilmCache(new Map());
        filmCacheRef.current = new Map();
        return;
      }

      if (!background) setIsLoading(true);
      setError("");
      try {
        const config = name ? { params: { name } } : undefined;
        const res = await api.get("/watchlist/", config);
        const nextItems = normalizeItems(res.data).map((it) => ({
          ...it,
          film_id: it.film_id || it.film || it.filmId,
          name: it.name || "Watchlist",
        }));
        setItems(nextItems);
        await hydrateFilms(nextItems.map((it) => it.film_id));
      } catch (err) {
        const msg = err?.response?.data?.detail || err?.message || "Failed to load watchlists";
        setError(msg);
        if (typeof setActionError === "function") setActionError(msg);
      } finally {
        if (!background) setIsLoading(false);
      }
    },
    [isAuthenticated, hydrateFilms, setActionError]
  );

  useEffect(() => {
    if (isAuthenticated && !isBooting) {
      loadWatchlists({ background: false });
    } else if (!isAuthenticated && !isBooting) {
      setItems([]);
      setFilmCache(new Map());
      filmCacheRef.current = new Map();
      setError("");
    }
  }, [isAuthenticated, isBooting, loadWatchlists]);

  const addToWatchlist = useCallback(
    async (filmId, name = "Watchlist", opts = {}) => {
      if (!isAuthenticated) {
        const msg = "Must be logged in to use watchlists";
        setError(msg);
        if (typeof setActionError === "function") setActionError(msg);
        return false;
      }

      const payload = {
        // Support both API shapes (film_id or film)
        film_id: filmId,
        film: filmId,
        name: name?.trim() || "Watchlist",
      };
      if (opts.is_private !== undefined) payload.is_private = opts.is_private;
      if (opts.position !== undefined) payload.position = opts.position;

      setIsMutating(true);
      setError("");
      try {
        const res = await api.post("/watchlist/", payload);
        const created = {
          ...res.data,
          film_id: res.data?.film_id || res.data?.film || filmId,
          name: res.data?.name || payload.name,
        };
        setItems((prev) => [...prev, created]);
        await hydrateFilms([created.film_id]);
        if (typeof showSuccess === "function") {
          showSuccess("Added to watchlist", { durationMs: 1500 });
        }
        // Background refresh to stay in sync (handles pagination or server-side defaults)
        loadWatchlists({ background: true });
        return true;
      } catch (err) {
        let msg = err?.response?.data?.detail || err?.message || "Failed to add to watchlist";
        const data = err?.response?.data;
        if (data && typeof data === "object" && !Array.isArray(data)) {
          const parts = [];
          Object.keys(data).forEach((key) => {
            const val = data[key];
            if (Array.isArray(val)) parts.push(`${key}: ${val.join(", ")}`);
            else if (typeof val === "string") parts.push(`${key}: ${val}`);
          });
          if (parts.length) msg = parts.join("; ");
        }
        setError(msg);
        if (typeof setActionError === "function") setActionError(msg);
        return false;
      } finally {
        setIsMutating(false);
      }
    },
    [isAuthenticated, hydrateFilms, loadWatchlists, setActionError, showSuccess]
  );

  const removeFromWatchlist = useCallback(
    async (itemId) => {
      if (!isAuthenticated) {
        const msg = "Must be logged in to use watchlists";
        setError(msg);
        if (typeof setActionError === "function") setActionError(msg);
        return false;
      }

      setIsMutating(true);
      setError("");
      try {
        await api.delete(`/watchlist/${itemId}/`);
        setItems((prev) => prev.filter((it) => it.id !== itemId));
        if (typeof showSuccess === "function") {
          showSuccess("Removed from watchlist", { durationMs: 1500 });
        }
        return true;
      } catch (err) {
        const msg = err?.response?.data?.detail || err?.message || "Failed to remove from watchlist";
        setError(msg);
        if (typeof setActionError === "function") setActionError(msg);
        return false;
      } finally {
        setIsMutating(false);
      }
    },
    [isAuthenticated, setActionError, showSuccess]
  );

  const listNames = useMemo(() => {
    const names = new Set();
    items.forEach((it) => names.add(it.name || "Watchlist"));
    return Array.from(names).sort((a, b) => a.localeCompare(b));
  }, [items]);

  const itemsWithFilms = useMemo(
    () => items.map((it) => ({ ...it, film: filmCache.get(it.film_id) })),
    [items, filmCache]
  );

  const getItemsForName = useCallback(
    (name) => {
      const target = name || null;
      return itemsWithFilms.filter((it) => (target ? it.name === target : true));
    },
    [itemsWithFilms]
  );

  const getListsForFilm = useCallback(
    (filmId) => {
      const names = new Set();
      items.forEach((it) => {
        if (it.film_id === filmId) names.add(it.name || "Watchlist");
      });
      return Array.from(names);
    },
    [items]
  );

  const isFilmInList = useCallback(
    (filmId, name) => items.some((it) => it.film_id === filmId && (!name || it.name === name)),
    [items]
  );

  const value = useMemo(() => ({
    items: itemsWithFilms,
    listNames,
    isLoading,
    isMutating,
    error,
    loadWatchlists,
    addToWatchlist,
    removeFromWatchlist,
    getItemsForName,
    getListsForFilm,
    isFilmInList,
  }), [itemsWithFilms, listNames, isLoading, isMutating, error, loadWatchlists, addToWatchlist, removeFromWatchlist, getItemsForName, getListsForFilm, isFilmInList]);

  return (
    <WatchlistsContext.Provider value={value}>
      {children}
    </WatchlistsContext.Provider>
  );
}
