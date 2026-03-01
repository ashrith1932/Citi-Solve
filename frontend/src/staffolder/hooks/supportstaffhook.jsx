import { useState } from "react";

const API = import.meta.env.VITE_BACKEND_URL;

export const useStaffSupport = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /* =========================
     FETCH STAFF PROFILE
  ========================= */
  const fetchProfile = async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`${API}/api/staff/profile`, {
        credentials: "include",
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Not authenticated");
      }

      return data.profile;
    } catch (err) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  /* =========================
     CONTACT ADMIN
     (Send support message)
  ========================= */
  const contactAdmin = async (messageData) => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`${API}/api/support/submit`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          subject: messageData.subject,
          category: messageData.category,
          message: messageData.message,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || data.error || "Failed to send message");
      }

      return {
        success: true,
        message: data.message,
      };
    } catch (err) {
      setError(err.message);
      return {
        success: false,
        error: err.message,
      };
    } finally {
      setLoading(false);
    }
  };

  /* =========================
     LOGOUT
  ========================= */
  const logoutStaff = async () => {
    try {
      await fetch(`${API}/api/auth/logout`, {
        method: "POST",
        credentials: "include",
      });
    } catch {
      // silent fail (cookies cleared anyway)
    }
  };

  return {
    loading,
    error,
    fetchProfile,
    contactAdmin,
    logoutStaff,
  };
};