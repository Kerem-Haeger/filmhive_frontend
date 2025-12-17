import { Card, Badge } from "react-bootstrap";
import { Link } from "react-router-dom";
import { buildPosterUrl } from "../utils/imageUtils";
import { FALLBACK_POSTER_URL } from "../utils/constants";
import FavoriteButton from "./FavoriteButton";

function FilmCard({ film }) {
  const { id, title, year, critic_score } = film;
  const matchScore = film.match_score;
  const reasons = Array.isArray(film.reasons)
    ? film.reasons.slice(0, 2)
    : [];

  const rawPosterPath = film.poster_path;
  const posterUrl = buildPosterUrl(rawPosterPath) || FALLBACK_POSTER_URL;

  return (
    <Link to={`/films/${id}`} className="text-decoration-none text-reset">
      <Card className="fh-film-card h-100 shadow-sm">
        <Card.Img
          variant="top"
          src={posterUrl}
          alt={`${title} poster`}
          loading="lazy"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = FALLBACK_POSTER_URL;
          }}
        />

        <Card.Body>
          {matchScore != null && (
            <Badge variant="success" className="mb-2">
              Match {Math.round(matchScore)}%
            </Badge>
          )}

          <Card.Title>{title}</Card.Title>
          {year && (
            <Card.Subtitle className="card-subtitle mb-2">
              {year}
            </Card.Subtitle>
          )}

          {reasons.length > 0 && (
            <div className="small text-muted mb-2">
              {reasons.join(" | ")}
            </div>
          )}

          <div className="d-flex mt-2 justify-content-between align-items-center">
            {critic_score != null && (
              <Badge variant="info" className="mr-2">
                Rating: {parseFloat(critic_score).toFixed(1)}
              </Badge>
            )}
            <FavoriteButton filmId={id} />
          </div>
        </Card.Body>
      </Card>
    </Link>
  );
}

export default FilmCard;
