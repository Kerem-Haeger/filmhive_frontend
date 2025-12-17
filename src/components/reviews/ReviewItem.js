import { memo } from "react";
import { Button } from "react-bootstrap";
import StarRatings from "react-star-ratings";

function ReviewItem({
	review,
	isAuthenticated,
	animatingLikeId,
	onToggleLike,
	onReport,
	isMine,
}) {
	const isOwner = Boolean(isMine);
	const containerClass = `fh-review-card mb-3 p-3 rounded ${
		isOwner ? "fh-review-card-mine" : ""
	}`;

	return (
		<div className={containerClass}>
			<div className="d-flex align-items-center justify-content-between mb-2">
				<div className="d-flex align-items-center">
					<strong className="mr-3">{review.user_username || "User"}</strong>
					{isOwner && (
						<span className="text-muted mr-3" style={{ fontSize: "0.85rem" }}>
							Your review
						</span>
					)}
					{review.rating != null && (
						<div className="d-flex align-items-center">
							<div className="mr-2">
								<StarRatings
									rating={review.rating}
									numberOfStars={10}
									starRatedColor="#f5c518"
									starEmptyColor="rgba(255, 255, 255, 0.2)"
									starDimension="16px"
									starSpacing="2px"
									readOnly
									name="review-rating"
								/>
							</div>
							<span className="text-muted" style={{ fontSize: "0.85rem" }}>
								({review.rating}/10)
							</span>
						</div>
					)}
				</div>
				<div className="fh-review-actions">
					{isAuthenticated ? (
						<>
							<Button
								size="sm"
								variant="dark"
								className="fh-like-btn"
								onClick={() => onToggleLike(review)}
								disabled={review._likeBusy}
							>
								<i
									className={`${
										review.liked_by_me ? "fa-solid" : "fa-regular"
									} fa-thumbs-up mr-1 ${
										animatingLikeId === review.id ? "fh-like-animate" : ""
									}`}
									style={{
										color: "#f5c518",
										fontSize: "1.2rem",
										marginRight: "6px",
									}}
								></i>
								{review.likes_count ?? 0}
							</Button>
							{!review.is_owner && (
								<Button
									size="sm"
									variant="outline-warning"
									onClick={() => onReport(review)}
									disabled={review._likeBusy}
								>
									Report
								</Button>
							)}
						</>
					) : (
						<span className="text-muted">
							<i className="fa-regular fa-thumbs-up mr-1"></i>
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
	);
}

export default memo(ReviewItem);