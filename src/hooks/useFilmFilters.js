import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";

export function useFilmFilters() {
  const [searchParams, setSearchParams] = useSearchParams();

  // Get initial values from URL
  const [sortBy, setSortBy] = useState(searchParams.get("sort") || "");
  const [selectedGenres, setSelectedGenres] = useState(() => {
    const genres = searchParams.get("genres");
    return genres ? genres.split(",") : [];
  });
  const [yearRange, setYearRange] = useState(() => {
    const min = searchParams.get("yearMin");
    const max = searchParams.get("yearMax");
    return { min: min || "", max: max || "" };
  });

  // Sync URL with state
  useEffect(() => {
    const params = {};
    
    if (sortBy) {
      params.sort = sortBy;
    }
    
    if (selectedGenres.length > 0) {
      params.genres = selectedGenres.join(",");
    }
    
    if (yearRange.min) params.yearMin = yearRange.min;
    if (yearRange.max) params.yearMax = yearRange.max;
    
    // Preserve existing search query
    const q = searchParams.get("q");
    if (q) params.q = q;
    
    setSearchParams(params, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sortBy, selectedGenres, yearRange]);

  const toggleGenre = (genre) => {
    setSelectedGenres((prev) =>
      prev.includes(genre)
        ? prev.filter((g) => g !== genre)
        : [...prev, genre]
    );
  };

  const resetFilters = () => {
    setSortBy("");
    setSelectedGenres([]);
    setYearRange({ min: "", max: "" });
  };

  const hasActiveFilters =
    sortBy ||
    selectedGenres.length > 0 ||
    yearRange.min ||
    yearRange.max;

  const activeFilterCount =
    (sortBy ? 1 : 0) +
    selectedGenres.length +
    (yearRange.min ? 1 : 0) +
    (yearRange.max ? 1 : 0);

  return {
    sortBy,
    setSortBy,
    selectedGenres,
    toggleGenre,
    yearRange,
    setYearRange,
    resetFilters,
    hasActiveFilters,
    activeFilterCount,
  };
}
