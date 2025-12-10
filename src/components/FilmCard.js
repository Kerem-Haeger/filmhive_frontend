// src/components/FilmCard.js
function FilmCard({ film }) {
  const { title, year, poster_path, critic_score, popularity } = film;

  return (
    <article className="fh-film-card">
      {poster_path && (
        <div className="fh-film-card-poster">
          <img src={poster_path} alt={`${title} poster`} />
        </div>
      )}
      <div className="fh-film-card-body">
        <h2 className="fh-film-title">{title}</h2>
        {year && <p className="fh-film-meta">{year}</p>}
        <div className="fh-film-stats">
          {critic_score != null && (
            <span className="fh-badge">Critics {critic_score}</span>
          )}
          {popularity != null && (
            <span className="fh-badge fh-badge--subtle">
              Pop {Math.round(popularity)}
            </span>
          )}
        </div>
        {/* Later: buttons for Favourite / Watchlist / Details */}
      </div>
    </article>
  );
}

export default FilmCard;
