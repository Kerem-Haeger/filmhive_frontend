import { useEffect, useState } from "react";
import api from "../services/api";
import { Row, Col, Spinner } from "react-bootstrap";
import FilmCard from "../components/FilmCard";

function FilmsPage() {
  const [films, setFilms] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchFilms = async () => {
      try {
        setIsLoading(true);
        const response = await api.get("/films/");
        setFilms(response.data.results || response.data);
      } catch (err) {
        console.error(err);
        setError("Could not load films. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchFilms();
  }, []);

  if (isLoading) {
    return (
      <div className="d-flex justify-content-center py-5">
        <Spinner animation="border" role="status">
          <span className="sr-only">Loading films...</span>
        </Spinner>
      </div>
    );
  }

  if (error) {
    return (
      <div className="d-flex justify-content-center py-5">
        <p className="text-danger mb-0">{error}</p>
      </div>
    );
  }

  if (!films.length) {
    return (
      <div className="d-flex justify-content-center py-5">
        <p className="mb-0">No films found.</p>
      </div>
    );
  }

  return (
    <>
      <h1 className="fh-page-title">Browse films</h1>
      <Row>
        {films.map((film) => (
          <Col key={film.id} xs={12} sm={6} md={4} lg={3} className="mb-4">
            <FilmCard film={film} />
          </Col>
        ))}
      </Row>
    </>
  );
}

export default FilmsPage;
