// src/hooks/useProducts.js
// Loads products from the API and falls back to the static catalog only if the API is unavailable.

import { useState, useEffect } from "react";
import { PRODUCTS as STATIC_PRODUCTS } from "../data/products";
import { getProducts } from "../services/api";

export function useProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [source, setSource] = useState("api");

  useEffect(() => {
    let isMounted = true;

    const loadProducts = async () => {
      try {
        const list = await getProducts();

        if (!isMounted) {
          return;
        }

        if (list.length > 0) {
          setProducts(list);
          setSource("api");
        } else {
          setProducts(STATIC_PRODUCTS);
          setSource("static");
        }
      } catch (error) {
        if (!isMounted) {
          return;
        }

        console.warn("API error, falling back to static data:", error.message);
        setProducts(STATIC_PRODUCTS);
        setSource("static");
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadProducts();

    return () => {
      isMounted = false;
    };
  }, []);

  return { products, loading, source };
}
