import { Card, Badge } from "react-bootstrap";
import { Link } from "react-router-dom";

const BASE_MEDIA_URL = "http://localhost:8000";

function FilmCard({ film }) {
  const { id, title, year, poster_path, critic_score, popularity } = film;

  const posterUrl = poster_path ? `${BASE_MEDIA_URL}${poster_path}` : null;

  return (
    <Link
      to={`/films/${id}`}
      className="text-decoration-none text-reset"
    >
      <Card className="fh-film-card h-100 shadow-sm">
        {posterUrl && (
          <Card.Img
            variant="top"
            src={posterUrl}
            alt={`${title} poster`}
            loading="lazy"
          />
        )}

        <Card.Body>
          <Card.Title>{title}</Card.Title>

          {year && (
            <Card.Subtitle className="card-subtitle mb-2">
              {year}
            </Card.Subtitle>
          )}

          {/* Bootstrap 4: no gap utilities, use margins instead */}
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
