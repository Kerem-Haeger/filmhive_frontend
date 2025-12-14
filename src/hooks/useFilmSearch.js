import { useMemo } from "react";

export function useFilmSearch(films, searchTerm, selectedGenres, yearRange, sortBy) {
  return useMemo(() => {
    // Extract available genres
    const availableGenres = Array.from(
      new Set(
        films.flatMap((film) =>
          (film.genres || []).map((g) => g.name || g)
        )
      )
    ).sort();

    // Apply search filter
    const trimmedSearch = searchTerm.trim().toLowerCase();
    let filteredFilms = trimmedSearch
      ? films.filter((film) => {
          const parts = [
            film.title,
            film.year && String(film.year),
            film.overview,
            ...(film.genres || []).map((g) => (g.name || g).toString()),
            ...(film.keywords || []).map((k) => (k.name || k).toString()),
            ...((film.cast || film.people || []).map((p) =>
              (p.name || p.person_name || p).toString()
            )),
          ];

          const searchableText = parts
            .filter(Boolean)
            .join(" ")
            .toLowerCase();

          return searchableText.includes(trimmedSearch);
        })
      : films;

    // Apply genre filter
    if (selectedGenres && selectedGenres.length > 0) {
      filteredFilms = filteredFilms.filter((film) => {
        const filmGenres = (film.genres || []).map((g) => g.name || g);
        return selectedGenres.every((genre) => filmGenres.includes(genre));
      });
    }

    // Apply year range filter
    if (yearRange && (yearRange.min || yearRange.max)) {
      filteredFilms = filteredFilms.filter((film) => {
        const filmYear = film.year;
        if (!filmYear) return false;
        const min = yearRange.min ? parseInt(yearRange.min) : 0;
        const max = yearRange.max ? parseInt(yearRange.max) : 9999;
        return filmYear >= min && filmYear <= max;
      });
    }

    // Apply sorting
    const sortedFilms = sortBy
      ? [...filteredFilms].sort((a, b) => {
          switch (sortBy) {
            case "title":
              return (a.title || "").localeCompare(b.title || "");
            case "year_desc":
              return (b.year || 0) - (a.year || 0);
            case "year_asc":
              return (a.year || 0) - (b.year || 0);
            case "rating_desc":
              return (b.critic_score || 0) - (a.critic_score || 0);
            case "rating_asc":
              return (a.critic_score || 0) - (b.critic_score || 0);
            case "popularity_desc":
              return (b.popularity || 0) - (a.popularity || 0);
            default:
              return 0;
          }
        })
      : filteredFilms;

    return {
      filteredAndSortedFilms: sortedFilms,
      availableGenres,
    };
  }, [films, searchTerm, selectedGenres, yearRange, sortBy]);
}
