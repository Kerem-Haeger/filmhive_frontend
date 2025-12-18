import { useContext, useMemo, useState, memo } from "react";
import { Row, Col, Badge, Form, Button, Dropdown } from "react-bootstrap";
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

  const [selectedList, setSelectedList] = useState("");
  const [newListName, setNewListName] = useState("");
  const [isSavingWatchlist, setIsSavingWatchlist] = useState(false);

  const filmListNames = useMemo(
    () => (getListsForFilm ? getListsForFilm(id) : []),
    [getListsForFilm, id]
  );

  const isCreatingNew = selectedList === "__CREATE_NEW__";

  const handleAddToWatchlist = async (e) => {
    e.preventDefault();
    if (!addToWatchlist) return;
    
    let targetName;
    if (isCreatingNew) {
      targetName = (newListName || "").trim() || "Watchlist";
    } else if (selectedList) {
      targetName = selectedList;
    } else if (listNames?.length) {
      targetName = listNames[0];
    } else {
      targetName = "Watchlist";
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
            <span className="text-muted fh-text-md">
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
            className="d-flex flex-wrap align-items-start"
            onSubmit={handleAddToWatchlist}
          >
            <div>
              <Dropdown>
                <Dropdown.Toggle
                  variant="dark"
                  size="sm"
                  id="fh-watchlist-select"
                  className="fh-select-compact fh-width-dropdown"
                >
                  {isCreatingNew
                    ? "Create new list"
                    : selectedList || "Select a list..."}
                </Dropdown.Toggle>
                <Dropdown.Menu className="fh-select-menu">
                  {listNames?.map((name) => (
                    <Dropdown.Item
                      key={name}
                      className="fh-select-item"
                      active={selectedList === name}
                      onClick={() => {
                        setSelectedList(name);
                        setNewListName("");
                      }}
                    >
                      {name}
                    </Dropdown.Item>
                  ))}
                  <Dropdown.Divider />
                  <Dropdown.Item
                    className="fh-select-item"
                    active={isCreatingNew}
                    onClick={() => setSelectedList("__CREATE_NEW__")}
                  >
                    + Create new list
                  </Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
              {isCreatingNew && (
                <Form.Control
                  size="sm"
                  type="text"
                  placeholder="New list name"
                  value={newListName}
                  onChange={(e) => setNewListName(e.target.value)}
                  className="mt-2 fh-width-input"
                  autoFocus
                />
              )}
            </div>
            <Button
              size="sm"
              type="submit"
              variant="outline-warning"
              className="ms-2"
              disabled={isSavingWatchlist || isMutating || !isAuthenticated}
              aria-disabled={!isAuthenticated}
            >
              Add to watchlist
            </Button>
          </Form>
          {filmListNames.length > 0 && (
            <div className="text-muted small mt-2">
              In watchlists: {filmListNames.map((name, idx) => (
                <span key={name}>
                  <Link to={`/watchlists?name=${encodeURIComponent(name)}`}>{name}</Link>
                  {idx < filmListNames.length - 1 ? ", " : ""}
                </span>
              ))}
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
