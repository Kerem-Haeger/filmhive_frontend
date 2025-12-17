import { useContext } from "react";
import { Button } from "react-bootstrap";
import { AuthContext } from "../context/AuthContext";
import { useFavorites } from "../hooks/useFavorites";

function FavoriteButton({ filmId, className = "" }) {
  const { isAuthenticated } = useContext(AuthContext);
  const { toggleFavorite, isFavorited } = useFavorites();

  const favorited = isFavorited(filmId);

  const handleClick = async (e) => {
    e.preventDefault(); // Prevent navigation if inside a Link
    e.stopPropagation();
    await toggleFavorite(filmId);
  };

  // Flat, monochrome hearts (filled vs outline)
  const icon = favorited ? "♥" : "♡";
  const label = favorited ? "Remove from favourites" : "Add to favourites";

  return (
    <Button
      variant="link"
      size="sm"
      onClick={handleClick}
      disabled={!isAuthenticated}
      aria-pressed={favorited}
      aria-label={label}
      title={isAuthenticated ? label : "Log in to favourite films"}
      className={`p-0 border-0 align-self-start ${className}`}
      style={{
        color: "#dc3545",
        textDecoration: "none",
        fontSize: "1.5rem",
        lineHeight: 1,
        fontWeight: favorited ? 700 : 600,
      }}
    >
      <span>{icon}</span>
    </Button>
  );
}

export default FavoriteButton;
