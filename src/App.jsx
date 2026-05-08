// src/App.jsx
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { CartProvider } from "./context/CartContext";
import { AdminProvider } from "./context/AdminContext";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import { useEffect } from "react";
import { initAnimateSections } from "./utils/animateSections";

import Home from "./pages/Home";
import Shop from "./pages/Shop";
import ProductDetails from "./pages/ProductDetails";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import OrderSuccess from "./pages/OrderSuccess";
import TrackOrder from "./pages/TrackOrder";

import AdminLogin from "./pages/admin/AdminLogin";
import AdminLayout from "./pages/admin/AdminLayout";
import Dashboard from "./pages/admin/Dashboard";
import AdminOrders from "./pages/admin/AdminOrders";
import AdminProducts from "./pages/admin/AdminProducts";
import AdminCustomers from "./pages/admin/AdminCustomers";

function CustomerLayout({ children }) {
  return (
    <>
      <Navbar />
      {children}
      <Footer />
    </>
  );
}

export default function App() {
  useEffect(() => {
    const cleanup = initAnimateSections();
    return () => { if (cleanup) cleanup(); };
  }, []);
  return (
    <BrowserRouter>
      <CartProvider>
        <AdminProvider>
          <Toaster position="bottom-right" />
          <Routes>
            {/* ── CUSTOMER ROUTES ── */}
            <Route
              path="/"
              element={<CustomerLayout><Home /></CustomerLayout>}
            />
            <Route
              path="/shop"
              element={<CustomerLayout><Shop /></CustomerLayout>}
            />
            <Route
              path="/product/:productId"
              element={<CustomerLayout><ProductDetails /></CustomerLayout>}
            />
            <Route
              path="/cart"
              element={<CustomerLayout><Cart /></CustomerLayout>}
            />
            <Route
              path="/checkout"
              element={<CustomerLayout><Checkout /></CustomerLayout>}
            />
            <Route
              path="/order-success"
              element={<CustomerLayout><OrderSuccess /></CustomerLayout>}
            />
            <Route
              path="/track"
              element={<CustomerLayout><TrackOrder /></CustomerLayout>}
            />

            {/* ── ADMIN ROUTES ── */}
            <Route path="/admin" element={<AdminLogin />} />
            <Route path="/admin" element={<AdminLayout />}>
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="orders" element={<AdminOrders />} />
              <Route path="products" element={<AdminProducts />} />
              <Route path="customers" element={<AdminCustomers />} />
            </Route>

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </AdminProvider>
      </CartProvider>
    </BrowserRouter>
  );
}
