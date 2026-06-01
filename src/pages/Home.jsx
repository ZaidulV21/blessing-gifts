// src/pages/Home.jsx
// Loads products from the API in real-time via useProducts hook

import { useNavigate } from "react-router-dom";
import { ArrowRight, Truck, ShieldCheck, MessageCircle, RotateCcw } from "lucide-react";
import { useProducts } from "../hooks/useProducts";
import { CATEGORIES } from "../data/products";
import ProductCard from "../components/ProductCard";
import HeroSlider from "../components/HeroSlider";

export default function Home() {
  const navigate = useNavigate();
  const { products, loading } = useProducts();

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
    marginBottom: "0.5rem", fontFamily: "'Open Sans', sans-serif",
    display: "block",
  };
  const sectionH2 = {
    fontFamily: "'Lato', 'Open Sans', sans-serif",
    fontSize: "clamp(1.8rem,3vw,2.4rem)",
    fontWeight: 400, color: "var(--ink)",
  };
  const seeAllBtn = {
    fontSize: "0.7rem", letterSpacing: "1.5px",
    textTransform: "uppercase", color: "var(--ink-muted)",
    border: "none", background: "none", cursor: "pointer",
    fontFamily: "'Open Sans', sans-serif",
    display: "flex", alignItems: "center", gap: "4px",
  };
  const gridSkeleton = Array.from({ length: 4 });

  return (
    <div className="page-enter">

      <HeroSlider />

      {/* ── TRUST STRIP ──────────────────────────────────────── */}
      <div className="animate-section" style={{ background: "var(--ink)", padding: "12px 2rem", marginTop: "24px" }}>
        <div className="trust-inner animate-item" style={{ maxWidth: "1300px", margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "center", gap: "2.5rem", flexWrap: "wrap" }}>
          {trust.map((t, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: "8px", color: "rgba(255,255,255,0.55)", fontSize: "0.68rem", letterSpacing: "1px", textTransform: "uppercase", fontFamily: "'Open Sans', sans-serif" }}>
              <span style={{ opacity: 0.5 }}>{t.icon}</span>{t.text}
            </div>
          ))}
        </div>
      </div>

      {/* ── CATEGORIES ───────────────────────────────────────── */}
      <div className="animate-section" style={{ maxWidth: "1300px", margin: "0 auto", padding: "4.5rem 2rem" }}>
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: "2.5rem", flexWrap: "wrap", gap: "1rem" }}>
          <div>
            <span className="animate-item" style={sectionLabel}>Collections</span>
            <h2 className="animate-item" style={sectionH2}>Shop by <em style={{ fontStyle: "italic", fontWeight: 300 }}>Category</em></h2>
          </div>
          <button onClick={() => navigate("/shop")} className="animate-item" style={seeAllBtn}>
            View all <ArrowRight size={13} />
          </button>
        </div>

        <div
          className="category-grid animate-item"
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
                <div style={{ fontFamily: "'Lato', 'Open Sans', sans-serif", fontSize: "1.4rem", fontWeight: 400, color: "white", marginBottom: "2px" }}>{cat.name}</div>
                <div style={{ fontSize: "0.68rem", letterSpacing: "1px", color: "rgba(255,255,255,0.65)", fontFamily: "'Open Sans', sans-serif" }}>{cat.subtitle}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── FEATURED TOY CARS ────────────────────────────────── */}
      <div className="animate-section" style={{ maxWidth: "1300px", margin: "0 auto", padding: "0 2rem 4.5rem" }}>
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: "2.5rem", flexWrap: "wrap", gap: "1rem" }}>
          <div>
            <span className="animate-item" style={sectionLabel}>Bestsellers</span>
            <h2 className="animate-item" style={sectionH2}>Our finest <em style={{ fontStyle: "italic", fontWeight: 300 }}>Toy Cars</em></h2>
          </div>
          <button onClick={() => navigate(`/shop?category=${encodeURIComponent("Toy Cars")}`)} className="animate-item" style={seeAllBtn}>
            See all cars <ArrowRight size={13} />
          </button>
        </div>
        {loading ? (
          <div className="products-main-grid animate-item" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(240px,1fr))", gap: "2px" }}>
            {gridSkeleton.map((_, index) => (
              <div key={index} style={{ background: "#f5f1ea" }}>
                <div style={{ aspectRatio: "1 / 1.05", background: "linear-gradient(90deg, #eee8dd 25%, #f7f3ec 37%, #eee8dd 63%)", backgroundSize: "400% 100%", animation: "shimmer 1.4s ease infinite" }} />
                <div style={{ padding: "16px" }}>
                  <div style={{ width: "70px", height: "10px", marginBottom: "12px", background: "#ebe3d6" }} />
                  <div style={{ width: "85%", height: "18px", marginBottom: "10px", background: "#e7dfd0" }} />
                  <div style={{ width: "60%", height: "14px", marginBottom: "14px", background: "#ece4d7" }} />
                  <div style={{ width: "45%", height: "16px", background: "#e7dfd0" }} />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="products-main-grid animate-item" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(240px,1fr))", gap: "2px" }}>
            {featuredCars.map((p) => (
              <ProductCard key={p.id} product={p} onClick={() => navigate(`/product/${p.id}`)} />
            ))}
          </div>
        )}
      </div>

      {/* ── EDITORIAL BAND ───────────────────────────────────── */}
      <section className="animate-section" style={{ background: "var(--gold-xpale)", borderTop: "1px solid var(--gold-pale)", borderBottom: "1px solid var(--gold-pale)", padding: "4.5rem 2rem" }}>
        <div className="editorial-inner" style={{ maxWidth: "1300px", margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "5rem", alignItems: "center" }}>
          <div className="editorial-image animate-item" style={{ height: "420px", borderRadius: "2px", overflow: "hidden" }}>
            <img src="https://images.unsplash.com/photo-1596464716127-f2a82984de30?w=800&q=85" alt="Gifting" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          </div>
          <div>
            <span className="animate-item" style={sectionLabel}>Our Promise</span>
            <blockquote className="animate-item" style={{ fontFamily: "'Lato', 'Open Sans', sans-serif", fontSize: "1.9rem", fontWeight: 300, fontStyle: "italic", lineHeight: 1.5, color: "var(--ink)", marginBottom: "1.2rem" }}>
              "Every gift tells a story. We help you write the perfect one."
            </blockquote>
            <p className="animate-item" style={{ fontSize: "0.86rem", fontWeight: 300, lineHeight: 1.95, color: "var(--ink-muted)", marginBottom: "2rem", fontFamily: "'Open Sans', sans-serif" }}>
              At Blessing Gifts, we believe gifting is an art form. Each product is carefully selected for quality, beauty and the joy it brings — from premium die-cast toy cars to handcrafted showpieces, delivered with care across India.
            </p>
            <button
              onClick={() => navigate("/shop")}
              className="animate-item"
              style={{ background: "var(--gold)", color: "white", border: "none", padding: "13px 30px", fontFamily: "'Open Sans', sans-serif", fontSize: "0.75rem", fontWeight: 500, letterSpacing: "1.5px", textTransform: "uppercase", cursor: "pointer" }}
            >
              Explore Collection
            </button>
          </div>
        </div>
      </section>

      {/* ── NEW ARRIVALS ─────────────────────────────────────── */}
      <div className="animate-section" style={{ maxWidth: "1300px", margin: "0 auto", padding: "4.5rem 2rem" }}>
        <div style={{ marginBottom: "2.5rem" }}>
          <span className="animate-item" style={sectionLabel}>Just In</span>
          <h2 className="animate-item" style={sectionH2}>New <em style={{ fontStyle: "italic", fontWeight: 300 }}>Arrivals</em></h2>
        </div>
        {loading ? (
          <div className="products-main-grid animate-item" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(240px,1fr))", gap: "2px" }}>
            {gridSkeleton.map((_, index) => (
              <div key={index} style={{ background: "#f5f1ea" }}>
                <div style={{ aspectRatio: "1 / 1.05", background: "linear-gradient(90deg, #eee8dd 25%, #f7f3ec 37%, #eee8dd 63%)", backgroundSize: "400% 100%", animation: "shimmer 1.4s ease infinite" }} />
                <div style={{ padding: "16px" }}>
                  <div style={{ width: "70px", height: "10px", marginBottom: "12px", background: "#ebe3d6" }} />
                  <div style={{ width: "85%", height: "18px", marginBottom: "10px", background: "#e7dfd0" }} />
                  <div style={{ width: "60%", height: "14px", marginBottom: "14px", background: "#ece4d7" }} />
                  <div style={{ width: "45%", height: "16px", background: "#e7dfd0" }} />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="products-main-grid animate-item" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(240px,1fr))", gap: "2px" }}>
            {newArrivals.map((p) => (
              <ProductCard key={p.id} product={p} onClick={() => navigate(`/product/${p.id}`)} />
            ))}
          </div>
        )}
      </div>

      <style>{`@keyframes shimmer { 0% { background-position: 100% 0; } 100% { background-position: 0 0; } }`}</style>
    </div>
  );
}
