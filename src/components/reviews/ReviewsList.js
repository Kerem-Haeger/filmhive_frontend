import { memo } from "react";
import { Alert } from "react-bootstrap";
import ReviewItem from "./ReviewItem";

function ReviewsList({
  reviews,
  isLoading,
  error,
  isAuthenticated,
  animatingLikeId,
  onToggleLike,
  onReport,
  myReviewId,
}) {
  if (isLoading) {
    return <p className="text-muted">Loading reviews...</p>;
  }

  if (error) {
    return <Alert variant="danger" className="mb-0">{error}</Alert>;
  }

  if (reviews.length === 0) {
    return <p className="text-muted mb-0">No reviews yet.</p>;
  }

  // Include reviews with body text, OR the user's own review if it has a rating (even without body)
  const reviewsToShow = reviews.filter(
    (review) => {
      const hasBody = review.body && review.body.trim().length > 0;
      const isMyRatingOnly = isAuthenticated && myReviewId != null && review.id === myReviewId && review.rating != null;
      return hasBody || isMyRatingOnly;
    }
  );

  if (reviewsToShow.length === 0) {
    return <p className="text-muted mb-0">No written reviews yet.</p>;
  }

  return (
    <div>
      {reviewsToShow.map((review) => (
        <ReviewItem
          key={review.id}
          review={review}
          isAuthenticated={isAuthenticated}
          animatingLikeId={animatingLikeId}
          onToggleLike={onToggleLike}
          onReport={onReport}
          isMine={
            isAuthenticated && myReviewId != null && review.id === myReviewId
          }
        />
      ))}
    </div>
  );
}

export default memo(ReviewsList);
