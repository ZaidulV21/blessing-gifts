// src/components/ProductModal.jsx
// FIX 1: position:fixed on overlay — modal ALWAYS centered on viewport
// FIX 2: Escape key closes modal
// FIX 3: Responsive — stacks vertically on mobile

import { useState, useEffect } from "react";
import { X, Star, Minus, Plus, ShoppingBag } from "lucide-react";
import { useCart } from "../context/CartContext";
import toast from "react-hot-toast";
import { validateStock } from "../services/api";
import { getAvailableStock, isOutOfStock } from "../utils/stock";

export default function ProductModal({ product, onClose }) {
  const [qty, setQty] = useState(1);
  const { cart, addToCart } = useCart();
  const existingQty = cart.find((item) => item.id === product?.id)?.qty || 0;
  const availableStock = getAvailableStock(product);
  const outOfStock = isOutOfStock(product);

  useEffect(() => {
    // Lock background scroll
    document.body.style.overflow = "hidden";
    // Close on Escape
    const onKey = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  if (!product) return null;
  const discount = Math.round((1 - product.price / product.mrp) * 100);

  const handleAdd = async () => {
    if (outOfStock) {
      toast.error("This product is currently out of stock.", {
        style: { fontFamily: "'Open Sans', sans-serif", fontSize: "0.82rem" },
      });
      return;
    }

    try {
      await validateStock([{ productId: product.id, qty: existingQty + qty }]);
      addToCart(product, qty);
      toast.success(`${product.name} × ${qty} added to cart`, {
        style: {
          background: "#111010", color: "#fff",
          fontFamily: "'Open Sans', sans-serif", fontSize: "0.82rem",
          borderLeft: "2px solid #B8912A", borderRadius: "2px",
        },
        icon: "✓",
      });
      onClose();
    } catch (error) {
      toast.error(existingQty > 0 ? "Maximum available stock reached." : (error.message || "This product is currently out of stock."), {
        style: { fontFamily: "'Open Sans', sans-serif", fontSize: "0.82rem" },
      });
    }
  };

  return (
    <div
      className="modal-overlay-fixed"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="modal-box">
        <button className="modal-close-btn" onClick={onClose}>
          <X size={15} strokeWidth={2} />
        </button>

        {/* Image panel */}
        <div className="modal-img-panel">
          <img src={product.imageUrl} alt={product.name} />
          {outOfStock && (
            <span className="absolute top-4 right-4 bg-black/85 text-white text-[0.6rem] font-sans font-medium tracking-[2px] uppercase px-2.5 py-1 rounded-sm">
              Out of Stock
            </span>
          )}
        </div>

        {/* Info panel */}
        <div className="modal-info-panel">
          <div className="modal-cat-label">{product.category}</div>

          <h2 className="modal-product-title">{product.name}</h2>

          <div className="modal-rating-row">
            <div className="modal-stars">
              {[1,2,3,4,5].map((s) => (
                <Star
                  key={s} size={11}
                  style={{
                    fill: s <= Math.floor(product.rating) ? "#D4A843" : "none",
                    stroke: s <= Math.floor(product.rating) ? "#D4A843" : "#D1D1D1",
                  }}
                />
              ))}
            </div>
            <span className="modal-rating-text">
              {product.rating} · {product.reviews} reviews
            </span>
          </div>

          <div className="modal-price-big">₹{product.price.toLocaleString()}</div>
          <div className="modal-price-sub-row">
            <span className="modal-mrp-text">₹{product.mrp.toLocaleString()}</span>
            <span className="modal-disc-badge">{discount}% off</span>
          </div>

          <div className="modal-divider" />

          <p className="modal-desc-text">{product.description}</p>

          {product.features?.length > 0 && (
            <div className="modal-feats-row">
              {product.features.map((f) => (
                <span key={f} className="modal-feat-tag">{f}</span>
              ))}
            </div>
          )}

          <div className="modal-qty-label">Quantity</div>
          <div className="modal-qty-ctrl">
            <button onClick={() => setQty(Math.max(1, qty - 1))} className="modal-qty-btn" disabled={outOfStock}>
              <Minus size={13} />
            </button>
            <span className="modal-qty-val">{qty}</span>
            <button
              onClick={() => {
                if (availableStock <= 0) {
                  toast.error("This product is currently out of stock.", {
                    style: { fontFamily: "'Open Sans', sans-serif", fontSize: "0.82rem" },
                  });
                  return;
                }

                if (qty >= availableStock) {
                  toast.error("Maximum available stock reached.", {
                    style: { fontFamily: "'Open Sans', sans-serif", fontSize: "0.82rem" },
                  });
                  return;
                }

                setQty(qty + 1);
              }}
              className="modal-qty-btn"
              disabled={outOfStock}
            >
              <Plus size={13} />
            </button>
          </div>

          <button className="modal-add-btn" onClick={handleAdd} disabled={outOfStock}>
            <ShoppingBag size={15} />
            {outOfStock ? "Out of Stock" : "Add to Cart"}
          </button>
        </div>
      </div>
    </div>
  );
}
