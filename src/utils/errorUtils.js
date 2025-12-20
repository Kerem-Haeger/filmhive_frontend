export function parseApiError(err, fallback = "Something went wrong.") {
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
}

export function getStatusCode(err) {
    const status = err?.response?.status;
    return typeof status === "number" ? status : null;
}

export function formatError(err, fallback = "Something went wrong.") {
    const status = getStatusCode(err);
    let message = fallback;

    if (!err?.response) {
        // Network error or no response
        message = "We couldn't reach the server. Please check your connection.";
    } else if (status === 401) {
        message = "You need to be logged in to perform this action.";
    } else if (status === 403) {
        message = "You don’t have permission to do that.";
    } else if (status === 404) {
        message = "We couldn’t find what you’re looking for.";
    } else if (status === 408) {
        message = "The request timed out. Please try again.";
    } else if (status && status >= 500) {
        message = "Something went wrong on our side. Please try again.";
    } else if (status === 400) {
        // Prefer API-provided validation messages
        message = parseApiError(err, fallback);
    } else {
        message = parseApiError(err, fallback);
    }

    if (status) {
        message = `${message} (${status})`;
    }
    return message;
}