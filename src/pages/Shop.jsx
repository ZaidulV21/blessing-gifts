// src/pages/Shop.jsx
// Loads products from Firebase in real-time via useProducts hook

import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { Loader } from "lucide-react";
import { useProducts } from "../hooks/useProducts";
import ProductCard from "../components/ProductCard";
import ProductModal from "../components/ProductModal";

const ALL_CATS  = ["All", "Toy Cars", "Showpieces", "Soft Toys", "Gift Sets"];
const SORT_OPTS = [
  { label: "Featured",           value: "featured"   },
  { label: "Price: Low to High", value: "price_asc"  },
  { label: "Price: High to Low", value: "price_desc" },
  { label: "Top Rated",          value: "rating"     },
];

export default function Shop() {
  const location = useLocation();
  const { products, loading } = useProducts();

  const [activeCat, setActiveCat]       = useState("All");
  const [sort, setSort]                 = useState("featured");
  const [selectedProduct, setSelected]  = useState(null);

  // Pre-select category from navigation state or query string
  useEffect(() => {
    const queryCategory = new URLSearchParams(location.search).get("category");
    const targetCategory = location.state?.category || queryCategory;

    if (targetCategory && ALL_CATS.includes(targetCategory)) {
      setActiveCat(targetCategory);
    } else if (queryCategory && !ALL_CATS.includes(queryCategory)) {
      setActiveCat("All");
    }
  }, [location.search, location.state]);

  const filtered = products
    .filter((p) => activeCat === "All" || p.category === activeCat)
    .sort((a, b) => {
      if (sort === "price_asc")  return a.price - b.price;
      if (sort === "price_desc") return b.price - a.price;
      if (sort === "rating")     return (b.rating || 0) - (a.rating || 0);
      return 0;
    });

  return (
    <div className="page-enter" style={{ maxWidth: "1300px", margin: "0 auto", padding: "4rem 1.5rem" }}>

      {/* Header */}
      <div style={{ marginBottom: "2.5rem" }}>
        <div style={{ fontSize: "0.62rem", letterSpacing: "3px", textTransform: "uppercase", color: "var(--gold)", marginBottom: "0.5rem", fontFamily: "'Jost', sans-serif" }}>
          Collection
        </div>
        <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(2rem,4vw,2.8rem)", fontWeight: 400, color: "var(--ink)" }}>
          All <em style={{ fontStyle: "italic", fontWeight: 300 }}>Products</em>
        </h1>
      </div>

      {/* Filter Bar */}
      <div
        style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "1rem", marginBottom: "2rem", flexWrap: "wrap" }}
      >
        {/* Category tabs */}
        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
          {ALL_CATS.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCat(cat)}
              style={{
                padding: "8px 18px",
                border: `1.5px solid ${activeCat === cat ? "var(--ink)" : "var(--border)"}`,
                background: activeCat === cat ? "var(--ink)" : "white",
                color: activeCat === cat ? "white" : "var(--ink-muted)",
                fontFamily: "'Jost', sans-serif",
                fontSize: "0.7rem", letterSpacing: "1.5px",
                textTransform: "uppercase", cursor: "pointer",
                transition: "all 0.2s", borderRadius: "1px",
              }}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Sort */}
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          style={{
            fontFamily: "'Jost', sans-serif",
            fontSize: "0.75rem", color: "var(--ink-muted)",
            border: "1px solid var(--border)",
            background: "white", padding: "8px 14px",
            outline: "none", cursor: "pointer", borderRadius: "1px",
          }}
        >
          {SORT_OPTS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </div>

      {/* Count */}
      <div style={{ fontSize: "0.72rem", color: "var(--ink-faint)", marginBottom: "1.5rem", fontFamily: "'Jost', sans-serif" }}>
        {loading ? "Loading..." : `${filtered.length} product${filtered.length !== 1 ? "s" : ""} found`}
      </div>

      {/* Loading */}
      {loading && (
        <div style={{ textAlign: "center", padding: "5rem 0", color: "var(--ink-faint)" }}>
          <Loader size={28} style={{ animation: "spin 1s linear infinite", margin: "0 auto 1rem" }} />
          <p style={{ fontFamily: "'Jost', sans-serif", fontSize: "0.85rem" }}>Loading products...</p>
        </div>
      )}

      {/* Grid */}
      {!loading && (
        <div
          className="products-main-grid"
          style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(240px,1fr))", gap: "2px" }}
        >
          {filtered.map((p) => (
            <ProductCard
              key={p.id}
              product={p}
              onClick={() => setSelected(p)}
            />
          ))}
        </div>
      )}

      {/* Empty */}
      {!loading && filtered.length === 0 && (
        <div style={{ textAlign: "center", padding: "5rem 0", color: "var(--ink-faint)", fontFamily: "'Jost', sans-serif", fontSize: "0.85rem" }}>
          No products found in this category.
        </div>
      )}

      {/* Modal */}
      {selectedProduct && (
        <ProductModal
          product={selectedProduct}
          onClose={() => setSelected(null)}
        />
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
