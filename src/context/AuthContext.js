import { createContext, useEffect, useState } from "react";
import api from "../services/api";

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(localStorage.getItem("fh_token") || "");
  const [user, setUser] = useState(null);
  const [isBooting, setIsBooting] = useState(true);

  const isAuthenticated = Boolean(token);

  const setSessionToken = (newToken) => {
    if (newToken) {
      localStorage.setItem("fh_token", newToken);
      setToken(newToken);
    } else {
      localStorage.removeItem("fh_token");
      setToken("");
    }
  };

  const fetchUser = async () => {
    try {
      const res = await api.get("/auth/user/");
      setUser(res.data);
    } catch {
      // token invalid/expired
      setSessionToken("");
      setUser(null);
    }
  };

  useEffect(() => {
    (async () => {
      if (token) await fetchUser();
      setIsBooting(false);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const login = async ({ username, password }) => {
    const res = await api.post("/auth/login/", { username, password });
    setSessionToken(res.data.key);
    await fetchUser();
  };

  const register = async ({ username, email, password1, password2 }) => {
    await api.post("/auth/registration/", {
      username,
      email,
      password1,
      password2,
    });
    // dj-rest-auth registration often returns a key if configured; but to be safe:
    // immediately login after successful registration
    await login({ username, password: password1 });
  };

  const logout = async () => {
    try {
      await api.post("/auth/logout/");
    } finally {
      setSessionToken("");
      setUser(null);
    }
  };

const value = {
  user,
  token,
  isAuthenticated,
  isBooting,
  login,
  register,
  logout,
};

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
