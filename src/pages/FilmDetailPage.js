import { useContext, useEffect, useState, useCallback, useMemo } from "react";
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

  const from = useMemo(() => location.pathname + location.search, [location.pathname, location.search]);

  useEffect(() => {
    fetchReviews();

    const timer = successTimerRef.current;
    return () => {
      if (timer) clearTimeout(timer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleCreateOrUpdate = useCallback(async (e) => {
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
  }, [isAuthenticated, rating, body, myReview, id, setActionError, showSuccess, setIsEditing, fetchReviews]);

  const handleDeleteReview = useCallback(async () => {
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
  }, [myReview, setActionError, showSuccess, setIsEditing, fetchReviews]);

  const handleToggleLike = useCallback((review) => {
    toggleLike(review, setActionError);
  }, [toggleLike, setActionError]);

  const handleReport = useCallback((review) => {
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
  }, [reportReview, showSuccess, setActionError]);

  const castOrPeople = useMemo(() => film?.cast || film?.people || [], [film]);

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

      <FilmHeader film={film} castOrPeople={castOrPeople} />

      <Row>
        <Col md={8}>
          <h2 className="h4 fh-section-title">User reviews</h2>
          <ReviewsList
            reviews={reviews}
            isLoading={isReviewsLoading}
            error={reviewsError}
            isAuthenticated={isAuthenticated}
            animatingLikeId={animatingLikeId}
            onToggleLike={handleToggleLike}
            onReport={handleReport}
          />
        </Col>

        <Col md={4}>
          <h2 className="h4 fh-section-title">Your review</h2>
          <ReviewForm
            isAuthenticated={isAuthenticated}
            from={from}
            myReview={myReview}
            isEditing={isEditing}
            rating={rating}
            body={body}
            isSubmitting={isSubmittingReview}
            onRatingChange={setRating}
            onBodyChange={setBody}
            onSubmit={handleCreateOrUpdate}
            onEdit={() => setIsEditing(true)}
            onDelete={handleDeleteReview}
            onCancel={resetForm}
          />
        </Col>
      </Row>
    </>
  );
}

export default FilmDetailPage;
