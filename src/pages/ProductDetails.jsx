import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Check, ChevronRight, ShoppingBag, Star, Truck, ShieldCheck, RotateCcw } from "lucide-react";
import toast from "react-hot-toast";
import { useCart } from "../context/CartContext";
import { useProducts } from "../hooks/useProducts";
import ProductCard from "../components/ProductCard";

// Build gallery from the product's full images array
function buildProductGallery(product) {
  if (Array.isArray(product.images) && product.images.length > 0) {
    return product.images;
  }

  return [product.imageUrl || product.image].filter(Boolean);
}

export default function ProductDetails() {
  const navigate = useNavigate();
  const { productId } = useParams();
  const { products, loading } = useProducts();
  const { addToCart } = useCart();
  const [activeImage, setActiveImage] = useState(0);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    setActiveImage(0);
  }, [productId]);

  const product = useMemo(
    () => products.find((item) => String(item.id) === String(productId)),
    [products, productId]
  );

  // Use only product's uploaded images (dynamic from database)
  const gallery = useMemo(() => (product ? buildProductGallery(product) : []), [product]);
  const relatedProducts = useMemo(
    () => {
      if (!product) return [];
      if (Array.isArray(product.related) && product.related.length > 0) {
        return product.related.map((rid) => products.find((p) => String(p.id) === String(rid))).filter(Boolean).slice(0, 4);
      }
      return products.filter((item) => item.id !== product?.id && item.category === product?.category).slice(0, 4);
    },
    [products, product]
  );

  const handleAddToCart = () => {
    if (!product) return;
    addToCart(product, 1);
    toast.success(`${product.name} added to cart`);
  };

  if (loading && !product) {
    return (
      <div style={{ maxWidth: "1300px", margin: "0 auto", padding: "5rem 1.5rem", fontFamily: "'Jost', sans-serif", color: "var(--ink-muted)" }}>
        Loading product...
      </div>
    );
  }

  if (!product) {
    return (
      <div style={{ maxWidth: "900px", margin: "0 auto", padding: "5rem 1.5rem", textAlign: "center" }}>
        <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "2.2rem", color: "var(--ink)", marginBottom: "1rem" }}>
          Product not found
        </p>
        <button
          onClick={() => navigate("/shop")}
          style={{ border: "none", background: "var(--gold)", color: "white", padding: "12px 22px", cursor: "pointer", fontFamily: "'Jost', sans-serif", letterSpacing: "1.5px", textTransform: "uppercase", fontSize: "0.72rem" }}
        >
          Back to shop
        </button>
      </div>
    );
  }

  const discount = Math.round((1 - product.price / product.mrp) * 100);
  const perks = [
    { icon: <Truck size={15} />, label: "Pan-India delivery" },
    { icon: <ShieldCheck size={15} />, label: "Secure checkout" },
    { icon: <RotateCcw size={15} />, label: "Easy returns" },
  ];

  return (
    <div className="page-enter" style={{ maxWidth: "1320px", margin: "0 auto", padding: "2rem 1.5rem 4rem" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "1.75rem", fontFamily: "'Jost', sans-serif", fontSize: "0.72rem", letterSpacing: "1.6px", textTransform: "uppercase", color: "var(--ink-faint)" }}>
        <button onClick={() => navigate(-1)} style={{ display: "inline-flex", alignItems: "center", gap: "6px", border: "none", background: "none", color: "var(--ink-muted)", cursor: "pointer", padding: 0 }}>
          <ArrowLeft size={14} /> Back
        </button>
        <ChevronRight size={12} />
        <span>{product.category}</span>
        <ChevronRight size={12} />
        <span>{product.name}</span>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.1fr 0.9fr", gap: "2rem", alignItems: "start" }}>
        <section style={{ position: "sticky", top: "1rem" }}>
          <div style={{ background: "white", border: "1px solid var(--border-soft)", borderRadius: "18px", overflow: "hidden", boxShadow: "0 18px 50px rgba(0,0,0,0.06)" }}>
            <div style={{ aspectRatio: "1 / 1", background: "#f7f4ef" }}>
              <img src={gallery[activeImage] || product.imageUrl} alt={product.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            </div>
            <div style={{ display: "flex", gap: "10px", padding: "12px", borderTop: "1px solid var(--border-soft)", overflowX: "auto", flexWrap: "wrap" }}>
              {gallery.map((image, index) => (
                <button key={`${image}-${index}`} onClick={() => setActiveImage(index)} style={{ aspectRatio: "1 / 1", overflow: "hidden", borderRadius: "12px", border: index === activeImage ? "2px solid var(--gold)" : "1px solid var(--border-soft)", background: "#f6f3ee", padding: 0, cursor: "pointer", flex: "0 0 72px" }}>
                  <img src={image} alt={`${product.name} view ${index + 1}`} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                </button>
              ))}
            </div>
          </div>
        </section>

        <section style={{ background: "white", border: "1px solid var(--border-soft)", borderRadius: "18px", padding: "1.5rem", boxShadow: "0 18px 50px rgba(0,0,0,0.04)" }}>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "1rem", marginBottom: "0.85rem" }}>
            <div>
              <div style={{ fontFamily: "'Jost', sans-serif", fontSize: "0.62rem", letterSpacing: "2.5px", textTransform: "uppercase", color: "var(--gold)", marginBottom: "0.5rem" }}>{product.category}</div>
              <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(2rem, 4vw, 3.1rem)", lineHeight: 1.05, fontWeight: 400, color: "var(--ink)", margin: 0 }}>{product.name}</h1>
            </div>
            {product.badge ? <span style={{ background: "var(--ink)", color: "white", fontFamily: "'Jost', sans-serif", fontSize: "0.62rem", letterSpacing: "2px", textTransform: "uppercase", padding: "0.5rem 0.75rem", borderRadius: "999px" }}>{product.badge}</span> : null}
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1rem", flexWrap: "wrap" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "2px" }}>
              {[1, 2, 3, 4, 5].map((star) => (
                <Star key={star} size={14} fill={star <= Math.floor(product.rating) ? "#D4A843" : "none"} color={star <= Math.floor(product.rating) ? "#D4A843" : "#D1D1D1"} />
              ))}
            </div>
            <span style={{ fontFamily: "'Jost', sans-serif", color: "var(--ink-muted)", fontSize: "0.82rem" }}>{product.rating} rating · {product.reviews} reviews</span>
            <span style={{ fontFamily: "'Jost', sans-serif", color: "var(--ink-faint)", fontSize: "0.8rem" }}>{product.inStock ? "In stock" : "Out of stock"}</span>
          </div>

          <div style={{ display: "flex", alignItems: "baseline", gap: "0.8rem", marginBottom: "1rem", flexWrap: "wrap" }}>
            <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "2.6rem", lineHeight: 1, color: "var(--ink)" }}>₹{product.price.toLocaleString()}</div>
            <div style={{ fontFamily: "'Jost', sans-serif", color: "var(--ink-faint)", textDecoration: "line-through" }}>₹{product.mrp.toLocaleString()}</div>
            <div style={{ fontFamily: "'Jost', sans-serif", color: "#0f7a37", background: "#effaf3", padding: "0.35rem 0.6rem", borderRadius: "999px", fontSize: "0.72rem", letterSpacing: "1px", textTransform: "uppercase" }}>{discount}% off</div>
          </div>

          <p style={{ fontFamily: "'Jost', sans-serif", color: "var(--ink-muted)", lineHeight: 1.9, fontSize: "0.95rem", marginBottom: "1.25rem" }}>{product.description}</p>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: "0.75rem", marginBottom: "1.25rem" }}>
            {perks.map((perk) => (
              <div key={perk.label} style={{ display: "flex", alignItems: "center", gap: "0.6rem", padding: "0.85rem", background: "var(--gold-xpale)", border: "1px solid var(--gold-pale)", borderRadius: "14px", fontFamily: "'Jost', sans-serif", color: "var(--ink)", fontSize: "0.82rem" }}>
                <span style={{ color: "var(--gold)" }}>{perk.icon}</span>
                {perk.label}
              </div>
            ))}
          </div>

          <div style={{ display: "flex", gap: "0.85rem", flexWrap: "wrap", marginBottom: "1.25rem" }}>
            <button onClick={handleAddToCart} style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", gap: "0.5rem", border: "none", background: "var(--gold)", color: "white", padding: "0.95rem 1.35rem", borderRadius: "12px", cursor: "pointer", fontFamily: "'Jost', sans-serif", letterSpacing: "1.5px", textTransform: "uppercase", fontSize: "0.72rem" }}>
              <ShoppingBag size={15} /> Add to cart
            </button>
            <button onClick={() => { addToCart(product, 1); navigate("/checkout"); }} style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", gap: "0.5rem", border: "1px solid var(--border)", background: "white", color: "var(--ink)", padding: "0.95rem 1.35rem", borderRadius: "12px", cursor: "pointer", fontFamily: "'Jost', sans-serif", letterSpacing: "1.5px", textTransform: "uppercase", fontSize: "0.72rem" }}>
              Buy now
            </button>
          </div>

          <div style={{ borderTop: "1px solid var(--border-soft)", paddingTop: "1.25rem" }}>
            <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.8rem", fontWeight: 400, color: "var(--ink)", marginBottom: "0.75rem" }}>Product details</h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: "0.75rem" }}>
              <div style={{ padding: "0.9rem", border: "1px solid var(--border-soft)", borderRadius: "14px" }}>
                <div style={{ fontFamily: "'Jost', sans-serif", fontSize: "0.62rem", letterSpacing: "2px", textTransform: "uppercase", color: "var(--ink-faint)", marginBottom: "0.4rem" }}>Category</div>
                <div style={{ fontFamily: "'Jost', sans-serif", color: "var(--ink)" }}>{product.category}</div>
              </div>
              <div style={{ padding: "0.9rem", border: "1px solid var(--border-soft)", borderRadius: "14px" }}>
                <div style={{ fontFamily: "'Jost', sans-serif", fontSize: "0.62rem", letterSpacing: "2px", textTransform: "uppercase", color: "var(--ink-faint)", marginBottom: "0.4rem" }}>Availability</div>
                <div style={{ fontFamily: "'Jost', sans-serif", color: "var(--ink)" }}>{product.inStock ? "Available now" : "Out of stock"}</div>
              </div>
            </div>

            {product.features?.length ? (
              <div style={{ marginTop: "1rem" }}>
                <div style={{ fontFamily: "'Jost', sans-serif", fontSize: "0.62rem", letterSpacing: "2px", textTransform: "uppercase", color: "var(--ink-faint)", marginBottom: "0.6rem" }}>Highlights</div>
                <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                  {product.features.map((feature) => (
                    <span key={feature} style={{ display: "inline-flex", alignItems: "center", gap: "0.35rem", border: "1px solid var(--gold-pale)", background: "var(--gold-xpale)", color: "var(--ink)", fontFamily: "'Jost', sans-serif", fontSize: "0.8rem", borderRadius: "999px", padding: "0.5rem 0.8rem" }}>
                      <Check size={12} /> {feature}
                    </span>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        </section>
      </div>

      <section style={{ marginTop: "3rem" }}>
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: "1.25rem", gap: "1rem", flexWrap: "wrap" }}>
          <div>
            <div style={{ fontFamily: "'Jost', sans-serif", fontSize: "0.62rem", letterSpacing: "3px", textTransform: "uppercase", color: "var(--gold)", marginBottom: "0.45rem" }}>More from this category</div>
            <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(1.8rem, 3vw, 2.4rem)", fontWeight: 400, color: "var(--ink)", margin: 0 }}>Related products</h2>
          </div>
          <button onClick={() => navigate("/shop")} style={{ display: "inline-flex", alignItems: "center", gap: "0.35rem", border: "none", background: "none", color: "var(--ink-muted)", cursor: "pointer", fontFamily: "'Jost', sans-serif", letterSpacing: "1.5px", textTransform: "uppercase", fontSize: "0.72rem" }}>
            View all <ChevronRight size={13} />
          </button>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(240px,1fr))", gap: "2px" }}>
          {relatedProducts.length > 0 ? relatedProducts.map((item) => (
            <ProductCard key={item.id} product={item} onClick={() => navigate(`/product/${item.id}`)} />
          )) : (
            <div style={{ gridColumn: "1 / -1", padding: "2rem 0", textAlign: "center", color: "var(--ink-faint)", fontFamily: "'Jost', sans-serif" }}>No related products found.</div>
          )}
        </div>
      </section>
    </div>
  );
}