import { Card, Badge } from "react-bootstrap";
import { Link } from "react-router-dom";

const BASE_MEDIA_URL = "http://localhost:8000";
const TMDB_BASE_URL = "https://image.tmdb.org/t/p/w500";
const FALLBACK_POSTER_URL = "https://placehold.co/400x600?text=No+Poster";

function buildPosterUrl(rawPath) {
  if (!rawPath) return null;

  const poster_path = String(rawPath);

  // already a full URL
  if (poster_path.startsWith("http://") || poster_path.startsWith("https://")) {
    return poster_path;
  }

  // local media (future-proof)
  if (poster_path.startsWith("/media/")) {
    return `${BASE_MEDIA_URL}${poster_path}`;
  }

  // default: TMDB-style relative path (your current case)
  return `${TMDB_BASE_URL}${poster_path}`;
}

function FilmCard({ film }) {
  const { id, title, year, critic_score, popularity } = film;

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

          <div className="d-flex mt-2">
            {critic_score != null && (
              <Badge variant="info" className="mr-2">
                Critics {critic_score}
              </Badge>
            )}
            {popularity != null && (
              <Badge variant="secondary">
                Pop {Math.round(popularity)}
              </Badge>
            )}
          </div>
        </Card.Body>
      </Card>
    </Link>
  );
}

export default FilmCard;
