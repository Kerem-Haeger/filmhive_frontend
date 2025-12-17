import { memo } from "react";
import { Badge, Button } from "react-bootstrap";

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
					<strong>{review.user_username || "User"}</strong>
					{isOwner && (
						<Badge bg="secondary" className="ms-2">
							Your review
						</Badge>
					)}
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
								onClick={() => onToggleLike(review)}
								disabled={review._likeBusy}
							>
								<span
									className={`fh-thumb ${
										review.liked_by_me ? "" : "fh-thumb-muted"
									} ${animatingLikeId === review.id ? "fh-like-animate" : ""}`}
								>
									👍
								</span>
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
	);
}

export default memo(ReviewItem);