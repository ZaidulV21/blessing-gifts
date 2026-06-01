// src/pages/admin/AdminLogin.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAdmin } from "../../context/AdminContext";

export default function AdminLogin() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);
  const { adminLogin } = useAdmin();
  const navigate = useNavigate();

  const handleLogin = () => {
    setError(false);
    if (adminLogin(username, password)) {
      navigate("/admin/dashboard");
    } else {
      setError(true);
    }
  };

  return (
    <div className="min-h-[calc(100vh-68px)] bg-ink flex items-center justify-center px-4">
      <div className="bg-white p-12 w-full max-w-[390px] text-center rounded-sm">
        {/* Logo */}
        <div className="w-10 h-10 mx-auto mb-5">
          <svg viewBox="0 0 32 32" fill="none">
            <circle cx="16" cy="16" r="14" stroke="#B8912A" strokeWidth="1"/>
            <path d="M16 8L19 13L25 14L20.5 18.5L21.8 25L16 22L10.2 25L11.5 18.5L7 14L13 13Z" fill="#B8912A" opacity="0.85"/>
          </svg>
        </div>

        <h1 className="font-serif text-[1.6rem] font-normal text-ink mb-1">Blessing Gifts</h1>
        <p className="text-[0.62rem] font-sans tracking-[2.5px] uppercase text-gold mb-10">Admin Panel</p>

        <div className="text-left mb-4">
          <label className="block text-[0.62rem] font-sans font-medium tracking-[2px] uppercase text-ink-muted mb-2">
            Username
          </label>
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="admin"
            className="w-full px-4 py-2.5 border border-border bg-cream font-sans text-[0.88rem] outline-none focus:border-gold rounded-sm"
          />
        </div>

        <div className="text-left mb-2">
          <label className="block text-[0.62rem] font-sans font-medium tracking-[2px] uppercase text-ink-muted mb-2">
            Password
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleLogin()}
            placeholder="••••••••"
            className="w-full px-4 py-2.5 border border-border bg-cream font-sans text-[0.88rem] outline-none focus:border-gold rounded-sm"
          />
        </div>

        {error && (
          <div className="text-red-500 font-sans text-[0.78rem] mb-3 text-left">
            ❌ Invalid credentials. Please try again.
          </div>
        )}

        <button
          onClick={handleLogin}
          className="w-full bg-ink text-white bg-black py-3 font-sans text-[0.75rem] font-medium tracking-[2px] uppercase hover:bg-gold transition-colors mt-4 rounded-sm"
        >
          Enter Panel →
        </button>

        <div className="mt-6 text-[0.68rem] font-sans text-ink-faint/60">
          Default: admin / blessing@2025
        </div>
      </div>
    </div>
  );
}
