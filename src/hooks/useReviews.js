import { useMemo, useState, useCallback } from "react";
import { reviewService } from "../services/reviewService";
import { parseApiError, formatError } from "../utils/errorUtils";

export function useReviews(filmId, user, isAuthenticated) {
  const [reviews, setReviews] = useState([]);
  const [isReviewsLoading, setIsReviewsLoading] = useState(true);
  const [reviewsError, setReviewsError] = useState("");
  const [animatingLikeId, setAnimatingLikeId] = useState(null);

  const fetchReviews = useCallback(async () => {
    try {
      setIsReviewsLoading(true);
      setReviewsError("");
      const data = await reviewService.getReviewsByFilmId(filmId);
      setReviews(data);
    } catch (err) {
      console.error(err);
      setReviewsError(formatError(err, "Could not load reviews."));
    } finally {
      setIsReviewsLoading(false);
    }
  }, [filmId]);

  const myReview = useMemo(() => {
    if (!isAuthenticated) return null;

    const byFlag = reviews.find((r) => r.is_owner);
    if (byFlag) return byFlag;

    const myId = user?.id;
    if (!myId) return null;
    return reviews.find((r) => String(r.user) === String(myId)) || null;
  }, [reviews, isAuthenticated, user]);

  const toggleLike = useCallback(async (review, onError) => {
    if (!isAuthenticated || review._likeBusy) return;

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
        await reviewService.unlikeReview(review.my_like_id);
      } else {
        const res = await reviewService.likeReview(review.id);
        setReviews((prev) =>
          prev.map((r) => (r.id === review.id ? { ...r, my_like_id: res.id } : r))
        );
      }
    } catch (err) {
      console.error(err);
      if (onError) onError(parseApiError(err, "Could not update like."));
      await fetchReviews();
    } finally {
      setAnimatingLikeId(null);
      setReviews((prev) =>
        prev.map((r) => (r.id === review.id ? { ...r, _likeBusy: false } : r))
      );
    }
  }, [isAuthenticated, fetchReviews]);

  const reportReview = useCallback(async (review, onSuccess, onError) => {
    if (!isAuthenticated || review._reportBusy) return;

    if (!window.confirm("Report this review?")) return;

    setReviews((prev) =>
      prev.map((r) => (r.id === review.id ? { ...r, _reportBusy: true } : r))
    );

    try {
      const res = await reviewService.reportReview(review.id);
      const reportId = res?.id;

      setReviews((prev) => prev.filter((r) => r.id !== review.id));

      if (onSuccess) {
        onSuccess(reportId, async () => {
          try {
            await reviewService.unreportReview(reportId);
            await fetchReviews();
            return "Report undone.";
          } catch (err) {
            console.error(err);
            throw new Error(parseApiError(err, "Could not undo report."));
          }
        });
      }
    } catch (err) {
      console.error(err);
      if (onError) onError(parseApiError(err, "Could not report review."));
    }
  }, [isAuthenticated, fetchReviews]);

  return {
    reviews,
    isReviewsLoading,
    reviewsError,
    myReview,
    animatingLikeId,
    fetchReviews,
    toggleLike,
    reportReview,
  };
}
