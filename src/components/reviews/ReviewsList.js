import ReviewItem from "./ReviewItem";

function ReviewsList({
  reviews,
  isLoading,
  error,
  isAuthenticated,
  animatingLikeId,
  onToggleLike,
  onReport,
}) {
  if (isLoading) {
    return <p className="text-muted">Loading reviews...</p>;
  }

  if (error) {
    return <p className="text-danger mb-0">{error}</p>;
  }

  if (reviews.length === 0) {
    return <p className="text-muted mb-0">No reviews yet.</p>;
  }

  const reviewsWithBody = reviews.filter(
    (review) => review.body && review.body.trim().length > 0
  );

  if (reviewsWithBody.length === 0) {
    return <p className="text-muted mb-0">No written reviews yet.</p>;
  }

  return (
    <div>
      {reviewsWithBody.map((review) => (
        <ReviewItem
          key={review.id}
          review={review}
          isAuthenticated={isAuthenticated}
          animatingLikeId={animatingLikeId}
          onToggleLike={onToggleLike}
          onReport={onReport}
        />
      ))}
    </div>
  );
}

export default ReviewsList;
