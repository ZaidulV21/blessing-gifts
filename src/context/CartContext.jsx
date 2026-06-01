// src/context/CartContext.jsx
import { createContext, useContext, useState, useEffect } from "react";

const CartContext = createContext();

export function CartProvider({ children }) {
  const [cart, setCart] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("bg_cart") || "[]");
    } catch {
      return [];
    }
  });

  const [coupon, setCoupon] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("bg_coupon") || "null");
    } catch {
      return null;
    }
  });

  useEffect(() => {
    localStorage.setItem("bg_cart", JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem("bg_coupon", JSON.stringify(coupon));
  }, [coupon]);

  const addToCart = (product, qty = 1) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.id === product.id);
      if (existing) {
        return prev.map((i) =>
          i.id === product.id ? { ...i, qty: i.qty + qty } : i
        );
      }
      return [...prev, { ...product, qty }];
    });
  };

  const removeFromCart = (productId) => {
    setCart((prev) => prev.filter((i) => i.id !== productId));
  };

  const updateQty = (productId, qty) => {
    if (qty <= 0) return removeFromCart(productId);
    setCart((prev) =>
      prev.map((i) => (i.id === productId ? { ...i, qty } : i))
    );
  };

  const clearCart = () => setCart([]);

  const applyCoupon = (couponData) => setCoupon(couponData);
  const removeCoupon = () => setCoupon(null);

  const cartCount = cart.reduce((s, i) => s + i.qty, 0);
  const cartSubtotal = cart.reduce((s, i) => s + i.price * i.qty, 0);

  return (
    <CartContext.Provider
      value={{
        cart,
        coupon,
        addToCart,
        removeFromCart,
        updateQty,
        clearCart,
        applyCoupon,
        removeCoupon,
        cartCount,
        cartSubtotal,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
