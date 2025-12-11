import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Row, Col, Badge, Spinner, Button } from "react-bootstrap";
import api from "../services/api";

const BASE_MEDIA_URL = "http://localhost:8000";

function FilmDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [film, setFilm] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchFilm = async () => {
      try {
        setIsLoading(true);
        setError("");
        const response = await api.get(`/films/${id}/`);
        setFilm(response.data);
      } catch (err) {
        console.error(err);
        setError("Could not load film details. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchFilm();
  }, [id]);

  if (isLoading) {
    return (
      <div className="d-flex justify-content-center py-5">
        <Spinner animation="border" role="status">
          <span className="sr-only">Loading film...</span>
        </Spinner>
      </div>
    );
  }

  if (error) {
    return <p className="text-danger">{error}</p>;
  }

  if (!film) {
    return <p>Film not found.</p>;
  }

  const {
    title,
    year,
    poster_path,
    overview,
    runtime,
    critic_score,
    popularity,
    genres,
  } = film;

  const posterUrl = poster_path ? `${BASE_MEDIA_URL}${poster_path}` : null;

  return (
    <>
      <Button
        variant="dark"
        className="fh-back-button mb-3"
        onClick={() => navigate(-1)}
      >
        ← Back
      </Button>

      <Row className="mb-4">
        <Col md={4} className="mb-3">
          {posterUrl && (
            <img
              src={posterUrl}
              alt={`${title} poster`}
              className="img-fluid fh-detail-poster"
            />
          )}
        </Col>

        <Col md={8}>
          <h1 className="fh-detail-title mb-2">{title}</h1>
          {year && <p className="fh-detail-meta mb-3">{year}</p>}

          <div className="mb-3">
            {critic_score != null && (
              <Badge variant="info" className="mr-2">
                Critics {critic_score}
              </Badge>
            )}
            {popularity != null && (
              <Badge variant="secondary" className="mr-2">
                Pop {Math.round(popularity)}
              </Badge>
            )}
            {runtime && (
              <Badge variant="dark" className="ml-1">
                {runtime} min
              </Badge>
            )}
          </div>

          {genres && genres.length > 0 && (
            <p className="mb-3">
              <strong>Genres:</strong>{" "}
              {genres.map((g) => g.name || g).join(", ")}
            </p>
          )}

          {overview && <p className="mb-0">{overview}</p>}
        </Col>
      </Row>

      <Row>
        <Col md={8}>
          <h2 className="h4 fh-section-title">User reviews</h2>
          <p className="text-muted">Reviews will appear here.</p>
        </Col>

        <Col md={4}>
          <h2 className="h4 fh-section-title">Your review</h2>
          <p className="text-muted">
            Login to add your rating and review.
          </p>
        </Col>
      </Row>
    </>
  );
}

export default FilmDetailPage;
