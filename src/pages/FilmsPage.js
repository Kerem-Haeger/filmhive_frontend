import { useEffect, useState } from "react";
import api from "../services/api";
import { Row, Col, Spinner, Form } from "react-bootstrap";
import FilmCard from "../components/FilmCard";

function FilmsPage() {
  const [films, setFilms] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

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

const trimmedSearch = searchTerm.trim().toLowerCase();

const filteredFilms = trimmedSearch
  ? films.filter((film) => {
      const parts = [
        film.title,
        film.year && String(film.year),
        film.overview,

        // genres: can be ["Drama", "Action"] or [{ name: "Drama" }, ...]
        ...(film.genres || []).map((g) => (g.name || g).toString()),

        // keywords: same idea
        ...(film.keywords || []).map((k) => (k.name || k).toString()),

        // people / cast: support either .people or .cast
        ...((film.people || film.cast || []).map((p) =>
          (p.name || p).toString()
        )),
      ];

      const searchableText = parts
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return searchableText.includes(trimmedSearch);
    })
  : films;


  return (
    <>
      <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between mb-3">
        <h1 className="fh-page-title mb-3 mb-md-0">Browse films</h1>

        <Form
          className="w-100 w-md-auto"
          onSubmit={(e) => e.preventDefault()}
        >
          <Form.Control
            type="search"
            placeholder="Search Films by title, year, genre, keyword, person..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </Form>
      </div>

      {filteredFilms.length === 0 ? (
        <p>No films match your search.</p>
      ) : (
        <Row>
          {filteredFilms.map((film) => (
            <Col
              key={film.id}
              xs={12}
              sm={6}
              md={4}
              lg={3}
              className="mb-4"
            >
              <FilmCard film={film} />
            </Col>
          ))}
        </Row>
      )}
    </>
  );
}

export default FilmsPage;
