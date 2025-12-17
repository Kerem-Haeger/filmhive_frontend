import { createContext, useEffect, useState, useMemo, useCallback } from "react";
import api from "../services/api";

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(localStorage.getItem("fh_token") || "");
  const [user, setUser] = useState(null);
  const [isBooting, setIsBooting] = useState(true);

  const isAuthenticated = Boolean(token);

  const setSessionToken = useCallback((newToken, type = "Token") => {
    if (newToken) {
      localStorage.setItem("fh_token", newToken);
      localStorage.setItem("fh_token_type", type);
      setToken(newToken);
    } else {
      localStorage.removeItem("fh_token");
      localStorage.removeItem("fh_token_type");
      setToken("");
    }
  }, []);

  const fetchUser = useCallback(async () => {
    try {
      // Try primary endpoint
      const res = await api.get("/auth/user/");
      setUser(res.data);
    } catch (err1) {
      try {
        // Fallback for JWT/Djoser style
        const res2 = await api.get("/auth/users/me/");
        setUser(res2.data);
      } catch (err2) {
        // token invalid/expired or endpoint mismatch
        setSessionToken("");
        setUser(null);
      }
    }
  }, [setSessionToken]);

  useEffect(() => {
    (async () => {
      if (token) await fetchUser();
      setIsBooting(false);
    })();
  }, [token, fetchUser]);

  const login = useCallback(async ({ username, password }) => {
    // Use classic token login to avoid noisy 404s from missing JWT endpoints
    const res = await api.post("/auth/login/", { username, password });
    const key = res?.data?.key || res?.data?.token;
    if (!key) {
      throw new Error("Login failed: no token returned");
    }
    setSessionToken(key, "Token");
    await fetchUser();
  }, [fetchUser, setSessionToken]);

  const register = useCallback(async ({ username, email, password1, password2 }) => {
    const payload = { username, password1, password2 };

    const cleanedEmail = (email || "").trim();
    if (cleanedEmail) payload.email = cleanedEmail; // only include if user entered it

    await api.post("/auth/registration/", payload);

    // login after successful registration
    await login({ username, password: password1 });
    }, [login]);

  const logout = useCallback(async () => {
    try {
      await api.post("/auth/logout/");
    } finally {
      setSessionToken("");
      setUser(null);
    }
  }, [setSessionToken]);

const value = useMemo(() => ({
  user,
  token,
  isAuthenticated,
  isBooting,
  login,
  register,
  logout,
}), [user, token, isAuthenticated, isBooting, login, register, logout]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
