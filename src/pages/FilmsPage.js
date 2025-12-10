// src/pages/FilmsPage.js
import { useEffect, useState } from "react";
import api from "../services/api";
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
        setFilms(response.data.results || response.data); // depending on DRF pagination
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
    return <p className="fh-status">Loading films...</p>;
  }

  if (error) {
    return <p className="fh-status fh-status--error">{error}</p>;
  }

  if (!films.length) {
    return <p className="fh-status">No films found.</p>;
  }

  return (
    <section className="fh-films-page">
      <h1 className="fh-page-title">Browse Films</h1>
      <div className="fh-film-grid">
        {films.map((film) => (
          <FilmCard key={film.id} film={film} />
        ))}
      </div>
    </section>
  );
}

export default FilmsPage;
