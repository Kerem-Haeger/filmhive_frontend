import {
    useEffect,
    useState
} from "react";

export function useReviewForm(myReview, isAuthenticated) {
    const [rating, setRating] = useState(8);
    const [body, setBody] = useState("");
    const [isEditing, setIsEditing] = useState(false);

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

    const resetForm = () => {
        if (myReview) {
            setRating(myReview.rating ?? 8);
            setBody(myReview.body ?? "");
        } else {
            setRating(8);
            setBody("");
        }
        setIsEditing(false);
    };

    return {
        rating,
        setRating,
        body,
        setBody,
        isEditing,
        setIsEditing,
        resetForm,
    };
}