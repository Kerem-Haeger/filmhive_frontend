import { useContext, useEffect } from "react";
import { Button, Col, Form, Row, Spinner, Alert } from "react-bootstrap";
import { Link, useSearchParams } from "react-router-dom";
import { useWatchlists } from "../hooks/useWatchlists";
import { AuthContext } from "../context/AuthContext";
import { buildPosterUrl } from "../utils/imageUtils";
import { FALLBACK_POSTER_URL } from "../utils/constants";

function WatchlistsPage() {
  const { isAuthenticated } = useContext(AuthContext);
  const {
    items,
    listNames,
    isLoading,
    isMutating,
    error,
    loadWatchlists,
    removeFromWatchlist,
  } = useWatchlists();
  const [searchParams, setSearchParams] = useSearchParams();

  const selectedName = searchParams.get("name") || "Watchlist";

  useEffect(() => {
    if (isAuthenticated) {
      loadWatchlists({ background: false });
    }
  }, [isAuthenticated, loadWatchlists]);

  useEffect(() => {
    if (!listNames.length) return;
    if (!selectedName || !listNames.includes(selectedName)) {
      setSearchParams({ name: listNames[0] }, { replace: true });
    }
  }, [listNames, selectedName, setSearchParams]);

  if (!isAuthenticated) {
    return (
      <div>
        <h1 className="fh-page-title mb-3">Watchlists</h1>
        <p className="text-muted">Please log in to manage your watchlists.</p>
        <Button as={Link} to="/login" variant="dark">
          Login
        </Button>
      </div>
    );
  }

  const currentItems = items.filter((it) =>
    selectedName ? it.name === selectedName : true
  );

  return (
    <div>
      <h1 className="fh-page-title mb-3">Watchlists</h1>

      <Row className="align-items-end mb-3 g-3">
        <Col md={6} lg={4}>
          <Form.Group controlId="watchlistSelector">
            <Form.Label className="fw-bold">Select a list</Form.Label>
            <Form.Control
              as="select"
              value={selectedName}
              onChange={(e) => setSearchParams({ name: e.target.value })}
              disabled={!listNames.length}
            >
              {listNames.length === 0 && <option value="">No lists yet</option>}
              {listNames.map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </Form.Control>
          </Form.Group>
        </Col>
      </Row>

      {isLoading && (
        <div className="d-flex justify-content-center py-4">
          <Spinner animation="border" role="status" />
        </div>
      )}

      {error && <Alert variant="danger">{error}</Alert>}

      {!isLoading && listNames.length === 0 && (
        <div className="py-4">
          <p className="text-muted mb-3">
            You haven't added any films to a watchlist yet. Add films from a Film
            Detail page to populate your lists.
          </p>
          <Button as={Link} to="/films" variant="dark">
            Browse films
          </Button>
        </div>
      )}

      {!isLoading && listNames.length > 0 && currentItems.length === 0 && (
        <div className="py-4">
          <p className="text-muted mb-0">This list is empty.</p>
        </div>
      )}

      {!isLoading && currentItems.length > 0 && (
        <div className="d-flex flex-column gap-3">
          {currentItems.map((item) => {
            const film = item.film;
            const title = film?.title || "View film";
            const year = film?.year;
            const posterUrl = buildPosterUrl(film?.poster_path) || FALLBACK_POSTER_URL;
            return (
              <div
                key={item.id}
                className="d-flex align-items-center bg-dark rounded p-2 shadow-sm"
              >
                <div style={{ width: "72px" }} className="flex-shrink-0">
                  <Link to={`/films/${item.film_id}`}>
                    <img
                      src={posterUrl}
                      alt={`${title} poster`}
                      className="img-fluid rounded"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = FALLBACK_POSTER_URL;
                      }}
                    />
                  </Link>
                </div>
                <div className="ms-3 flex-grow-1">
                  <h5 className="mb-1">
                    <Link to={`/films/${item.film_id}`}>{title}</Link>
                  </h5>
                  <div className="text-muted small">
                    {selectedName}
                    {year ? ` • ${year}` : ""}
                  </div>
                </div>
                <div className="ms-3">
                  <Button
                    size="sm"
                    variant="outline-danger"
                    disabled={isMutating}
                    onClick={() => removeFromWatchlist(item.id)}
                  >
                    Remove
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default WatchlistsPage;
