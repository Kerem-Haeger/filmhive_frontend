import { useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import {
  Row,
  Col,
  Button,
  Spinner,
  Alert,
  Form,
  Badge,
  ListGroup,
} from "react-bootstrap";
import { AuthContext } from "../context/AuthContext";
import { useBlendMode } from "../hooks/useBlendMode";
import { buildPosterUrl } from "../utils/imageUtils";
import { FALLBACK_POSTER_URL } from "../utils/constants";
import api from "../services/api";
import "./BlendModePage.css";

// Search Input Component
function FilmSearchInput({ label, onFilmSelect, selectedFilmId }) {
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
    <div className="film-search-wrapper">
      <Form.Group className="mb-3">
        <Form.Label>{label}</Form.Label>
        <Form.Control
          type="text"
          placeholder="Search for a film..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </Form.Group>

      {selectedFilm && (
        <div className="selected-film-card">
          <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
            <img
              src={buildPosterUrl(selectedFilm.poster_path) || FALLBACK_POSTER_URL}
              alt={selectedFilm.title}
              style={{ height: "80px", objectFit: "cover", borderRadius: "0.25rem" }}
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = FALLBACK_POSTER_URL;
              }}
            />
            <div style={{ flex: 1 }}>
              <h6 className="mb-1">{selectedFilm.title}</h6>
              {selectedFilm.year && <small className="text-muted">{selectedFilm.year}</small>}
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
        <div>
          {isSearching ? (
            <div className="text-center py-3">
              <Spinner animation="border" size="sm" role="status">
                <span className="sr-only">Searching...</span>
              </Spinner>
            </div>
          ) : results.length > 0 ? (
            <ListGroup className="film-search-results">
              {results.map((film) => (
                <ListGroup.Item
                  key={film.id}
                  onClick={() => handleSelectFilm(film)}
                  style={{ cursor: "pointer", display: "flex", alignItems: "center", gap: "0.75rem" }}
                  disabled={selectedFilmId === film.id}
                >
                  <img
                    src={buildPosterUrl(film.poster_path) || FALLBACK_POSTER_URL}
                    alt={film.title}
                    style={{ height: "60px", objectFit: "cover", borderRadius: "0.25rem" }}
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = FALLBACK_POSTER_URL;
                    }}
                  />
                  <div style={{ flex: 1 }}>
                    <h6 className="mb-1">{film.title}</h6>
                    {film.year && <small className="text-muted">{film.year}</small>}
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

// Result Card Component
function CompromiseResult({ result }) {
  const { film, score, reasons } = result;
  const { id, title, year, critic_score, poster_path } = film;

  return (
    <Link to={`/films/${id}`} className="text-decoration-none text-reset">
      <div className="compromise-film-card">
        <img
          className="poster"
          src={buildPosterUrl(poster_path) || FALLBACK_POSTER_URL}
          alt={title}
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = FALLBACK_POSTER_URL;
          }}
        />
        <div className="card-body">
          <div className="match-score">
            <span>{Math.round(score * 100)}%</span>
            <span className="match-score-label">Match</span>
          </div>
          <h5 className="mb-1">{title}</h5>
          {year && <small className="text-muted d-block mb-2">{year}</small>}
          {critic_score && (
            <Badge bg="info" className="mb-2">
              Rating: {parseFloat(critic_score).toFixed(1)}
            </Badge>
          )}
          {reasons && reasons.length > 0 && (
            <div className="reasons">
              <div style={{ fontSize: "0.85rem", marginBottom: "0.5rem", color: "var(--fh-text-muted)" }}>Why this works:</div>
              {reasons.slice(0, 2).map((reason, idx) => (
                <span key={idx} className="reason-badge">
                  {reason}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}

function BlendModePage() {
  const navigate = useNavigate();
  const { isAuthenticated, isBooting } = useContext(AuthContext);
  const { results, isLoading, error, fetchCompromise, clearResults } = useBlendMode();

  const [filmA, setFilmA] = useState(null);
  const [filmB, setFilmB] = useState(null);
  const [alpha, setAlpha] = useState(0.5);
  const [hasSearched, setHasSearched] = useState(false);

  // Redirect to login
  if (!isBooting && !isAuthenticated) {
    return (
      <div className="text-center py-5">
        <h2 className="mb-3">Please Log In</h2>
        <p className="mb-4">You must be logged in to use Blend Mode.</p>
        <Button
          variant="dark"
          onClick={() => navigate("/login", { state: { from: "/blend-mode" } })}
        >
          Go to Login
        </Button>
      </div>
    );
  }

  const canSearch = filmA && filmB && filmA.id !== filmB.id;

  const handleSearch = () => {
    if (canSearch) {
      setHasSearched(true);
      // Invert alpha so slider left = Film A, slider right = Film B
      fetchCompromise(filmA.id, filmB.id, 1 - alpha, 10);
    }
  };

  const handleReset = () => {
    setFilmA(null);
    setFilmB(null);
    setAlpha(0.5);
    setHasSearched(false);
    clearResults();
  };

  return (
    <>
      <h1 className="fh-page-title mb-3">Blend Mode</h1>
      <p className="text-muted mb-4" style={{ maxWidth: "600px" }}>
        Find your perfect film by blending two movies. Select Film A and Film B, and we'll find films that match both!
      </p>

      {/* Film Selection */}
      <Row className="mb-5">
        <Col md={6} className="mb-4 mb-md-0">
          <FilmSearchInput
            label="Film A"
            onFilmSelect={setFilmA}
            selectedFilmId={filmB?.id}
          />
        </Col>
        <Col md={6}>
          <FilmSearchInput
            label="Film B"
            onFilmSelect={setFilmB}
            selectedFilmId={filmA?.id}
          />
        </Col>
      </Row>

      {/* Alpha Slider - Always Visible When Both Films Selected */}
      {filmA && filmB && (
        <Row className="mb-4">
          <Col md={6} className="mx-auto text-center">
            <input
              type="range"
              className="form-range blend-slider"
              value={alpha}
              onChange={(e) => setAlpha(parseFloat(e.target.value))}
              min="0.1"
              max="0.9"
              step="0.05"
            />
            <small className="text-muted d-block mt-2">
              Which choice is more important?
            </small>
          </Col>
        </Row>
      )}

      {/* Action Button */}
      {filmA && filmB && (
        <Row className="mb-5">
          <Col>
            <div className="d-flex gap-2 justify-content-center">
              <Button
                variant="warning"
                onClick={handleSearch}
                disabled={!canSearch || isLoading}
              >
                {isLoading ? (
                  <>
                    <Spinner animation="border" size="sm" className="me-2" />
                    Finding...
                  </>
                ) : (
                  "Find matching films"
                )}
              </Button>
              <Button
                variant="outline-light"
                onClick={handleReset}
                disabled={isLoading}
              >
                Reset
              </Button>
            </div>
          </Col>
        </Row>
      )}

      {/* Error Display */}
      {error && (
        <Alert variant="danger" className="mb-4">
          <Alert.Heading>Error</Alert.Heading>
          <p>{error}</p>
        </Alert>
      )}

      {/* Results */}
      {hasSearched && results && (
        <div className="blend-results-container">
          <h2 className="fh-section-title">Our suggestions</h2>
          {results.meta && (
            <small className="text-muted d-block mb-4">
              Film A {(results.meta.alpha * 100).toFixed(0)}% • Film B {((1 - results.meta.alpha) * 100).toFixed(0)}%
            </small>
          )}

          {results.results?.length > 0 ? (
            <Row className="g-4">
              {results.results.map((result) => (
                <Col xs={12} sm={6} md={4} lg={3} key={result.film.id}>
                  <CompromiseResult result={result} />
                </Col>
              ))}
            </Row>
          ) : (
            <Alert variant="info">No compromise films found. Try adjusting your settings.</Alert>
          )}
        </div>
      )}
    </>
  );
}

export default BlendModePage;
