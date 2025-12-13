import axios from "axios";

const api = axios.create({
    baseURL: "/api",
});

// Attach token to every request (if present)
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("fh_token");
        if (token) {
            config.headers.Authorization = `Token ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

export default api;