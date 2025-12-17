import axios from "axios";

const api = axios.create({
    baseURL: "/api",
});

// Attach token to every request (if present)
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("fh_token");
        const type = localStorage.getItem("fh_token_type") || "Token";
        if (token) {
            const scheme = type === "Bearer" ? "Bearer" : "Token";
            config.headers.Authorization = `${scheme} ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

export default api;