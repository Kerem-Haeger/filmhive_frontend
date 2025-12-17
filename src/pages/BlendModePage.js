import { useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import {
  Container,
  Row,
  Col,
  Button,
  Spinner,
  Alert,
  Form,
  Card,
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
    <div>
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
        <div className="mb-3 p-3 bg-light rounded" style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
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
            <ListGroup style={{ maxHeight: "300px", overflowY: "auto" }}>
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
      <Card className="h-100 shadow-sm" style={{ borderRadius: "0.25rem", overflow: "hidden" }}>
        <Card.Img
          variant="top"
          src={buildPosterUrl(poster_path) || FALLBACK_POSTER_URL}
          alt={title}
          style={{ height: "200px", objectFit: "cover" }}
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = FALLBACK_POSTER_URL;
          }}
        />
        <Card.Body>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem" }}>
            <Badge bg="success">{Math.round(score * 100)}%</Badge>
            <span style={{ fontSize: "0.85rem", color: "#28a745" }}>Match</span>
          </div>
          <Card.Title style={{ fontSize: "1rem" }}>{title}</Card.Title>
          {year && <small className="text-muted d-block mb-2">{year}</small>}
          {critic_score && (
            <Badge bg="info" className="mb-2">
              Rating: {parseFloat(critic_score).toFixed(1)}
            </Badge>
          )}
          {reasons && reasons.length > 0 && (
            <div style={{ fontSize: "0.8rem", color: "#6c757d", lineHeight: "1.4", marginTop: "0.5rem" }}>
              {reasons.slice(0, 2).map((reason, idx) => (
                <div key={idx} style={{ marginBottom: "0.25rem" }}>
                  • {reason}
                </div>
              ))}
            </div>
          )}
        </Card.Body>
      </Card>
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
  const [limit, setLimit] = useState(20);
  const [hasSearched, setHasSearched] = useState(false);

  // Redirect to login
  if (!isBooting && !isAuthenticated) {
    return (
      <Container className="py-5">
        <div className="text-center">
          <h2 className="mb-3">Please Log In</h2>
          <p className="mb-4">You must be logged in to use Blend Mode.</p>
          <Button
            variant="dark"
            onClick={() => navigate("/login", { state: { from: "/blend-mode" } })}
          >
            Go to Login
          </Button>
        </div>
      </Container>
    );
  }

  const canSearch = filmA && filmB && filmA.id !== filmB.id;

  const handleSearch = () => {
    if (canSearch) {
      setHasSearched(true);
      fetchCompromise(filmA.id, filmB.id, alpha, limit);
    }
  };

  const handleReset = () => {
    setFilmA(null);
    setFilmB(null);
    setAlpha(0.5);
    setLimit(20);
    setHasSearched(false);
    clearResults();
  };

  return (
    <Container className="py-5">
      <Row className="mb-5">
        <Col>
          <h1 className="mb-2">🎬 Blend Mode</h1>
          <p className="text-muted">
            Find your perfect film by blending two movies. Select Film A and Film B, and we'll find films that match both!
          </p>
        </Col>
      </Row>

      {/* Film Selection */}
      <Row className="mb-4">
        <Col md={6} className="mb-4 mb-md-0">
          <Card className="h-100">
            <Card.Header className="bg-light">
              <h5 className="mb-0">Film A</h5>
            </Card.Header>
            <Card.Body>
              <FilmSearchInput
                label="Select Film A"
                onFilmSelect={setFilmA}
                selectedFilmId={filmB?.id}
              />
            </Card.Body>
          </Card>
        </Col>
        <Col md={6}>
          <Card className="h-100">
            <Card.Header className="bg-light">
              <h5 className="mb-0">Film B</h5>
            </Card.Header>
            <Card.Body>
              <FilmSearchInput
                label="Select Film B"
                onFilmSelect={setFilmB}
                selectedFilmId={filmA?.id}
              />
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Controls */}
      {filmA && filmB && (
        <>
          <Row className="mb-4">
            <Col md={6} className="mb-4 mb-md-0">
              <Card>
                <Card.Header className="bg-light">
                  <h6 className="mb-0">Weight (α)</h6>
                </Card.Header>
                <Card.Body>
                  <Form.Group>
                    <Form.Label className="mb-3">
                      Favor Film {alpha < 0.5 ? "A" : alpha > 0.5 ? "B" : "A & B"}
                      <Badge bg="secondary" className="ms-2">
                        {(alpha * 100).toFixed(0)}%
                      </Badge>
                    </Form.Label>
                    <input
                      type="range"
                      className="form-range"
                      value={alpha}
                      onChange={(e) => setAlpha(parseFloat(e.target.value))}
                      min="0"
                      max="1"
                      step="0.05"
                    />
                    <small className="text-muted d-block mt-2">
                      0.5 = balanced | &lt;0.5 = favor A | &gt;0.5 = favor B
                    </small>
                  </Form.Group>
                </Card.Body>
              </Card>
            </Col>
            <Col md={6}>
              <Card>
                <Card.Header className="bg-light">
                  <h6 className="mb-0">Results</h6>
                </Card.Header>
                <Card.Body>
                  <Form.Group>
                    <Form.Label>How many films to show?</Form.Label>
                    <Form.Control
                      type="number"
                      min="1"
                      max="50"
                      value={limit}
                      onChange={(e) =>
                        setLimit(Math.min(50, Math.max(1, parseInt(e.target.value) || 1)))
                      }
                    />
                    <small className="text-muted d-block mt-2">Maximum: 50 results</small>
                  </Form.Group>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          {/* Action Buttons */}
          <Row className="mb-4">
            <Col className="d-flex gap-2">
              <Button
                variant="primary"
                size="lg"
                onClick={handleSearch}
                disabled={!canSearch || isLoading}
                style={{ flex: 1 }}
              >
                {isLoading ? (
                  <>
                    <Spinner animation="border" size="sm" className="me-2" />
                    Finding...
                  </>
                ) : (
                  "Find Compromise Films"
                )}
              </Button>
              <Button
                variant="outline-secondary"
                size="lg"
                onClick={handleReset}
                disabled={isLoading}
              >
                Reset
              </Button>
            </Col>
          </Row>
        </>
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
        <>
          <Row className="mb-3">
            <Col>
              <h3>
                Compromise Films{" "}
                <Badge bg="success">{results.meta?.returned || 0}</Badge>
              </h3>
              {results.meta && (
                <small className="text-muted">
                  α: {results.meta.alpha.toFixed(2)} | Showing {results.meta.returned} of {results.meta.limit} results
                </small>
              )}
            </Col>
          </Row>

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
        </>
      )}

      {!hasSearched && filmA && filmB && (
        <Alert variant="info">💡 Ready to blend? Click "Find Compromise Films" to see results!</Alert>
      )}
    </Container>
  );
}

export default BlendModePage;
