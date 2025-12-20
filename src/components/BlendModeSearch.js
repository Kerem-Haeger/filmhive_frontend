import { useState, useEffect } from "react";
import { Form, ListGroup, Spinner } from "react-bootstrap";
import { buildPosterUrl } from "../utils/imageUtils";
import { FALLBACK_POSTER_URL } from "../utils/constants";
import api from "../services/api";

function BlendModeSearch({ label, onFilmSelect, selectedFilmId }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [results, setResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedFilm, setSelectedFilm] = useState(null);

  useEffect(() => {
    if (!searchTerm.trim()) {
      setResults([]);
      return;
    }

    const debounceTimer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const response = await api.get("/films/", {
          params: { search: searchTerm, limit: 10 },
        });
        const films = Array.isArray(response.data?.results)
          ? response.data.results
          : Array.isArray(response.data)
          ? response.data
          : [];
        setResults(films);
      } catch (err) {
        console.error("Search error:", err);
        setResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [searchTerm]);

  const handleSelectFilm = (film) => {
    setSelectedFilm(film);
    setSearchTerm("");
    setResults([]);
    onFilmSelect(film);
  };

  return (
    <div className="blend-mode-search">
      <Form.Group className="mb-3">
        <Form.Label>{label}</Form.Label>
        <Form.Control
          type="text"
          placeholder="Search for a film..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          aria-label={label}
        />
      </Form.Group>

      {selectedFilm && (
        <div className="selected-film mb-3 p-3 bg-light rounded">
          <div className="d-flex align-items-center">
            <img
              src={buildPosterUrl(selectedFilm.poster_path, "w185") || FALLBACK_POSTER_URL}
              alt={selectedFilm.title}
              className="selected-film-poster me-3"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = FALLBACK_POSTER_URL;
              }}
            />
            <div className="flex-grow-1">
              <h6 className="mb-1">{selectedFilm.title}</h6>
              {selectedFilm.year && (
                <small className="text-muted">{selectedFilm.year}</small>
              )}
            </div>
            <button
              className="btn btn-sm btn-outline-secondary"
              onClick={() => {
                setSelectedFilm(null);
                setSearchTerm("");
                onFilmSelect(null);
              }}
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {searchTerm && (
        <div className="search-results">
          {isSearching ? (
            <div className="text-center py-3">
              <Spinner
                animation="border"
                size="sm"
                role="status"
                className="mr-2"
              >
                <span className="sr-only">Searching...</span>
              </Spinner>
            </div>
          ) : results.length > 0 ? (
            <ListGroup className="blend-mode-search-results">
              {results.map((film) => (
                <ListGroup.Item
                  key={film.id}
                  className="d-flex align-items-center fh-cursor-pointer"
                  onClick={() => handleSelectFilm(film)}
                  disabled={selectedFilmId === film.id}
                >
                  <img
                    src={buildPosterUrl(film.poster_path, "w92") || FALLBACK_POSTER_URL}
                    alt={film.title}
                    className="search-result-poster me-3"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = FALLBACK_POSTER_URL;
                    }}
                  />
                  <div className="flex-grow-1">
                    <h6 className="mb-1">{film.title}</h6>
                    {film.year && (
                      <small className="text-muted">{film.year}</small>
                    )}
                  </div>
                </ListGroup.Item>
              ))}
            </ListGroup>
          ) : (
            <div className="text-center py-3 text-muted">
              No films found. Try a different search.
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default BlendModeSearch;
