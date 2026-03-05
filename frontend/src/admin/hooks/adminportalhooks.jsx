import { useState } from "react";

const API = import.meta.env.VITE_BACKEND_URL;

export const useAdminPortal = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /* =========================
     FETCH ADMIN PROFILE
  ========================= */
  const fetchProfile = async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`${API}/api/auth/profile`, {
        credentials: "include",
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Not authenticated");
      }

      return data;
    } catch (err) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  /* =========================
     LOGOUT
  ========================= */
  const logoutAdmin = async () => {
    try {
      await fetch(`${API}/api/auth/logout`, {
        method: "POST",
        credentials: "include",
      });
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  return {
    loading,
    error,
    fetchProfile,
    logoutAdmin,
  };
};