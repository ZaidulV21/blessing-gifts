// src/components/Navbar.jsx
// FIX: Mobile hamburger menu + responsive nav

import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { ShoppingBag, Menu, X, Search } from "lucide-react";
import { useCart } from "../context/CartContext";

export default function Navbar() {
  const { cartCount } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const links = [
    { label: "Home",        path: "/" },
    { label: "Shop",        path: "/shop" },
    { label: "Track Order", path: "/track" },
  ];

  const isActive = (path) =>
    path === "/" ? location.pathname === "/" : location.pathname.startsWith(path);

  const closeMenu = () => setMobileOpen(false);

  return (
    <>
      <nav
        className="sticky top-0 z-50 border-b"
        style={{
          background: "rgba(253,251,248,0.96)",
          backdropFilter: "blur(16px)",
          borderColor: "var(--border-soft)",
          height: "68px",
        }}
      >
        <div
          className="max-w-7xl mx-auto px-4 sm:px-6 h-full flex items-center justify-between"
        >
          {/* ── BRAND ── */}
          <Link to="/" className="flex items-center gap-3 flex-shrink-0">
            <div style={{ width: 30, height: 30 }}>
              <svg viewBox="0 0 30 30" fill="none">
                <circle cx="15" cy="15" r="13" stroke="#B8912A" strokeWidth="1" />
                <path
                  d="M15 7L17.5 12L23 13L19 17L20.2 23L15 20.5L9.8 23L11 17L7 13L12.5 12Z"
                  fill="#B8912A" opacity="0.85"
                />
              </svg>
            </div>
            <div>
              <span
                style={{
                  fontFamily: "'Lato', 'Open Sans', sans-serif",
                  fontSize: "1.25rem",
                  fontWeight: 500,
                  color: "var(--ink)",
                  display: "block",
                  lineHeight: 1.15,
                }}
              >
                Blessing Gifts
              </span>
              <span
                style={{
                  fontSize: "0.52rem",
                  letterSpacing: "3px",
                  textTransform: "uppercase",
                  color: "var(--gold)",
                  display: "block",
                  lineHeight: 1,
                }}
              >
                Premium Collection
              </span>
            </div>
          </Link>

          {/* ── DESKTOP LINKS ── */}
          <div className="nav-desktop-links hidden md:flex items-center gap-8">
            {links.map((l) => (
              <Link
                key={l.path}
                to={l.path}
                style={{
                  fontSize: "0.72rem",
                  letterSpacing: "1.5px",
                  textTransform: "uppercase",
                  fontFamily: "'Open Sans', sans-serif",
                  color: isActive(l.path) ? "var(--gold)" : "var(--ink-muted)",
                  textDecoration: "none",
                  paddingBottom: "4px",
                  borderBottom: isActive(l.path)
                    ? "1px solid var(--gold)"
                    : "1px solid transparent",
                  transition: "all 0.2s",
                }}
              >
                {l.label}
              </Link>
            ))}
          </div>

          {/* ── RIGHT ACTIONS ── */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Search */}
            <div style={{ position: "relative" }}>
              {searchOpen ? (
                <input
                  autoFocus
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") { navigate(`/shop?q=${encodeURIComponent(searchQuery)}`); setSearchOpen(false); setSearchQuery(""); } }}
                  placeholder="Search products..."
                  style={{ width: 220, padding: "8px 10px", borderRadius: 6, border: "1px solid var(--border)", fontFamily: "'Open Sans', sans-serif" }}
                />
              ) : (
                <button onClick={() => setSearchOpen(true)} title="Search" style={{ width: 38, height: 38, display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', background: 'none', cursor: 'pointer' }}>
                  <Search size={18} color="var(--ink-muted)" />
                </button>
              )}
            </div>
            {/* Admin — desktop only */}
            <button
              onClick={() => navigate("/admin")}
              className="nav-admin-btn hidden md:block"
                style={{
                fontSize: "0.68rem",
                letterSpacing: "1px",
                textTransform: "uppercase",
                	fontFamily: "'Open Sans', sans-serif",
                color: "var(--ink-faint)",
                border: "1px solid var(--border)",
                background: "none",
                padding: "7px 16px",
                cursor: "pointer",
                transition: "all 0.2s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "var(--gold)";
                e.currentTarget.style.color = "var(--gold)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "var(--border)";
                e.currentTarget.style.color = "var(--ink-faint)";
              }}
            >
              Admin
            </button>

            {/* Cart */}
            <button
              onClick={() => navigate("/cart")}
              className="relative flex items-center justify-center rounded-full transition-colors"
              style={{ width: 38, height: 38 }}
              title="Cart"
            >
              <ShoppingBag size={18} color="var(--ink-muted)" />
              {cartCount > 0 && (
                <span
                  className="absolute flex items-center justify-center"
                  style={{
                    top: 5, right: 5,
                    width: 16, height: 16,
                    background: "var(--gold)",
                    color: "white",
                    fontSize: "0.55rem",
                    fontWeight: 700,
                    borderRadius: "50%",
                  }}
                >
                  {cartCount > 99 ? "99+" : cartCount}
                </span>
              )}
            </button>

            {/* Hamburger — mobile only */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="nav-hamburger flex md:hidden items-center justify-center"
              style={{ background: "none", border: "none", cursor: "pointer", padding: "4px" }}
            >
              {mobileOpen
                ? <X size={22} color="var(--ink-muted)" />
                : <Menu size={22} color="var(--ink-muted)" />
              }
            </button>
          </div>
        </div>
      </nav>

      {/* ── MOBILE MENU DROPDOWN ── */}
      {mobileOpen && (
        <div
          className="md:hidden fixed top-[68px] left-0 right-0 z-40 border-b"
          style={{
            background: "var(--cream)",
            borderColor: "var(--border-soft)",
            padding: "1rem 1.5rem 1.5rem",
          }}
        >
          <div className="flex flex-col gap-4">
            {links.map((l) => (
              <Link
                key={l.path}
                to={l.path}
                onClick={closeMenu}
                style={{
                  fontSize: "0.82rem",
                  letterSpacing: "1.5px",
                  textTransform: "uppercase",
                  fontFamily: "'Open Sans', sans-serif",
                  color: isActive(l.path) ? "var(--gold)" : "var(--ink-muted)",
                  textDecoration: "none",
                }}
              >
                {l.label}
              </Link>
            ))}
            <Link
              to="/admin"
              onClick={closeMenu}
                style={{
                fontSize: "0.78rem",
                letterSpacing: "1.5px",
                textTransform: "uppercase",
                  fontFamily: "'Open Sans', sans-serif",
                color: "var(--ink-faint)",
                textDecoration: "none",
                paddingTop: "0.5rem",
                borderTop: "1px solid var(--border-soft)",
              }}
            >
              Admin Panel →
            </Link>
          </div>
        </div>
      )}
    </>
  );
}
