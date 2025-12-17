import { memo } from "react";
import { Link } from "react-router-dom";
import { Button, Form, Spinner } from "react-bootstrap";
import StarRatings from "react-star-ratings";

function ReviewForm({
  isAuthenticated,
  from,
  myReview,
  isEditing,
  rating,
  body,
  isSubmitting,
  onRatingChange,
  onBodyChange,
  onSubmit,
  onEdit,
  onDelete,
  onCancel,
}) {
  if (!isAuthenticated) {
    return (
      <p className="text-muted mb-0">
        <Link to="/login" state={{ from }}>
          Login
        </Link>{" "}
        to add your rating and review.
      </p>
    );
  }

  return (
    <>
      {myReview && !isEditing && (
        <div className="mb-3">
          <p className="text-muted mb-2">
            You've already reviewed or rated this film.
          </p>
          <div className="d-flex gap-3">
            <Button size="sm" variant="outline-light" onClick={onEdit}>
              Edit
            </Button>
            <Button size="sm" variant="outline-danger" onClick={onDelete}>
              Delete
            </Button>
          </div>
        </div>
      )}

      {(!myReview || isEditing) && (
        <Form onSubmit={onSubmit}>
          <Form.Group className="mb-3">
            <Form.Label>Your Rating</Form.Label>
            <div>
              <StarRatings
                rating={rating ? parseFloat(rating) : 0}
                changeRating={(value) => onRatingChange(String(value))}
                numberOfStars={10}
                name="film-rating"
                starRatedColor="#f5c518"
                starEmptyColor="rgba(255, 255, 255, 0.2)"
                starHoverColor="#ffd700"
                starDimension="20px"
                starSpacing="2px"
              />
            </div>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Review (optional)</Form.Label>
            <Form.Control
              as="textarea"
              rows={4}
              value={body}
              onChange={(e) => onBodyChange(e.target.value)}
              placeholder="What did you think?"
            />
          </Form.Group>

          <div className="d-flex gap-3">
            <Button variant="warning" type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Spinner as="span" animation="border" size="sm" /> Saving...
                </>
              ) : myReview ? (
                "Save changes"
              ) : (
                "Post review"
              )}
            </Button>
            {myReview && isEditing && (
              <Button variant="outline-light" type="button" onClick={onCancel}>
                Cancel
              </Button>
            )}
          </div>
        </Form>
      )}
    </>
  );
}

export default memo(ReviewForm);
