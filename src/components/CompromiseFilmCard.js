import { Card, Badge } from "react-bootstrap";
import { Link } from "react-router-dom";
import { buildPosterUrl } from "../utils/imageUtils";
import { FALLBACK_POSTER_URL } from "../utils/constants";
import FavoriteButton from "./FavoriteButton";
import "./CompromiseFilmCard.css";

function CompromiseFilmCard({ result }) {
  const { film, score, reasons } = result;
  const { id, title, year, critic_score, poster_path } = film;

  const posterUrl = buildPosterUrl(poster_path) || FALLBACK_POSTER_URL;

  return (
    <Link to={`/films/${id}`} className="text-decoration-none text-reset">
      <Card className="fh-film-card compromise-film-card h-100 shadow-sm">
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
          <div className="match-score-large mb-3">
            <Badge variant="success" className="score-badge">
              {Math.round(score * 100)}%
            </Badge>
            <span className="score-label">Match</span>
          </div>

          <Card.Title>{title}</Card.Title>
          {year && (
            <Card.Subtitle className="card-subtitle mb-2">
              {year}
            </Card.Subtitle>
          )}

          {reasons && reasons.length > 0 && (
            <div className="reasons-section mb-2">
              <div className="small text-muted reasons-list">
                {reasons.map((reason, idx) => (
                  <div key={idx} className="reason-item">
                    • {reason}
                  </div>
                ))}
              </div>
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

export default CompromiseFilmCard;
