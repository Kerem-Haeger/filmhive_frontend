import { Card, Badge } from "react-bootstrap";
import { Link } from "react-router-dom";
import { buildPosterUrl } from "../utils/imageUtils";
import { FALLBACK_POSTER_URL } from "../utils/constants";
import FavoriteButton from "./FavoriteButton";

function FilmCard({ film }) {
  const { id, title, year, critic_score } = film;

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
          <Card.Title>{title}</Card.Title>
          {year && (
            <Card.Subtitle className="card-subtitle mb-2">
              {year}
            </Card.Subtitle>
          )}

          <div className="d-flex mt-2 justify-content-between align-items-center">
            {critic_score != null && (
              <Badge variant="info" className="mr-2">
                Critics {parseFloat(critic_score).toFixed(1)}
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
