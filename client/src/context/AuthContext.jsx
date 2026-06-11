import React, { createContext, useState, useEffect, useContext } from "react";
import api from "../services/api";
import i18n from "../i18n";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Safe auth init (fixes Vercel/SSR issues)
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        if (typeof window === "undefined") {
          setLoading(false);
          return;
        }

        const token = localStorage.getItem("token");

        if (!token) {
          setLoading(false);
          return;
        }

        const res = await api.auth.getMe();

        if (res?.success && res?.user) {
          setUser(res.user);

          const storedLang = localStorage.getItem("ayn-lang") || "en";

          if (res.user.preferredLanguage) {
            if (res.user.preferredLanguage !== storedLang) {
              i18n.changeLanguage(res.user.preferredLanguage);
              localStorage.setItem("ayn-lang", res.user.preferredLanguage);
            }
          }
        } else {
          localStorage.removeItem("token");
        }
      } catch (error) {
        console.error("Session restoration failed:", error);
        localStorage.removeItem("token");
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (email, password) => {
    setLoading(true);

    try {
      const res = await api.auth.login({ email, password });

      if (res?.success && res?.token) {
        localStorage.setItem("token", res.token);
        setUser(res.user);

        if (res.user?.preferredLanguage) {
          i18n.changeLanguage(res.user.preferredLanguage);
          localStorage.setItem("ayn-lang", res.user.preferredLanguage);
        }

        return { success: true, user: res.user };
      }

      return {
        success: false,
        message: res?.message || "Login failed",
      };
    } catch (error) {
      return {
        success: false,
        message: error?.message || "Login failed",
      };
    } finally {
      setLoading(false);
    }
  };

  const register = async (name, email, password, role, phone) => {
    setLoading(true);

    try {
      let preferredLanguage = "en";

      if (typeof window !== "undefined") {
        preferredLanguage = localStorage.getItem("ayn-lang") || "en";
      }

      const res = await api.auth.register({
        name,
        email,
        password,
        role,
        phone,
        preferredLanguage,
      });

      if (res?.success && res?.token) {
        localStorage.setItem("token", res.token);
        setUser(res.user);

        if (res.user?.preferredLanguage) {
          i18n.changeLanguage(res.user.preferredLanguage);
          localStorage.setItem("ayn-lang", res.user.preferredLanguage);
        }

        return { success: true, user: res.user };
      }

      return {
        success: false,
        message: res?.message || "Registration failed",
      };
    } catch (error) {
      return {
        success: false,
        message: error?.message || "Registration failed",
      };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("token");
    }
    setUser(null);
  };

  const updateLocalDosha = (dominantDosha) => {
    if (user) {
      setUser((prev) => ({ ...prev, dominantDosha }));
    }
  };

  const updateLocalLanguage = (preferredLanguage) => {
    if (user) {
      setUser((prev) => ({ ...prev, preferredLanguage }));
    }
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    updateLocalDosha,
    updateLocalLanguage,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
