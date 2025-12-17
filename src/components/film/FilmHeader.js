import { useContext, useMemo, useState, memo } from "react";
import { Row, Col, Badge, Form, Button } from "react-bootstrap";
import { Link } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import { buildPosterUrl } from "../../utils/imageUtils";
import { FALLBACK_POSTER_URL } from "../../utils/constants";
import CastCrewSection from "./CastCrewSection";
import FavoriteButton from "../FavoriteButton";
import { useWatchlists } from "../../hooks/useWatchlists";
import StarRatings from "react-star-ratings";

function FilmHeader({ film, castOrPeople, averageRating }) {
  const { title, year, poster_path, overview, runtime, critic_score, genres, id } =
    film;

  const { isAuthenticated } = useContext(AuthContext);
  const {
    addToWatchlist,
    listNames,
    getListsForFilm,
    isMutating,
  } = useWatchlists() || {};

  const [watchlistName, setWatchlistName] = useState("Watchlist");
  const [selectedList, setSelectedList] = useState("");
  const [newListName, setNewListName] = useState("");
  const [isSavingWatchlist, setIsSavingWatchlist] = useState(false);

  const filmListNames = useMemo(
    () => (getListsForFilm ? getListsForFilm(id) : []),
    [getListsForFilm, id]
  );

  const hasMultipleLists = (listNames?.length || 0) >= 2;
  const isCreatingNew = selectedList === "__CREATE_NEW__";

  const handleAddToWatchlist = async (e) => {
    e.preventDefault();
    if (!addToWatchlist) return;
    
    let targetName;
    if (hasMultipleLists) {
      if (isCreatingNew) {
        targetName = (newListName || "").trim() || "Watchlist";
      } else {
        targetName = selectedList || (listNames?.[0] || "Watchlist");
      }
    } else {
      targetName = (watchlistName || "").trim() || "Watchlist";
    }
    
    setIsSavingWatchlist(true);
    await addToWatchlist(id, targetName);
    setIsSavingWatchlist(false);
    
    // Reset new list input after successful add
    if (isCreatingNew) {
      setNewListName("");
      setSelectedList(listNames?.[0] || "");
    }
  };

  const posterUrl = buildPosterUrl(poster_path) || FALLBACK_POSTER_URL;

  return (
    <Row className="mb-4">
      <Col md={4} className="mb-3">
        {posterUrl && (
          <img
            src={posterUrl}
            alt={`${title} poster`}
            className="img-fluid fh-detail-poster"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = FALLBACK_POSTER_URL;
            }}
          />
        )}
      </Col>

      <Col md={8}>
        <h1 className="fh-detail-title mb-2">{title}</h1>
        {year && <p className="fh-detail-meta mb-3">{year}</p>}

        <div className="mb-3">
          {critic_score != null && (
            <Badge bg="info" className="me-2">
              Rating: {parseFloat(critic_score).toFixed(2)}
            </Badge>
          )}
          {runtime && <Badge bg="dark">{runtime} min</Badge>}
          <FavoriteButton 
            filmId={id} 
            className="ms-2"
          />
        </div>

        {averageRating != null ? (
          <div className="mb-3 d-flex align-items-center gap-2">
            <span className="text-muted">Our users rate this film</span>
            <div className="mx-2">
              <StarRatings
                rating={averageRating}
                numberOfStars={10}
                starRatedColor="#f5c518"
                starEmptyColor="rgba(255, 255, 255, 0.2)"
                starDimension="18px"
                starSpacing="2px"
                name="average-rating"
              />
            </div>
            <span className="text-muted" style={{ fontSize: "0.9rem" }}>
              ({averageRating.toFixed(1)}/10)
            </span>
          </div>
        ) : (
          <div className="mb-3">
            <span className="text-muted">
              Our users have not rated this film yet - be the first!
            </span>
          </div>
        )}

        <div className="mb-3">
          <Form
            className="d-flex flex-wrap align-items-start gap-2"
            onSubmit={handleAddToWatchlist}
          >
            <div className="d-flex flex-column gap-2">
              {hasMultipleLists ? (
                <>
                  <Form.Control
                    as="select"
                    size="sm"
                    value={selectedList}
                    onChange={(e) => setSelectedList(e.target.value)}
                    style={{ maxWidth: "220px" }}
                  >
                    {!selectedList && <option value="">Select a list...</option>}
                    {listNames?.map((name) => (
                      <option key={name} value={name}>
                        {name}
                      </option>
                    ))}
                    <option value="__CREATE_NEW__">+ Create new list</option>
                  </Form.Control>
                  {isCreatingNew && (
                    <Form.Control
                      size="sm"
                      type="text"
                      placeholder="New list name"
                      value={newListName}
                      onChange={(e) => setNewListName(e.target.value)}
                      style={{ maxWidth: "220px" }}
                      autoFocus
                    />
                  )}
                </>
              ) : (
                <Form.Control
                  size="sm"
                  type="text"
                  list="watchlist-name-options"
                  placeholder="Watchlist name"
                  value={watchlistName}
                  onChange={(e) => setWatchlistName(e.target.value)}
                  style={{ maxWidth: "220px" }}
                />
              )}
              {!hasMultipleLists && (
                <datalist id="watchlist-name-options">
                  {listNames?.map((name) => (
                    <option key={name} value={name} />
                  ))}
                </datalist>
              )}
            </div>
            <div className="position-relative d-inline-block">
              <Button
                size="sm"
                type="submit"
                variant="outline-warning"
                disabled={isSavingWatchlist || isMutating || !isAuthenticated}
                aria-disabled={!isAuthenticated}
              >
                Add to watchlist
              </Button>
            </div>
          </Form>
          {filmListNames.length > 0 && (
            <div className="text-muted small mt-2">
              In watchlists: {filmListNames.join(", ")}
            </div>
          )}
        </div>

        {genres && genres.length > 0 && (
          <p className="mb-3">
            <strong>Genres:</strong>{" "}
            {genres.map((g, idx) => {
              const name = g?.name || g;
              return (
                <span key={name}>
                  <Link to={`/films?genres=${encodeURIComponent(name)}`}>{name}</Link>
                  {idx < genres.length - 1 ? ", " : ""}
                </span>
              );
            })}
          </p>
        )}

        {overview && <p className="mb-3">{overview}</p>}

        <CastCrewSection castOrPeople={castOrPeople} />
      </Col>
    </Row>
  );
}

export default memo(FilmHeader);
