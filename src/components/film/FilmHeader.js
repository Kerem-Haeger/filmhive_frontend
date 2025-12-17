import { Row, Col, Badge } from "react-bootstrap";
import { Link } from "react-router-dom";
import { buildPosterUrl } from "../../utils/imageUtils";
import { FALLBACK_POSTER_URL } from "../../utils/constants";
import CastCrewSection from "./CastCrewSection";
import FavoriteButton from "../FavoriteButton";

function FilmHeader({ film, castOrPeople }) {
  const { title, year, poster_path, overview, runtime, critic_score, genres, id } =
    film;

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
              Critics {critic_score}
            </Badge>
          )}
          {runtime && <Badge bg="dark">{runtime} min</Badge>}
          <FavoriteButton 
            filmId={id} 
            className="ms-2"
          />
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

export default FilmHeader;
