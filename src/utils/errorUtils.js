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