import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import api from "../services/api";
import { Row, Col, Spinner, Form, Button, Badge, Alert } from "react-bootstrap";
import FilmCard from "../components/FilmCard";
import FilterBar from "../components/filters/FilterBar";
import { useFilmFilters } from "../hooks/useFilmFilters";

function FilmsPage() {
  const [films, setFilms] = useState([]);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState("");
  const [nextUrl, setNextUrl] = useState("/films/");
  const [hasMore, setHasMore] = useState(true);

  const [searchParams, setSearchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState(searchParams.get("q") || "");
  const [showFilters, setShowFilters] = useState(false);

  const sentinelRef = useRef(null);

  // Filter/sort hook
  const {
    sortBy,
    setSortBy,
    selectedGenres,
    toggleGenre,
    yearRange,
    setYearRange,
    resetFilters,
    activeFilterCount,
  } = useFilmFilters();

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

      const newFilms = Array.isArray(data) ? data : data.results || [];
      const newNext = Array.isArray(data) ? null : data.next || null;

      setFilms((prev) => (isFirstPage ? newFilms : [...prev, ...newFilms]));
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

  // initial load
  useEffect(() => {
    fetchPage("/films/", true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // keep searchTerm in sync with URL (handles Back/Forward)
  useEffect(() => {
    const q = searchParams.get("q") || "";
    setSearchTerm(q);
  }, [searchParams]);

  // infinite scroll observer
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

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);

    const trimmed = value.trim();
    if (trimmed) {
      setSearchParams({ q: trimmed });
    } else {
      setSearchParams({});
    }
  };

  const handleClearSearch = () => {
    setSearchTerm("");
    setSearchParams({});
  };

  if (isInitialLoading) {
    return (
      <div className="d-flex justify-content-center py-5">
        <Spinner animation="border" role="status">
          <span className="sr-only">Loading films...</span>
        </Spinner>
      </div>
    );
  }

  if (error) {
    return (
      <div className="d-flex justify-content-center py-5">
        <p className="text-danger mb-0">{error}</p>
      </div>
    );
  }

  if (!films.length) {
    return (
      <div className="d-flex justify-content-center py-5">
        <p className="mb-0">No films found.</p>
      </div>
    );
  }

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

  return (
    <>
      <h1 className="fh-page-title mb-3">Browse films</h1>

      <div className="d-flex flex-column flex-md-row align-items-start gap-3" style={{ marginBottom: sortedFilms.length !== films.length ? '2rem' : '1rem' }}>
        <div className="flex-grow-1 position-relative">
          <Form onSubmit={(e) => e.preventDefault()}>
            <div className="input-group">
              <Form.Control
                type="search"
                placeholder="Search by title, year, genre, people..."
                value={searchTerm}
                onChange={handleSearchChange}
              />
              {searchTerm && (
                <div className="input-group-append">
                  <Button
                    variant="outline-secondary"
                    type="button"
                    onClick={handleClearSearch}
                  >
                    Clear
                  </Button>
                </div>
              )}
            </div>
          </Form>
          {sortedFilms.length !== films.length && (
            <small className="text-muted position-absolute" style={{ top: '100%', left: 0, marginTop: '4px' }}>
              {sortedFilms.length} {sortedFilms.length === 1 ? 'film' : 'films'} found
            </small>
          )}
        </div>

        <div className="d-flex align-items-end gap-2 flex-shrink-0">
          <div style={{ minWidth: "180px" }}>
            <Form.Control
              as="select"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="">Sort by...</option>
              <option value="title">Title (A-Z)</option>
              <option value="year_desc">Year (Newest)</option>
              <option value="year_asc">Year (Oldest)</option>
              <option value="rating_desc">Rating (Highest)</option>
              <option value="rating_asc">Rating (Lowest)</option>
              <option value="popularity_desc">Popularity</option>
            </Form.Control>
          </div>

          <Button
            variant="outline-light"
            onClick={() => setShowFilters(!showFilters)}
          >
            {showFilters ? "Hide" : "Show"} Filters
            {activeFilterCount > 0 && (
              <Badge bg="warning" className="ms-2">
                {activeFilterCount}
              </Badge>
            )}
          </Button>

          {activeFilterCount > 0 && (
            <Button
              variant="outline-danger"
              onClick={resetFilters}
            >
              Clear All
            </Button>
          )}
        </div>
      </div>

      {showFilters && (
        <div className="border rounded p-3 mb-3" style={{ backgroundColor: "rgba(0,0,0,0.3)" }}>
          <Row>
            <Col md={8}>
              <Form.Group className="mb-3">
                <Form.Label className="fw-bold">Genres</Form.Label>
                <div className="d-flex flex-wrap gap-2">
                  {availableGenres.map((genre) => (
                    <Button
                      key={genre}
                      variant={
                        selectedGenres.includes(genre)
                          ? "info"
                          : "outline-secondary"
                      }
                      size="sm"
                      onClick={() => toggleGenre(genre)}
                    >
                      {genre}
                    </Button>
                  ))}
                </div>
              </Form.Group>
            </Col>

            <Col md={4}>
              <Form.Group className="mb-0">
                <Form.Label className="fw-bold">Year Range</Form.Label>
                <div className="d-flex gap-2 align-items-center">
                  <Form.Control
                    type="number"
                    placeholder="Min"
                    value={yearRange?.min || ""}
                    onChange={(e) =>
                      setYearRange({ ...yearRange, min: e.target.value })
                    }
                    size="sm"
                    min="1900"
                    max={new Date().getFullYear()}
                  />
                  <span>to</span>
                  <Form.Control
                    type="number"
                    placeholder="Max"
                    value={yearRange?.max || ""}
                    onChange={(e) =>
                      setYearRange({ ...yearRange, max: e.target.value })
                    }
                    size="sm"
                    min="1900"
                    max={new Date().getFullYear()}
                  />
                </div>
              </Form.Group>
            </Col>
          </Row>
        </div>
      )}

      {sortedFilms.length === 0 ? (
        <Alert variant="info">
          No films match your criteria. Try adjusting your filters or search.
        </Alert>
      ) : (
        <>
          <Row>
            {sortedFilms.map((film) => (
              <Col
                key={film.id}
                xs={12}
                sm={6}
                md={4}
                lg={3}
                className="mb-4"
              >
                <FilmCard film={film} />
              </Col>
            ))}
          </Row>

          {/* sentinel for infinite scroll */}
          <div ref={sentinelRef} />

          {/* loading spinner for extra pages */}
          {isLoadingMore && (
            <div className="d-flex justify-content-center py-3">
              <Spinner animation="border" role="status">
                <span className="sr-only">Loading more films...</span>
              </Spinner>
            </div>
          )}
        </>
      )}
    </>
  );
}

export default FilmsPage;
