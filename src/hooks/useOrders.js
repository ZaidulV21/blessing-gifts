// src/hooks/useOrders.js
// ─────────────────────────────────────────────────────────────────
//  Currently reads from localStorage.
//  To switch to Firebase, uncomment the Firebase version below
//  and comment out the localStorage version.
// ─────────────────────────────────────────────────────────────────
import { useState, useEffect } from "react";
// import { subscribeOrders, updateOrderStatus } from "../firebase/services";

export function useOrders() {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    // ── localStorage version (default) ──
    const load = () => {
      try {
        setOrders(JSON.parse(localStorage.getItem("bg_orders") || "[]"));
      } catch {
        setOrders([]);
      }
    };
    load();

    // Re-sync if another tab updates orders
    window.addEventListener("storage", load);
    return () => window.removeEventListener("storage", load);

    // ── Firebase version (uncomment when ready) ──
    // const unsub = subscribeOrders(setOrders);
    // return unsub;
  }, []);

  const saveOrders = (updated) => {
    setOrders(updated);
    localStorage.setItem("bg_orders", JSON.stringify(updated));
  };

  const changeStatus = (id, status) => {
    const updated = orders.map((o) => (o.id === id ? { ...o, status } : o));
    saveOrders(updated);

    // Firebase version:
    // updateOrderStatus(id, status);
  };

  const addTracking = (id, trackingLink) => {
    const updated = orders.map((o) => (o.id === id ? { ...o, trackingLink } : o));
    saveOrders(updated);
  };

  return { orders, changeStatus, addTracking };
}

// ─────────────────────────────────────────────────────────────────
// src/hooks/useProducts.js
// ─────────────────────────────────────────────────────────────────
// Separate export below — can split into its own file later

export function useProducts() {
  // Currently returns static data from products.js
  // When Firebase is connected, fetch from Firestore instead
  const { PRODUCTS } = require("../data/products");
  return { products: PRODUCTS };
}
