import { useContext, useEffect, useMemo, useRef, useState } from "react";
import { useParams, useNavigate, useLocation, Link } from "react-router-dom";
import { Row, Col, Badge, Spinner, Button, Alert, Form } from "react-bootstrap";
import api from "../services/api";
import { AuthContext } from "../context/AuthContext";

const BASE_MEDIA_URL = "http://localhost:8000";
const TMDB_BASE_URL = "https://image.tmdb.org/t/p/w500";
const FALLBACK_POSTER_URL = "https://placehold.co/400x600?text=No+Poster";

function buildPosterUrl(rawPath) {
  if (!rawPath) return null;
  const poster_path = String(rawPath);

  if (poster_path.startsWith("http://") || poster_path.startsWith("https://")) {
    return poster_path;
  }

  if (poster_path.startsWith("/media/")) {
    return `${BASE_MEDIA_URL}${poster_path}`;
  }

  return `${TMDB_BASE_URL}${poster_path}`;
}

function FilmDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const { isAuthenticated, user } = useContext(AuthContext);

  const [film, setFilm] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const [reviews, setReviews] = useState([]);
  const [isReviewsLoading, setIsReviewsLoading] = useState(true);
  const [reviewsError, setReviewsError] = useState("");

  // Alerts (auto-dismiss)
  const [successNotice, setSuccessNotice] = useState(null); 
  const [actionError, setActionError] = useState("");
  const successTimerRef = useRef(null);

  // Review form state
  const [rating, setRating] = useState(8);
  const [body, setBody] = useState("");
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const from = location.pathname + location.search;

  const [animatingLikeId, setAnimatingLikeId] = useState(null);


  const showSuccess = (text, opts = {}) => {
    const durationMs = opts.durationMs ?? 3000;

    setSuccessNotice({
      text,
      undo: opts.undo,
    });

    if (successTimerRef.current) clearTimeout(successTimerRef.current);
    successTimerRef.current = setTimeout(() => setSuccessNotice(null), durationMs);
  };

  const parseApiError = (err, fallback = "Something went wrong.") => {
  const data = err?.response?.data;
  if (!data || typeof data !== "object") return fallback;

  const messages = [];

  for (const [key, val] of Object.entries(data)) {
    const arr = Array.isArray(val) ? val : [String(val)];
    if (key === "detail" || key === "non_field_errors") {
      messages.push(arr.join(" "));
    } else {
      messages.push(`${key}: ${arr.join(" ")}`);
    }
  }

  return messages.length ? messages.join(" • ") : fallback;
};


  const fetchReviews = async () => {
    try {
      setIsReviewsLoading(true);
      setReviewsError("");
      const response = await api.get(`/reviews/?film=${id}`);
      setReviews(response.data.results || response.data);
    } catch (err) {
      console.error(err);
      setReviewsError("Could not load reviews.");
    } finally {
      setIsReviewsLoading(false);
    }
  };

  useEffect(() => {
    const fetchFilm = async () => {
      try {
        setIsLoading(true);
        setError("");
        const response = await api.get(`/films/${id}/`);
        setFilm(response.data);
      } catch (err) {
        console.error(err);
        setError("Could not load film details. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchFilm();
    fetchReviews();

    return () => {
      if (successTimerRef.current) clearTimeout(successTimerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  // Identify the user's own review
  const myReview = useMemo(() => {
    if (!isAuthenticated) return null;

    // Prefer backend-provided flag
    const byFlag = reviews.find((r) => r.is_owner);
    if (byFlag) return byFlag;

    // Fallback if needed
    const myId = user?.id;
    if (!myId) return null;
    return reviews.find((r) => String(r.user) === String(myId)) || null;
  }, [reviews, isAuthenticated, user]);

  // Pre-fill form when myReview changes
  useEffect(() => {
    if (!isAuthenticated) return;

    if (myReview) {
      setRating(myReview.rating ?? 8);
      setBody(myReview.body ?? "");
      setIsEditing(false);
    } else {
      setRating(8);
      setBody("");
      setIsEditing(false);
    }
  }, [myReview, isAuthenticated]);

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
        // Update
        await api.patch(`/reviews/${myReview.id}/`, {
          rating: Number(rating),
          body,
        });
        showSuccess("Review updated.");
        setIsEditing(false);
      } else {
        // Create
        await api.post(`/reviews/`, {
          film: id,
          rating: Number(rating),
          body,
        });
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
      await api.delete(`/reviews/${myReview.id}/`);
      showSuccess("Review deleted.");
      setIsEditing(false);
      await fetchReviews();
    } catch (err) {
      console.error(err);
      setActionError(parseApiError(err, "Could not delete review."));
    }
  };

  const handleToggleLike = async (review) => {
    if (!isAuthenticated || review._likeBusy) return;

    setActionError("");

    // Optimistic update
    setReviews((prev) =>
      prev.map((r) => {
        if (r.id !== review.id) return r;

        const liked = !r.liked_by_me;
        return {
          ...r,
          liked_by_me: liked,
          likes_count: liked
            ? (r.likes_count || 0) + 1
            : Math.max((r.likes_count || 1) - 1, 0),
          _likeBusy: true,
        };
      })
    );

    if (!review.liked_by_me) {
      setAnimatingLikeId(review.id);
    }

    try {
      if (review.liked_by_me && review.my_like_id) {
        await api.delete(`/review-likes/${review.my_like_id}/`);
      } else {
        const res = await api.post(`/review-likes/`, { review: review.id });

        // Store my_like_id locally so unlike works without refetch
        setReviews((prev) =>
          prev.map((r) =>
            r.id === review.id ? { ...r, my_like_id: res.data.id } : r
          )
        );
      }
    } catch (err) {
      console.error(err);
      setActionError(parseApiError(err, "Could not update like."));

      // Roll back on error
      await fetchReviews();
    } finally {
      setAnimatingLikeId(null);
      setReviews((prev) =>
        prev.map((r) =>
          r.id === review.id ? { ...r, _likeBusy: false } : r
        )
      );
    }
  };

    const handleReport = async (review) => {
      if (!isAuthenticated) return;
      if (review._reportBusy) return;

      setActionError("");
      if (!window.confirm("Report this review?")) return;

      setReviews((prev) =>
        prev.map((r) => (r.id === review.id ? { ...r, _reportBusy: true } : r))
      );

      try {
        // POST returns the created report object (including its id)
        const res = await api.post(`/review-reports/`, { review: review.id });
        const reportId = res?.data?.id;

        // Immediately hide it in UI
        setReviews((prev) => prev.filter((r) => r.id !== review.id));

        // Offer Undo for longer (e.g. 10 seconds)
        showSuccess("Report sent. Thanks for helping keep FilmHive safe.", {
          durationMs: 10000,
          undo: reportId
            ? async () => {
                try {
                  await api.delete(`/review-reports/${reportId}/`);
                  showSuccess("Report undone.", { durationMs: 3000 });
                  await fetchReviews(); // brings it back (and keeps ordering correct)
                } catch (err) {
                  console.error(err);
                  setActionError(parseApiError(err, "Could not undo report."));
                }
              }
            : null,
        });
      } catch (err) {
        console.error(err);
        setActionError(parseApiError(err, "Could not report review."));
      }
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

  const { title, year, poster_path, overview, runtime, critic_score, popularity, genres } =
    film;

  const posterUrl = buildPosterUrl(poster_path) || FALLBACK_POSTER_URL;

  // Cast & crew
  const castOrPeople = film.cast || film.people || [];

  const director = castOrPeople.find((p) => {
    const job = (p.job || p.role || "").toLowerCase();
    return job === "director";
  });

  const mainCast = castOrPeople
    .filter((p) => {
      const name = p && (p.name || p.person_name);
      if (!name) return false;
      if (director && (director.name || director.person_name) === name) return false;
      return true;
    })
    .slice(0, 6);

  return (
    <>
      <Button
        variant="dark"
        className="fh-back-button mb-3"
        onClick={() => navigate(-1)}
      >
        ← Back
      </Button>

        {successNotice && (
          <Alert
          variant="success"
          className="d-flex justify-content-between align-items-center"
        >
          <div>{successNotice.text}</div>
          {typeof successNotice.undo === "function" && (
            <Button
              size="sm"
              variant="outline-danger"
              onClick={successNotice.undo}
            >
              Undo
            </Button>
          )}
        </Alert>
      )}
      {actionError && <Alert variant="danger">{actionError}</Alert>}

      <Row className="mb-4">
        <Col md={4} className="mb-3">
          {posterUrl && (
            <img
              src={posterUrl}
              alt={`${title} poster`}
              className="img-fluid fh-detail-poster"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = FALLBACK_POSTER_URL;
              }}
            />
          )}
        </Col>

        <Col md={8}>
          <h1 className="fh-detail-title mb-2">{title}</h1>
          {year && <p className="fh-detail-meta mb-3">{year}</p>}

          <div className="mb-3">
            {critic_score != null && (
              <Badge bg="info" className="me-2">
                Critics {critic_score}
              </Badge>
            )}
            {popularity != null && (
              <Badge bg="secondary" className="me-2">
                Pop {Math.round(popularity)}
              </Badge>
            )}
            {runtime && <Badge bg="dark">{runtime} min</Badge>}
          </div>

          {genres && genres.length > 0 && (
            <p className="mb-3">
              <strong>Genres:</strong> {genres.map((g) => g.name || g).join(", ")}
            </p>
          )}

          {overview && <p className="mb-3">{overview}</p>}

          {(director || mainCast.length > 0) && (
            <div className="mt-3">
              <h2 className="h4 fh-section-title">Cast &amp; crew</h2>

              {director && (
                <p className="mb-1">
                  <strong>Director:</strong> {director.name || director.person_name}
                </p>
              )}

              {mainCast.length > 0 && (
                <p className="mb-0">
                  <strong>Cast:</strong>{" "}
                  {mainCast
                    .map((p) => p.name || p.person_name)
                    .filter(Boolean)
                    .join(", ")}
                </p>
              )}
            </div>
          )}
        </Col>
      </Row>

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
