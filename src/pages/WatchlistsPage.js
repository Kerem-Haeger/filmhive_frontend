import { useContext, useEffect } from "react";
import { Button, Spinner, Alert } from "react-bootstrap";
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

      {listNames.length > 0 && (
        <div className="mb-4">
          <div className="d-flex flex-wrap gap-2">
            {listNames.map((name) => (
              <Button
                key={name}
                variant={selectedName === name ? "warning" : "outline-secondary"}
                size="sm"
                onClick={() => setSearchParams({ name })}
              >
                {name}
              </Button>
            ))}
          </div>
        </div>
      )}

      {isLoading && (
        <div className="d-flex justify-content-center py-4">
          <Spinner animation="border" role="status" />
        </div>
      )}

      {error && <Alert variant="danger">{error}</Alert>}

      {!isLoading && listNames.length === 0 && (
        <div className="py-4">
          <p className="text-muted mb-3">
            You haven't added any films to a watchlist yet. <Link to="/films">Browse films</Link> to populate your lists.
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
        <div className="d-flex flex-column" style={{ gap: "1rem" }}>
          {currentItems.map((item) => {
            const film = item.film;
            const title = film?.title || "View film";
            const year = film?.year;
            const posterUrl = buildPosterUrl(film?.poster_path) || FALLBACK_POSTER_URL;
            return (
              <div
                key={item.id}
                className="d-flex align-items-center rounded p-2 shadow-sm"
                style={{ backgroundColor: "rgba(52, 58, 64, 0.3)" }}
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
                <div style={{ marginLeft: "1.5rem" }} className="flex-grow-1">
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
