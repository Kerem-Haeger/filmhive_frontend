import { useState, useEffect, useRef } from "react";
import api from "../services/api";

export function useInfiniteScroll(initialUrl) {
  const [items, setItems] = useState([]);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState("");
  const [nextUrl, setNextUrl] = useState(initialUrl);
  const [hasMore, setHasMore] = useState(true);

  const sentinelRef = useRef(null);

  const fetchPage = async (url, isFirstPage = false) => {
    if (!url) {
      setHasMore(false);
      return;
    }

    try {
      if (isFirstPage) {
        setIsInitialLoading(true);
        setError("");
      } else {
        setIsLoadingMore(true);
      }

      const response = await api.get(url);
      const data = response.data;

      const newItems = Array.isArray(data) ? data : data.results || [];
      const newNext = Array.isArray(data) ? null : data.next || null;

      setItems((prev) => (isFirstPage ? newItems : [...prev, ...newItems]));
      setNextUrl(newNext);
      setHasMore(Boolean(newNext));
    } catch (err) {
      console.error(err);
      if (isFirstPage) {
        setError("Could not load films. Please try again.");
      }
      setHasMore(false);
    } finally {
      if (isFirstPage) {
        setIsInitialLoading(false);
      } else {
        setIsLoadingMore(false);
      }
    }
  };

  // Initial load
  useEffect(() => {
    fetchPage(initialUrl, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Infinite scroll observer
  useEffect(() => {
    if (!hasMore || isInitialLoading || isLoadingMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const first = entries[0];
        if (first.isIntersecting && hasMore && !isLoadingMore) {
          fetchPage(nextUrl, false);
        }
      },
      {
        root: null,
        rootMargin: "200px",
        threshold: 0,
      }
    );

    const current = sentinelRef.current;
    if (current) {
      observer.observe(current);
    }

    return () => {
      if (current) {
        observer.unobserve(current);
      }
      observer.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasMore, isInitialLoading, isLoadingMore, nextUrl]);

  return {
    items,
    isInitialLoading,
    isLoadingMore,
    error,
    sentinelRef,
    hasMore,
  };
}
