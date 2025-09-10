// frontend/src/components/LogoutBtn.jsx
import React, { useState } from "react";
import { api, clearAccessToken } from "../utils/auth";
import Button from "./Button";

const LogoutBtn = ({ onLoggedOut }) => {
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    setLoading(true);
    try {
      await api.post("/auth/logout");
    } catch (err) {
      // ignore errors, proceed to clear client state
    } finally {
      clearAccessToken();
      setLoading(false);
      if (onLoggedOut) onLoggedOut();
      else window.location.href = "/login";
    }
  };

  return (
    <Button onClick={handleLogout} className="px-4 py-2">
      {loading ? "Logging out..." : "Logout"}
    </Button>
  );
};

export default LogoutBtn;
