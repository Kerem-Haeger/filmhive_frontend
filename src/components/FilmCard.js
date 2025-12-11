import { Card, Badge } from "react-bootstrap";

function FilmCard({ film }) {
  const { title, year, poster_path, critic_score, popularity } = film;

  const BASE_MEDIA_URL = "http://localhost:8000";
  const posterUrl = poster_path ? `${BASE_MEDIA_URL}${poster_path}` : null;

  return (
    <Card className="h-100 shadow-sm">
      {posterUrl && (
        <Card.Img
          variant="top"
          src={posterUrl}
          alt={`${title} poster`}
        />
      )}

      <Card.Body>
        <Card.Title>{title}</Card.Title>
        {year && <Card.Subtitle className="text-muted mb-2">{year}</Card.Subtitle>}

        <div className="d-flex gap-2 mt-2">
          {critic_score != null && (
            <Badge variant="info">Critics {critic_score}</Badge>
          )}
          {popularity != null && (
            <Badge variant="secondary">Pop {Math.round(popularity)}</Badge>
          )}
        </div>
      </Card.Body>
    </Card>
  );
}

export default FilmCard;
