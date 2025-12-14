import {
    useRef,
    useState
} from "react";

export function useNotification() {
    const [successNotice, setSuccessNotice] = useState(null);
    const [actionError, setActionError] = useState("");
    const successTimerRef = useRef(null);

    const showSuccess = (text, opts = {}) => {
        const durationMs = opts.durationMs ?? 3000;

        setSuccessNotice({
            text,
            undo: opts.undo,
        });

        if (successTimerRef.current) clearTimeout(successTimerRef.current);
        successTimerRef.current = setTimeout(() => setSuccessNotice(null), durationMs);
    };

    const clearError = () => setActionError("");

    const clearNotifications = () => {
        setSuccessNotice(null);
        setActionError("");
    };

    return {
        successNotice,
        actionError,
        setActionError,
        showSuccess,
        clearError,
        clearNotifications,
        successTimerRef,
    };
}