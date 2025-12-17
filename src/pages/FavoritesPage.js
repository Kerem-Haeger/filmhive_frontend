import { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { Row, Col, Spinner, Alert, Button } from "react-bootstrap";
import { AuthContext } from "../context/AuthContext";
import { useFavorites } from "../hooks/useFavorites";
import FilmCard from "../components/FilmCard";

function FavoritesPage() {
  const navigate = useNavigate();
  const { isAuthenticated, isBooting } = useContext(AuthContext);
  const { favoriteFilms, isLoading, error, fetchFavorites } = useFavorites();

  // Redirect to login if not authenticated
  if (!isBooting && !isAuthenticated) {
    return (
      <div className="text-center py-5">
        <h2 className="mb-3">Please Log In</h2>
        <p className="mb-4">You must be logged in to view your favorite films.</p>
        <Button
          variant="dark"
          onClick={() => navigate("/login", { state: { from: "/favourites" } })}
        >
          Go to Login
        </Button>
      </div>
    );
  }

  // Loading state
  if (isLoading || isBooting) {
    return (
      <div className="d-flex justify-content-center py-5">
        <Spinner animation="border" role="status">
          <span className="sr-only">Loading your favorites...</span>
        </Spinner>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <Alert variant="danger" className="mt-3">
        <Alert.Heading>Failed to Load Favorites</Alert.Heading>
        <p>{typeof error === "string" ? error : "An unexpected error occurred."}</p>
        <Button 
          variant="outline-danger" 
          size="sm"
          onClick={() => fetchFavorites()}
        >
          Try Again
        </Button>
      </Alert>
    );
  }

  // Empty favorites
  if (favoriteFilms.length === 0) {
    return (
      <div className="text-center py-5">
        <i className="bi bi-heart" style={{ fontSize: "3rem", color: "#ccc" }}></i>
        <h2 className="mt-3 mb-2">No Favorite Films Yet</h2>
        <p className="text-muted mb-4">Start adding films to your favorites!</p>
        <Button
          variant="dark"
          onClick={() => navigate("/films")}
        >
          Browse Films
        </Button>
      </div>
    );
  }

  return (
    <div>
      <h2 className="fh-page-title d-inline-flex align-items-center mb-4">
        My Favorite Films
        <span className="fh-count-badge ms-3 align-self-center">{favoriteFilms.length}</span>
      </h2>

      <Row className="g-4">
        {favoriteFilms.map((film) => (
          <Col key={film.id} xs={12} sm={6} md={4} lg={3}>
            <FilmCard film={film} />
          </Col>
        ))}
      </Row>
    </div>
  );
}

export default FavoritesPage;
