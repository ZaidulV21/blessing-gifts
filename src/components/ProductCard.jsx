// src/components/ProductCard.jsx
import { useState } from "react";
import { Heart, Star } from "lucide-react";
import { useCart } from "../context/CartContext";
import toast from "react-hot-toast";

export default function ProductCard({ product, onClick }) {
  const { addToCart } = useCart();
  const [wishlisted, setWishlisted] = useState(false);
  const discount = Math.round((1 - product.price / product.mrp) * 100);

  const handleAddToCart = (e) => {
    e.stopPropagation();
    addToCart(product, 1);
    toast.success(`${product.name} added to cart`, {
      style: {
        background: "#111010",
        color: "#fff",
        fontFamily: "'Open Sans', sans-serif",
        fontSize: "0.82rem",
        letterSpacing: "0.3px",
        borderLeft: "2px solid #B8912A",
        borderRadius: "2px",
      },
      icon: "✓",
    });
  };

  return (
    <div
      onClick={onClick}
      className="bg-white cursor-pointer group transition-all duration-300 hover:shadow-xl hover:-translate-y-0.5 animate-item"
    >
      {/* Image */}
      <div className="relative product-card-img h-[220px] md:h-[280px] overflow-hidden bg-cream-2">
        <img
          src={product.imageUrl}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />

        {/* Badge */}
        {product.badge && (
          <span
            className={`absolute top-3 left-3 text-[0.6rem] font-sans font-medium tracking-[2px] uppercase px-2.5 py-1 ${
              product.badge === "bestseller"
                ? "bg-ink text-white"
                : "bg-gold text-white"
            }`}
          >
            {product.badge === "bestseller" ? "Bestseller" : "New"}
          </span>
        )}

        {/* Wishlist */}
        <button
          onClick={(e) => { e.stopPropagation(); setWishlisted(!wishlisted); }}
          className="absolute top-3 right-3 w-8 h-8 bg-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
        >
          <Heart
            size={14}
            className={wishlisted ? "fill-red-500 stroke-red-500" : "stroke-ink-muted"}
          />
        </button>

        {/* Quick add — appears on hover */}
        <div className="absolute bottom-0 left-0 right-0 bg-ink/90 py-3 text-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <button
            onClick={handleAddToCart}
            className="text-[0.68rem] font-sans font-medium tracking-[2px] uppercase text-white hover:text-gold-light transition-colors"
          >
            Add to Cart
          </button>
        </div>
      </div>

      {/* Info */}
      <div className="p-4 pb-5">
        <div className="text-[0.6rem] font-sans font-normal tracking-[2px] uppercase text-ink-faint mb-1.5">
          {product.category}
        </div>
        <div className="font-serif text-[1.05rem] font-normal text-ink mb-2 leading-snug">
          {product.name}
        </div>

        {/* Price */}
        <div className="flex items-center gap-2 mb-3">
          <span className="font-sans text-[0.92rem] font-500 text-ink">
            ₹{product.price.toLocaleString()}
          </span>
          <span className="font-sans text-[0.75rem] text-ink-faint line-through">
            ₹{product.mrp.toLocaleString()}
          </span>
          <span className="text-[0.62rem] font-medium text-green-700 bg-green-50 px-1.5 py-0.5">
            {discount}% off
          </span>
        </div>

        {/* Rating */}
        <div className="flex items-center gap-1.5">
          <div className="flex items-center gap-0.5">
            {[1,2,3,4,5].map((s) => (
              <Star
                key={s}
                size={10}
                className={s <= Math.floor(product.rating) ? "fill-gold stroke-gold" : "stroke-border"}
              />
            ))}
          </div>
          <span className="text-[0.7rem] text-ink-faint font-sans">
            {product.rating} ({product.reviews})
          </span>
        </div>
      </div>
    </div>
  );
}
