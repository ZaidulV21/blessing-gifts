// src/context/AdminContext.jsx
import { createContext, useContext, useState } from "react";

const AdminContext = createContext();

// ─────────────────────────────────────────────────────────────────
//  ADMIN CREDENTIALS
//  Change these before going live!
//  For production: use Firebase Authentication instead.
// ─────────────────────────────────────────────────────────────────
const ADMIN_USERNAME = "admin";
const ADMIN_PASSWORD = "blessing@2025";

export function AdminProvider({ children }) {
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(
    () => sessionStorage.getItem("bg_admin") === "true"
  );

  const adminLogin = (username, password) => {
    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
      sessionStorage.setItem("bg_admin", "true");
      setIsAdminLoggedIn(true);
      return true;
    }
    return false;
  };

  const adminLogout = () => {
    sessionStorage.removeItem("bg_admin");
    setIsAdminLoggedIn(false);
  };

  return (
    <AdminContext.Provider value={{ isAdminLoggedIn, adminLogin, adminLogout }}>
      {children}
    </AdminContext.Provider>
  );
}

export const useAdmin = () => useContext(AdminContext);
