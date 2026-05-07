// src/hooks/useOrders.js
// API-backed orders hook for admin workflows.

import { useState, useEffect } from "react";
import { getOrders, updateOrderStatus as apiUpdateOrderStatus, updateOrderTracking as apiUpdateOrderTracking } from "../services/api";

export function useOrders() {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    let isMounted = true;

    const loadOrders = async () => {
      try {
        const list = await getOrders();

        if (isMounted) {
          setOrders(list);
        }
      } catch {
        if (isMounted) {
          setOrders([]);
        }
      }
    };

    loadOrders();

    return () => {
      isMounted = false;
    };
  }, []);

  const changeStatus = async (id, status) => {
    await apiUpdateOrderStatus(id, status);
    setOrders((prev) => prev.map((order) => (order.id === id ? { ...order, status } : order)));
  };

  const addTracking = async (id, trackingLink) => {
    await apiUpdateOrderTracking(id, trackingLink);
    setOrders((prev) => prev.map((order) => (order.id === id ? { ...order, trackingLink } : order)));
  };

  return { orders, changeStatus, addTracking };
}
