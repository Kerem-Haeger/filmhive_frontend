import { useContext, useEffect, useRef, useState } from "react";
import { Button, Overlay, Tooltip } from "react-bootstrap";
import { AuthContext } from "../context/AuthContext";
import { useFavorites } from "../hooks/useFavorites";

function FavoriteButton({ filmId, className = "" }) {
  const { isAuthenticated } = useContext(AuthContext);
  const { toggleFavorite, isFavorited } = useFavorites();

  const [showTooltip, setShowTooltip] = useState(false);
  const buttonRef = useRef(null);
  const hideTimeoutRef = useRef(null);

  const favorited = isFavorited(filmId);

  const showReminder = () => {
    setShowTooltip(true);
    if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current);
    hideTimeoutRef.current = setTimeout(() => setShowTooltip(false), 1800);
  };

  const handleClick = async (e) => {
    e.preventDefault(); // Prevent navigation if inside a Link
    e.stopPropagation();

    if (!isAuthenticated) {
      showReminder();
      return;
    }

    await toggleFavorite(filmId);
  };

  useEffect(() => () => {
    if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current);
  }, []);

  // Flat, monochrome hearts (filled vs outline)
  const icon = favorited ? "♥" : "♡";
  const label = favorited ? "Remove from favourites" : "Add to favourites";

  return (
    <>
      <Button
        ref={buttonRef}
        variant="link"
        size="sm"
        onClick={handleClick}
        onMouseEnter={() => {
          if (!isAuthenticated) showReminder();
        }}
        onFocus={() => {
          if (!isAuthenticated) showReminder();
        }}
        aria-pressed={favorited}
        aria-label={label}
        aria-disabled={!isAuthenticated}
        title={isAuthenticated ? label : "Log in to favourite films"}
        className={`p-0 border-0 align-self-start fh-heart-button ${className}`}
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

      <Overlay
        target={buttonRef.current}
        show={showTooltip && !isAuthenticated}
        placement="top"
        transition={false}
      >
        {(props) => (
          <Tooltip {...props} className="fh-tooltip-dark">
            Please log in to favourite this film
          </Tooltip>
        )}
      </Overlay>
    </>
  );
}

export default FavoriteButton;
