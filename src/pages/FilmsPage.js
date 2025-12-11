import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import api from "../services/api";
import { Row, Col, Spinner, Form, Button } from "react-bootstrap";
import FilmCard from "../components/FilmCard";

function FilmsPage() {
  const [films, setFilms] = useState([]);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState("");
  const [nextUrl, setNextUrl] = useState("/films/");
  const [hasMore, setHasMore] = useState(true);

  const [searchParams, setSearchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState(searchParams.get("q") || "");

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

  const trimmedSearch = searchTerm.trim().toLowerCase();

  const filteredFilms = trimmedSearch
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

  return (
    <>
      <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between mb-3">
        <h1 className="fh-page-title mb-3 mb-md-0">Browse films</h1>

        <Form
          className="w-100 w-md-auto"
          onSubmit={(e) => e.preventDefault()}
        >
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
      </div>

      {filteredFilms.length === 0 ? (
        <p>No films match your search.</p>
      ) : (
        <>
          <Row>
            {filteredFilms.map((film) => (
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
