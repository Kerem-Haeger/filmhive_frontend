import { useContext, useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { Row, Col, Spinner, Button } from "react-bootstrap";
import { AuthContext } from "../context/AuthContext";
import { useFilmDetails } from "../hooks/useFilmDetails";
import { useReviews } from "../hooks/useReviews";
import { useNotification } from "../hooks/useNotification";
import { useReviewForm } from "../hooks/useReviewForm";
import { reviewService } from "../services/reviewService";
import { parseApiError } from "../utils/errorUtils";
import NotificationAlert from "../components/common/NotificationAlert";
import FilmHeader from "../components/film/FilmHeader";
import CastCrewSection from "../components/film/CastCrewSection";
import ReviewsList from "../components/reviews/ReviewsList";
import ReviewForm from "../components/reviews/ReviewForm";

function FilmDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const { isAuthenticated, user } = useContext(AuthContext);

  const { film, isLoading, error } = useFilmDetails(id);
  const {
    reviews,
    isReviewsLoading,
    reviewsError,
    myReview,
    animatingLikeId,
    fetchReviews,
    toggleLike,
    reportReview,
  } = useReviews(id, user, isAuthenticated);

  const {
    successNotice,
    actionError,
    setActionError,
    showSuccess,
    successTimerRef,
  } = useNotification();

  const {
    rating,
    setRating,
    body,
    setBody,
    isEditing,
    setIsEditing,
    resetForm,
  } = useReviewForm(myReview, isAuthenticated);

  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  const from = location.pathname + location.search;

  useEffect(() => {
    fetchReviews();

    return () => {
      if (successTimerRef.current) clearTimeout(successTimerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleCreateOrUpdate = async (e) => {
    e.preventDefault();
    setActionError("");

    if (!isAuthenticated) return;

    if (!rating || rating < 1 || rating > 10) {
      setActionError("Rating must be between 1 and 10.");
      return;
    }

    setIsSubmittingReview(true);
    try {
      if (myReview) {
        await reviewService.updateReview(myReview.id, rating, body);
        showSuccess("Review updated.");
        setIsEditing(false);
      } else {
        await reviewService.createReview(id, rating, body);
        showSuccess("Review posted.");
      }

      await fetchReviews();
    } catch (err) {
      console.error(err);
      setActionError(parseApiError(err, "Could not save review."));
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const handleDeleteReview = async () => {
    if (!myReview) return;
    setActionError("");

    if (!window.confirm("Delete your review?")) return;

    try {
      await reviewService.deleteReview(myReview.id);
      showSuccess("Review deleted.");
      setIsEditing(false);
      await fetchReviews();
    } catch (err) {
      console.error(err);
      setActionError(parseApiError(err, "Could not delete review."));
    }
  };

  const handleToggleLike = (review) => {
    toggleLike(review, setActionError);
  };

  const handleReport = (review) => {
    reportReview(
      review,
      (reportId, undoFn) => {
        showSuccess("Report sent. Thanks for helping keep FilmHive safe.", {
          durationMs: 10000,
          undo: reportId
            ? async () => {
                try {
                  const message = await undoFn();
                  showSuccess(message, { durationMs: 3000 });
                } catch (err) {
                  setActionError(err.message);
                }
              }
            : null,
        });
      },
      setActionError
    );
  };

  if (isLoading) {
    return (
      <div className="d-flex justify-content-center py-5">
        <Spinner animation="border" role="status">
          <span className="sr-only">Loading film...</span>
        </Spinner>
      </div>
    );
  }

  if (error) return <p className="text-danger">{error}</p>;
  if (!film) return <p>Film not found.</p>;

  const castOrPeople = film.cast || film.people || [];

  return (
    <>
      <Button
        variant="dark"
        className="fh-back-button mb-3"
        onClick={() => navigate(-1)}
      >
        ← Back
      </Button>

      <NotificationAlert
        successNotice={successNotice}
        actionError={actionError}
      />

      <FilmHeader film={film} />

      <CastCrewSection castOrPeople={castOrPeople} />

      <Row>
        <Col md={8}>
          <h2 className="h4 fh-section-title">User reviews</h2>

          {isReviewsLoading ? (
            <p className="text-muted">Loading reviews...</p>
          ) : reviewsError ? (
            <p className="text-danger mb-0">{reviewsError}</p>
          ) : reviews.length === 0 ? (
            <p className="text-muted mb-0">No reviews yet.</p>
          ) : (
            <div>
              {reviews
                .filter((review) => review.body && review.body.trim().length > 0)
                .map((review) => (
                  <div
                    key={review.id}
                    className="mb-3 p-3 rounded"
                    style={{
                      backgroundColor: "rgba(0,0,0,0.35)",
                      border: "1px solid rgba(255,255,255,0.08)",
                    }}
                  >
                  <div className="d-flex align-items-center justify-content-between mb-2">
                    <div className="d-flex align-items-center">
                      <strong>{review.user_username || "User"}</strong>
                      {review.rating != null && (
                        <Badge bg="info" className="ms-2">
                          {review.rating}/10
                        </Badge>
                      )}
                    </div>

                    <div className="fh-review-actions">
                      {isAuthenticated ? (
                        <>
                          <Button
                            size="sm"
                            variant={review.liked_by_me ? "success" : "outline-light"}
                            onClick={() => handleToggleLike(review)}
                            disabled={review._likeBusy}
                          >
                            <span
                              className={`fh-thumb ${
                                review.liked_by_me ? "" : "fh-thumb-muted"
                              } ${
                                animatingLikeId === review.id ? "fh-like-animate" : ""
                              }`}
                            >
                              👍
                            </span>
                            {review.likes_count ?? 0}
                          </Button>

                          {!review.is_owner && (
                            <Button
                              size="sm"
                              variant="outline-warning"
                              onClick={() => handleReport(review)}
                              disabled={review._likeBusy}
                            >
                              Report
                            </Button>
                          )}
                        </>
                      ) : (
                        <span className="text-muted">
                          <span className="fh-thumb fh-thumb-muted">👍</span>{" "}
                          {review.likes_count ?? 0}
                        </span>
                      )}
                    </div>
                  </div>

                  {review.body && <p className="mb-2">{review.body}</p>}

                  {review.created_at && (
                    <small className="text-muted">
                      {new Date(review.created_at).toLocaleDateString()}
                    </small>
                  )}
                </div>
              ))}
            </div>
          )}
        </Col>

        <Col md={4}>
          <h2 className="h4 fh-section-title">Your review</h2>

          {!isAuthenticated ? (
            <p className="text-muted mb-0">
              <Link to="/login" state={{ from }}>
                Login
              </Link>{" "}
              to add your rating and review.
            </p>
          ) : (
            <>
              {myReview && !isEditing && (
                <div className="mb-3">
                  <p className="text-muted mb-2">
                    You’ve already reviewed or rated this film.
                  </p>
                  <div className="d-flex gap-3">
                    <Button
                      size="sm"
                      variant="outline-light"
                      onClick={() => setIsEditing(true)}
                    >
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="outline-danger"
                      onClick={handleDeleteReview}
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              )}

              {(!myReview || isEditing) && (
                <Form onSubmit={handleCreateOrUpdate}>
                  <Form.Group className="mb-3">
                    <Form.Label>Rating (1–10)</Form.Label>
                    <Form.Control
                      type="number"
                      min={1}
                      max={10}
                      value={rating}
                      onChange={(e) => setRating(e.target.value)}
                      required
                    />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Review (optional)</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={4}
                      value={body}
                      onChange={(e) => setBody(e.target.value)}
                      placeholder="What did you think?"
                    />
                  </Form.Group>

                  <div className="d-flex gap-3">
                    <Button
                      variant="warning"
                      type="submit"
                      disabled={isSubmittingReview}
                    >
                      {isSubmittingReview ? (
                        <>
                          <Spinner as="span" animation="border" size="sm" />{" "}
                          Saving...
                        </>
                      ) : myReview ? (
                        "Save changes"
                      ) : (
                        "Post review"
                      )}
                    </Button>

                    {myReview && isEditing && (
                      <Button
                        variant="outline-light"
                        type="button"
                        onClick={() => {
                          setIsEditing(false);
                          setRating(myReview.rating ?? 8);
                          setBody(myReview.body ?? "");
                        }}
                      >
                        Cancel
                      </Button>
                    )}
                  </div>
                </Form>
              )}
            </>
          )}
        </Col>
      </Row>
    </>
  );
}

export default FilmDetailPage;
