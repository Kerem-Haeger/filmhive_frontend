import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Row, Col, Spinner, Button, Badge, Alert } from "react-bootstrap";
import FilmCard from "../components/FilmCard";
import SearchBar from "../components/films/SearchBar";
import SortControl from "../components/films/SortControl";
import FilterBar from "../components/filters/FilterBar";
import { useInfiniteScroll } from "../hooks/useInfiniteScroll";
import { useFilmFilters } from "../hooks/useFilmFilters";
import { useFilmSearch } from "../hooks/useFilmSearch";
import AuthCtaBanner from "../components/common/AuthCtaBanner";
import ScrollToTop from "../components/common/ScrollToTop";

function FilmsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState(searchParams.get("q") || "");
  const [showFilters, setShowFilters] = useState(false);

  // Infinite scroll for films data
  const {
    items: films,
    isInitialLoading,
    isLoadingMore,
    error,
    sentinelRef,
  } = useInfiniteScroll("/films/");

  // Filter/sort state
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

  // Apply search, filters, and sorting
  const { filteredAndSortedFilms, availableGenres } = useFilmSearch(
    films,
    searchTerm,
    selectedGenres,
    yearRange,
    sortBy
  );

  // Keep searchTerm in sync with URL (handles Back/Forward)
  useEffect(() => {
    const q = searchParams.get("q") || "";
    setSearchTerm(q);
  }, [searchParams]);

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

  // Loading state
  if (isInitialLoading) {
    return (
      <div className="d-flex justify-content-center py-5">
        <Spinner animation="border" role="status">
          <span className="sr-only">Loading films...</span>
        </Spinner>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="d-flex justify-content-center py-5">
        <Alert variant="danger" className="mb-0">{error}</Alert>
      </div>
    );
  }

  // Empty state
  if (!films.length) {
    return (
      <div className="d-flex justify-content-center py-5">
        <p className="mb-0">No films found.</p>
      </div>
    );
  }

  const hasActiveFiltersOrSearch = filteredAndSortedFilms.length !== films.length;

  return (
    <>
      <AuthCtaBanner />
      <h1 className="fh-page-title mb-3">Browse films</h1>

      <div
        className={`d-flex flex-column flex-md-row align-items-start gap-3 ${hasActiveFiltersOrSearch ? 'fh-margin-conditional-active' : 'fh-margin-conditional'}`}
      >
        <div className="mb-4 mb-md-0 flex-grow-1">
          <SearchBar
            searchTerm={searchTerm}
            onSearchChange={handleSearchChange}
            onClear={handleClearSearch}
            resultCount={filteredAndSortedFilms.length}
            totalCount={films.length}
          />
        </div>

        <div className="d-flex align-items-center gap-2 flex-shrink-0 fh-search-actions">
          <SortControl sortBy={sortBy} onSortChange={setSortBy} />

          <Button
            variant="outline-light"
            onClick={() => setShowFilters(!showFilters)}
          >
            {showFilters ? "Hide" : "Show"} Filters
            {activeFilterCount > 0 && (
              <Badge variant="warning" className="ms-2">
                {activeFilterCount}
              </Badge>
            )}
          </Button>

          {activeFilterCount > 0 && (
            <Button variant="outline-danger" onClick={resetFilters}>
              Clear All
            </Button>
          )}
        </div>
      </div>

      <FilterBar
        show={showFilters}
        selectedGenres={selectedGenres}
        onGenreToggle={toggleGenre}
        yearRange={yearRange}
        onYearRangeChange={setYearRange}
        availableGenres={availableGenres}
      />

      {filteredAndSortedFilms.length === 0 ? (
        <Alert variant="info">
          No films match your criteria. Try adjusting your filters or search.
        </Alert>
      ) : (
        <>
          <Row>
            {filteredAndSortedFilms.map((film) => (
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

          {/* Sentinel for infinite scroll */}
          <div ref={sentinelRef} />

          {/* Loading spinner for extra pages */}
          {isLoadingMore && (
            <div className="d-flex justify-content-center py-3">
              <Spinner animation="border" role="status">
                <span className="sr-only">Loading more films...</span>
              </Spinner>
            </div>
          )}
        </>
      )}
      <ScrollToTop />
    </>
  );
}

export default FilmsPage;
