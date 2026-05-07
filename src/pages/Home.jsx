// src/pages/Home.jsx
// Loads products from the API in real-time via useProducts hook

import { useNavigate } from "react-router-dom";
import { ArrowRight, Truck, ShieldCheck, MessageCircle, RotateCcw } from "lucide-react";
import { useProducts } from "../hooks/useProducts";
import { CATEGORIES } from "../data/products";
import ProductCard from "../components/ProductCard";

export default function Home() {
  const navigate = useNavigate();
  const { products } = useProducts();

  const featuredCars = products.filter((p) => p.category === "Toy Cars").slice(0, 4);
  const newArrivals  = products.filter((p) => p.badge === "new").slice(0, 4);

  const trust = [
    { icon: <Truck size={14} />,         text: "Pan-India Delivery" },
    { icon: <ShieldCheck size={14} />,   text: "100% Genuine Products" },
    { icon: <MessageCircle size={14} />, text: "WhatsApp Support 24/7" },
    { icon: <RotateCcw size={14} />,     text: "7-Day Easy Returns" },
  ];

  // Shared styles
  const sectionLabel = {
    fontSize: "0.62rem", letterSpacing: "3px",
    textTransform: "uppercase", color: "var(--gold)",
    marginBottom: "0.5rem", fontFamily: "'Jost', sans-serif",
    display: "block",
  };
  const sectionH2 = {
    fontFamily: "'Cormorant Garamond', serif",
    fontSize: "clamp(1.8rem,3vw,2.4rem)",
    fontWeight: 400, color: "var(--ink)",
  };
  const seeAllBtn = {
    fontSize: "0.7rem", letterSpacing: "1.5px",
    textTransform: "uppercase", color: "var(--ink-muted)",
    border: "none", background: "none", cursor: "pointer",
    fontFamily: "'Jost', sans-serif",
    display: "flex", alignItems: "center", gap: "4px",
  };

  return (
    <div className="page-enter">

      {/* ── HERO ──────────────────────────────────────────────── */}
      <section
        className="hero-section"
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          alignItems: "center",
          gap: "3rem",
          padding: "5rem 2rem 4rem",
          maxWidth: "1300px",
          margin: "0 auto",
          minHeight: "88vh",
        }}
      >
        {/* Text */}
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "1.5rem" }}>
            <div style={{ width: 28, height: 1, background: "var(--gold)" }} />
            <span style={{ ...sectionLabel, margin: 0 }}>Premium Gift Atelier</span>
          </div>

          <h1
            className="hero-h1"
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: "clamp(2.6rem,5vw,4.2rem)",
              lineHeight: 1.08, fontWeight: 400,
              color: "var(--ink)", marginBottom: "1.2rem",
            }}
          >
            Find the gift<br />
            they'll{" "}
            <em style={{ fontStyle: "italic", color: "var(--gold)", fontWeight: 300 }}>never</em>
            <br />forget.
          </h1>

          <p style={{
            fontSize: "0.9rem", fontWeight: 300, lineHeight: 1.85,
            color: "var(--ink-muted)", maxWidth: "360px",
            marginBottom: "2.5rem", fontFamily: "'Jost', sans-serif",
          }}>
            Hand-curated toy cars, showpieces & gift sets — crafted to celebrate every moment with elegance.
          </p>

          <div className="hero-btns-wrap" style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
            <button
              onClick={() => navigate("/shop")}
              style={{
                background: "var(--gold)", color: "white", border: "none",
                padding: "13px 30px", fontFamily: "'Jost', sans-serif",
                fontSize: "0.75rem", fontWeight: 500,
                letterSpacing: "1.5px", textTransform: "uppercase",
                cursor: "pointer", display: "flex", alignItems: "center", gap: "6px",
                transition: "all 0.2s",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = "var(--gold-light)"; e.currentTarget.style.transform = "translateY(-1px)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = "var(--gold)"; e.currentTarget.style.transform = "none"; }}
            >
              Shop Collection <ArrowRight size={14} />
            </button>
            <button
              onClick={() => navigate("/track")}
              style={{
                background: "none", color: "var(--ink)",
                border: "1px solid var(--border)", padding: "12px 28px",
                fontFamily: "'Jost', sans-serif", fontSize: "0.75rem",
                letterSpacing: "1.5px", textTransform: "uppercase", cursor: "pointer",
              }}
            >
              Track Order
            </button>
          </div>
        </div>

        {/* Hero Image */}
        <div style={{ position: "relative" }}>
          <div
            className="hero-image"
            style={{ width: "100%", height: "60vh", maxHeight: "520px", borderRadius: "2px", overflow: "hidden" }}
          >
            <img
              src="https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=900&q=90"
              alt="Premium gift"
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          </div>
          <div
            className="hero-accent-card"
            style={{
              position: "absolute", bottom: "-16px", left: "-16px",
              background: "white", border: "1px solid var(--border-soft)",
              padding: "12px 18px", boxShadow: "0 4px 20px rgba(0,0,0,0.06)",
            }}
          >
            <div style={{ fontSize: "0.58rem", letterSpacing: "2px", textTransform: "uppercase", color: "var(--ink-faint)", marginBottom: "2px", fontFamily: "'Jost', sans-serif" }}>
              Free Delivery on
            </div>
            <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.15rem", color: "var(--ink)" }}>
              Orders over ₹999
            </div>
          </div>
        </div>
      </section>

      {/* ── TRUST STRIP ──────────────────────────────────────── */}
      <div style={{ background: "var(--ink)", padding: "12px 2rem" }}>
        <div className="trust-inner" style={{ maxWidth: "1300px", margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "center", gap: "2.5rem", flexWrap: "wrap" }}>
          {trust.map((t, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: "8px", color: "rgba(255,255,255,0.55)", fontSize: "0.68rem", letterSpacing: "1px", textTransform: "uppercase", fontFamily: "'Jost', sans-serif" }}>
              <span style={{ opacity: 0.5 }}>{t.icon}</span>{t.text}
            </div>
          ))}
        </div>
      </div>

      {/* ── CATEGORIES ───────────────────────────────────────── */}
      <div style={{ maxWidth: "1300px", margin: "0 auto", padding: "4.5rem 2rem" }}>
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: "2.5rem", flexWrap: "wrap", gap: "1rem" }}>
          <div>
            <span style={sectionLabel}>Collections</span>
            <h2 style={sectionH2}>Shop by <em style={{ fontStyle: "italic", fontWeight: 300 }}>Category</em></h2>
          </div>
          <button onClick={() => navigate("/shop")} style={seeAllBtn}>
            View all <ArrowRight size={13} />
          </button>
        </div>

        <div
          className="category-grid"
          style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "12px" }}
        >
          {CATEGORIES.map((cat) => (
            <div
              key={cat.name}
              className="cat-card-item"
              onClick={() => navigate(`/shop?category=${encodeURIComponent(cat.name)}`)}
              style={{ height: "340px", borderRadius: "2px", overflow: "hidden", cursor: "pointer", position: "relative", transition: "transform 0.3s" }}
              onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.015)")}
              onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
            >
              <img src={cat.img} alt={cat.name} style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.5s" }} />
              <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top,rgba(0,0,0,.65) 0%,transparent 55%)" }} />
              <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "20px" }}>
                <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.4rem", fontWeight: 400, color: "white", marginBottom: "2px" }}>{cat.name}</div>
                <div style={{ fontSize: "0.68rem", letterSpacing: "1px", color: "rgba(255,255,255,0.65)", fontFamily: "'Jost', sans-serif" }}>{cat.subtitle}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── FEATURED TOY CARS ────────────────────────────────── */}
      <div style={{ maxWidth: "1300px", margin: "0 auto", padding: "0 2rem 4.5rem" }}>
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: "2.5rem", flexWrap: "wrap", gap: "1rem" }}>
          <div>
            <span style={sectionLabel}>Bestsellers</span>
            <h2 style={sectionH2}>Our finest <em style={{ fontStyle: "italic", fontWeight: 300 }}>Toy Cars</em></h2>
          </div>
          <button onClick={() => navigate(`/shop?category=${encodeURIComponent("Toy Cars")}`)} style={seeAllBtn}>
            See all cars <ArrowRight size={13} />
          </button>
        </div>
        <div className="products-main-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(240px,1fr))", gap: "2px" }}>
          {featuredCars.map((p) => (
            <ProductCard key={p.id} product={p} onClick={() => navigate(`/product/${p.id}`)} />
          ))}
        </div>
      </div>

      {/* ── EDITORIAL BAND ───────────────────────────────────── */}
      <section style={{ background: "var(--gold-xpale)", borderTop: "1px solid var(--gold-pale)", borderBottom: "1px solid var(--gold-pale)", padding: "4.5rem 2rem" }}>
        <div className="editorial-inner" style={{ maxWidth: "1300px", margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "5rem", alignItems: "center" }}>
          <div className="editorial-image" style={{ height: "420px", borderRadius: "2px", overflow: "hidden" }}>
            <img src="https://images.unsplash.com/photo-1596464716127-f2a82984de30?w=800&q=85" alt="Gifting" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          </div>
          <div>
            <span style={sectionLabel}>Our Promise</span>
            <blockquote style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.9rem", fontWeight: 300, fontStyle: "italic", lineHeight: 1.5, color: "var(--ink)", marginBottom: "1.2rem" }}>
              "Every gift tells a story. We help you write the perfect one."
            </blockquote>
            <p style={{ fontSize: "0.86rem", fontWeight: 300, lineHeight: 1.95, color: "var(--ink-muted)", marginBottom: "2rem", fontFamily: "'Jost', sans-serif" }}>
              At Blessing Gifts, we believe gifting is an art form. Each product is carefully selected for quality, beauty and the joy it brings — from premium die-cast toy cars to handcrafted showpieces, delivered with care across India.
            </p>
            <button
              onClick={() => navigate("/shop")}
              style={{ background: "var(--gold)", color: "white", border: "none", padding: "13px 30px", fontFamily: "'Jost', sans-serif", fontSize: "0.75rem", fontWeight: 500, letterSpacing: "1.5px", textTransform: "uppercase", cursor: "pointer" }}
            >
              Explore Collection
            </button>
          </div>
        </div>
      </section>

      {/* ── NEW ARRIVALS ─────────────────────────────────────── */}
      <div style={{ maxWidth: "1300px", margin: "0 auto", padding: "4.5rem 2rem" }}>
        <div style={{ marginBottom: "2.5rem" }}>
          <span style={sectionLabel}>Just In</span>
          <h2 style={sectionH2}>New <em style={{ fontStyle: "italic", fontWeight: 300 }}>Arrivals</em></h2>
        </div>
        <div className="products-main-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(240px,1fr))", gap: "2px" }}>
          {newArrivals.map((p) => (
            <ProductCard key={p.id} product={p} onClick={() => navigate(`/product/${p.id}`)} />
          ))}
        </div>
      </div>
    </div>
  );
}
