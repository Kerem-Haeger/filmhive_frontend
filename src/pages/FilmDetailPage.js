import { useContext, useEffect, useState, useCallback, useMemo } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { Row, Col, Spinner, Button, Dropdown, Alert } from "react-bootstrap";
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
  const [reviewSort, setReviewSort] = useState("likes_desc");
  const reviewSortOptions = useMemo(
    () => [
      { value: "likes_desc", label: "Most liked" },
      { value: "recent", label: "Most recent" },
    ],
    []
  );

  const sortedReviews = useMemo(() => {
    const sortByLikes = reviewSort !== "recent";

    const toTimestamp = (value) => {
      const time = value ? new Date(value).getTime() : 0;
      return Number.isFinite(time) ? time : 0;
    };

    const ordered = [...reviews].sort((a, b) => {
      if (sortByLikes) {
        const likesDiff = (b.likes_count ?? 0) - (a.likes_count ?? 0);
        if (likesDiff !== 0) return likesDiff;
      }

      const timeDiff = toTimestamp(b.created_at) - toTimestamp(a.created_at);
      return timeDiff;
    });

    if (!myReview) return ordered;

    const withoutMine = ordered.filter((r) => r.id !== myReview.id);
    return [myReview, ...withoutMine];
  }, [reviews, myReview, reviewSort]);

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

  const averageRating = useMemo(() => {
    if (!reviews || reviews.length === 0) return null;
    const ratingsOnly = reviews.filter(r => r.rating != null);
    if (ratingsOnly.length === 0) return null;
    const sum = ratingsOnly.reduce((acc, r) => acc + r.rating, 0);
    return sum / ratingsOnly.length;
  }, [reviews]);

  if (isLoading) {
    return (
      <div className="d-flex justify-content-center py-5">
        <Spinner animation="border" role="status">
          <span className="sr-only">Loading film...</span>
        </Spinner>
      </div>
    );
  }

  if (error) return <Alert variant="danger">{error}</Alert>;
  if (!film) return <Alert variant="warning">Film not found (404).</Alert>;

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

      <FilmHeader film={film} castOrPeople={castOrPeople} averageRating={averageRating} />

      <Row>
        <Col md={8} className="order-2 order-md-1">
          <div className="d-flex align-items-center justify-content-between mb-2 mt-3 mt-md-0">
            <h2 className="h4 fh-section-title mb-0">User reviews</h2>
            <div className="fh-width-sort">
              <Dropdown align="end">
                <Dropdown.Toggle
                  variant="dark"
                  size="sm"
                  id="fh-review-sort"
                  className="fh-select-compact"
                >
                  {
                    reviewSortOptions.find((opt) => opt.value === reviewSort)
                      ?.label || "Sort"
                  }
                </Dropdown.Toggle>
                <Dropdown.Menu className="fh-select-menu">
                  {reviewSortOptions.map((opt) => (
                    <Dropdown.Item
                      key={opt.value}
                      active={reviewSort === opt.value}
                      onClick={() => setReviewSort(opt.value)}
                      className="fh-select-item"
                    >
                      {opt.label}
                    </Dropdown.Item>
                  ))}
                </Dropdown.Menu>
              </Dropdown>
            </div>
          </div>
          <ReviewsList
            reviews={sortedReviews}
            isLoading={isReviewsLoading}
            error={reviewsError}
            isAuthenticated={isAuthenticated}
            animatingLikeId={animatingLikeId}
            onToggleLike={handleToggleLike}
            onReport={handleReport}
            myReviewId={myReview?.id || null}
          />
        </Col>

        <Col md={4} className="order-1 order-md-2">
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
