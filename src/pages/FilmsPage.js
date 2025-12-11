import { useEffect, useState } from "react";
import api from "../services/api";
import { Container, Row, Col } from "react-bootstrap";
import FilmCard from "../components/FilmCard";
import { Spinner } from "react-bootstrap";

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
        <p>{error}</p>
      </div>
    );
  }

  if (!films.length) {
    return (
      <div className="d-flex justify-content-center py-5">
        <p>No films found.</p>
      </div>
    );
  }

  return (
    <>
      <h1 className="mb-4">Browse Films</h1>
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
