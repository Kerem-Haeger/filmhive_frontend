import {
    useEffect,
    useState,
    useCallback
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

    const resetForm = useCallback(() => {
        if (myReview) {
            setRating(myReview.rating ?? 8);
            setBody(myReview.body ?? "");
        } else {
            setRating(8);
            setBody("");
        }
        setIsEditing(false);
    }, [myReview]);

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