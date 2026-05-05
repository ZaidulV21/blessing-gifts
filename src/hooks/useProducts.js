// src/hooks/useProducts.js
// Loads products from Firebase Firestore in real-time.
// Falls back to static data if Firebase is not connected.

import { useState, useEffect } from "react";
import { collection, onSnapshot, orderBy, query } from "firebase/firestore";
import { db } from "../firebase/config";
import { PRODUCTS as STATIC_PRODUCTS } from "../data/products";

export function useProducts() {
  const [products, setProducts] = useState(STATIC_PRODUCTS); // show static first
  const [loading, setLoading]   = useState(true);
  const [source, setSource]     = useState("static"); // "static" or "firebase"

  useEffect(() => {
    // Check if Firebase is properly configured
    const isConfigured =
      process.env.REACT_APP_FIREBASE_PROJECT_ID &&
      process.env.REACT_APP_FIREBASE_PROJECT_ID !== "YOUR_PROJECT_ID";

    if (!isConfigured) {
      // Firebase not connected yet — use static data
      setLoading(false);
      setSource("static");
      return;
    }

    // Subscribe to Firestore products collection
    const q = query(collection(db, "products"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(
      q,
      (snap) => {
        const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        if (list.length > 0) {
          setProducts(list);
          setSource("firebase");
        } else {
          // Collection is empty — keep showing static
          setProducts(STATIC_PRODUCTS);
          setSource("static");
        }
        setLoading(false);
      },
      (err) => {
        console.warn("Firestore error, falling back to static data:", err.message);
        setProducts(STATIC_PRODUCTS);
        setSource("static");
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  return { products, loading, source };
}
