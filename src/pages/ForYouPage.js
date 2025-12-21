import { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { Row, Col, Spinner, Alert, Button } from "react-bootstrap";
import { AuthContext } from "../context/AuthContext";
import { useInfiniteScroll } from "../hooks/useInfiniteScroll";
import FilmCard from "../components/FilmCard";
import ScrollToTop from "../components/common/ScrollToTop";

function ForYouPage() {
  const navigate = useNavigate();
  const { isAuthenticated, isBooting } = useContext(AuthContext);
  const {
    items: films,
    isInitialLoading,
    isLoadingMore,
    error,
    sentinelRef,
  } = useInfiniteScroll("/films/for-you/");

  // Redirect to login if not authenticated
  if (!isBooting && !isAuthenticated) {
    return (
      <div className="text-center py-5">
        <h2 className="mb-3">Please Log In</h2>
        <p className="mb-4">You must be logged in to see your personalized films.</p>
        <Button
          variant="dark"
          onClick={() => navigate("/login", { state: { from: "/for-you" } })}
        >
          Go to Login
        </Button>
      </div>
    );
  }

  // Loading state
  if (isInitialLoading || isBooting) {
    return (
      <div className="d-flex flex-column align-items-center py-5">
        <Spinner animation="border" role="status">
          <span className="sr-only">Loading recommendations...</span>
        </Spinner>
        <p className="text-muted mt-3 mb-0">
          Please hold on while we curate a list for you
        </p>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <Alert variant="danger" className="mt-3">
        <Alert.Heading>Failed to Load Recommendations</Alert.Heading>
        <p>{typeof error === "string" ? error : "An unexpected error occurred."}</p>
        <Button
          variant="outline-danger"
          size="sm"
          onClick={() => navigate(0)}
        >
          Retry
        </Button>
      </Alert>
    );
  }

  // Empty state
  if (!films.length) {
    return (
      <div className="text-center py-5">
        <i className="bi bi-stars fh-empty-icon"></i>
        <h2 className="mt-3 mb-2">No picks yet</h2>
        <p className="text-muted mb-4">
          Add favourites or reviews to help us tailor recommendations.
        </p>
        <Button variant="dark" onClick={() => navigate("/films")}>Browse Films</Button>
      </div>
    );
  }

  // Sort films by match score in descending order
  const sortedFilms = [...films].sort((a, b) => {
    const scoreA = a.match_score ?? 0;
    const scoreB = b.match_score ?? 0;
    return scoreB - scoreA;
  });

  return (
    <>
      <div>
        <h1 className="fh-page-title mb-2">For You</h1>
        <p className="text-muted mb-4">
          Curated films based on your favourites, reviews, watchlists, and preferred genres.
        </p>

        <Row>
        {sortedFilms.map((film) => (
          <Col key={film.id} xs={12} sm={6} md={4} lg={3} className="mb-4">
            <FilmCard film={film} />
          </Col>
        ))}
      </Row>

      <div ref={sentinelRef} />

      {isLoadingMore && (
        <div className="d-flex justify-content-center py-3">
          <Spinner animation="border" role="status">
            <span className="sr-only">Loading more recommendations...</span>
          </Spinner>
        </div>
      )}
    </div>
    <ScrollToTop />
  </>
  );
}

export default ForYouPage;
