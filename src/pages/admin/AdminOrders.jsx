// src/pages/admin/AdminOrders.jsx
// Loads orders from the API and falls back to localStorage if the backend is unavailable.

import { useState, useEffect, useMemo } from "react";
import { Search, Loader } from "lucide-react";
import toast from "react-hot-toast";
import { getOrders, updateOrderStatus as apiUpdateOrderStatus, updateOrderTracking as apiUpdateOrderTracking } from "../../services/api";

const STATUSES = ["All", "Pending", "Confirmed", "Shipped", "Delivered"];

const toastStyle = {
  style: {
    background: "#111010", color: "#fff",
    fontFamily: "'Open Sans', sans-serif", fontSize: "0.82rem",
    borderLeft: "2px solid #B8912A", borderRadius: "2px",
  },
};

export default function AdminOrders() {
  const [orders, setOrders]             = useState([]);
  const [loading, setLoading]           = useState(true);
  const [source, setSource]             = useState("local"); // "api" | "local"
  const [filterStatus, setFilterStatus] = useState("All");
  const [search, setSearch]             = useState("");
  const [trackingInputs, setTrackingInputs] = useState({});

  // ── Load orders: API first, localStorage fallback ───────────
  useEffect(() => {
    let isMounted = true;

    const loadOrders = async () => {
      try {
        const list = await getOrders();

        if (!isMounted) {
          return;
        }

        setOrders(list);
        setSource("api");
      } catch (error) {
        console.warn("API error:", error.message);
        const stored = JSON.parse(localStorage.getItem("bg_orders") || "[]");

        if (isMounted) {
          setOrders(stored);
          setSource("local");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadOrders();

    return () => {
      isMounted = false;
    };
  }, []);

  // ── Update order status ──────────────────────────────────────
  const updateStatus = async (id, status) => {
    if (source === "api") {
      try {
        await apiUpdateOrderStatus(id, status);
        setOrders((prev) => prev.map((order) => (order.id === id ? { ...order, status } : order)));
        toast.success(`Order ${id} → ${status}`, toastStyle);
      } catch (err) {
        toast.error("Update failed: " + err.message);
      }
    } else {
      // localStorage fallback
      const updated = orders.map((o) => o.id === id ? { ...o, status } : o);
      setOrders(updated);
      localStorage.setItem("bg_orders", JSON.stringify(updated));
      toast.success(`Order ${id} → ${status}`, toastStyle);
    }
  };

  // ── Save tracking link ───────────────────────────────────────
  const saveTracking = async (id) => {
    const link = trackingInputs[id] || "";
    if (!link.trim()) { toast.error("Enter a tracking URL first"); return; }

    if (source === "api") {
      try {
        await apiUpdateOrderTracking(id, link);
        setOrders((prev) => prev.map((order) => (order.id === id ? { ...order, trackingLink: link } : order)));
        toast.success("Tracking link saved!", toastStyle);
      } catch (err) {
        toast.error("Failed: " + err.message);
      }
    } else {
      const updated = orders.map((o) => o.id === id ? { ...o, trackingLink: link } : o);
      setOrders(updated);
      localStorage.setItem("bg_orders", JSON.stringify(updated));
      toast.success("Tracking link saved!", toastStyle);
    }
  };

  // ── Filtered list ────────────────────────────────────────────
  const filtered = useMemo(() => {
    return orders.filter((o) => {
      const matchStatus = filterStatus === "All" || o.status === filterStatus;
      const q = search.toLowerCase();
      const matchSearch = !q ||
        (o.id || "").toLowerCase().includes(q) ||
        (o.customer || "").toLowerCase().includes(q) ||
        (o.phone || "").includes(q);
      return matchStatus && matchSearch;
    });
  }, [orders, filterStatus, search]);

  const statusBadge = (s) => (
    <span
      className={`status-${s}`}
      style={{
        padding: "3px 10px", fontSize: "0.6rem", fontWeight: 500,
        letterSpacing: "1px", textTransform: "uppercase",
        borderRadius: "1px", display: "inline-block",
        fontFamily: "'Jost', sans-serif",
      }}
    >
      {s}
    </span>
  );

  // ─────────────────────────────────────────────────────────────
  return (
    <div style={{ padding: "2rem" }}>

      {/* Header */}
      <div style={{ marginBottom: "1.8rem" }}>
        <h1 style={{ fontFamily: "'Lato', 'Open Sans', sans-serif", fontSize: "1.8rem", fontWeight: 400, color: "var(--ink)" }}>
          Orders
        </h1>
        <p style={{ fontSize: "0.73rem", color: "var(--ink-faint)", marginTop: "2px", fontFamily: "'Open Sans', sans-serif" }}>
          {orders.length} total ·{" "}
          <span style={{ color: source === "api" ? "var(--green)" : "var(--gold)" }}>
            {source === "api" ? "🔴 Live from API" : "💾 Local storage fallback"}
          </span>
        </p>
      </div>

      {/* Filters */}
      <div style={{ display: "flex", gap: "1rem", marginBottom: "1.5rem", flexWrap: "wrap" }}>
        <div style={{ display: "flex", border: "1px solid var(--border)", background: "white", flex: 1, minWidth: "200px" }}>
          <Search size={14} style={{ margin: "auto 10px", color: "var(--ink-faint)", flexShrink: 0 }} />
            <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by order ID, name or phone..."
              style={{ flex: 1, padding: "9px 8px", fontFamily: "'Open Sans', sans-serif", fontSize: "0.83rem", border: "none", outline: "none", background: "none" }}
          />
        </div>
        <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
          {STATUSES.map((s) => (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
                style={{
                padding: "8px 14px",
                fontFamily: "'Open Sans', sans-serif",
                fontSize: "0.68rem", letterSpacing: "1.5px",
                textTransform: "uppercase",
                border: `1px solid ${filterStatus === s ? "var(--ink)" : "var(--border)"}`,
                background: filterStatus === s ? "var(--ink)" : "white",
                color: filterStatus === s ? "white" : "var(--ink-muted)",
                cursor: "pointer", borderRadius: "1px", transition: "all 0.2s",
              }}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div style={{ textAlign: "center", padding: "4rem", color: "var(--ink-faint)" }}>
          <Loader size={24} style={{ animation: "spin 1s linear infinite", margin: "0 auto 1rem" }} />
          <p style={{ fontFamily: "'Open Sans', sans-serif", fontSize: "0.83rem" }}>Loading orders...</p>
        </div>
      )}

      {/* Table */}
      {!loading && (
        <div style={{ background: "white", border: "1px solid var(--border-soft)", borderRadius: "1px", overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "900px" }}>
            <thead>
              <tr style={{ background: "var(--cream)" }}>
                {["Order ID","Customer","Phone","Items","Total","Payment","Status","Update Status","Tracking Link"].map((h) => (
                  <th key={h} style={{ padding: "10px 14px", fontFamily: "'Open Sans', sans-serif", fontSize: "0.58rem", fontWeight: 500, letterSpacing: "2px", textTransform: "uppercase", color: "var(--ink-faint)", textAlign: "left", borderBottom: "1px solid var(--border-soft)", whiteSpace: "nowrap" }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((o) => (
                <tr key={o.id} style={{ borderTop: "1px solid var(--border-soft)" }}
                  onMouseEnter={(e) => e.currentTarget.style.background = "#FDFCFA"}
                  onMouseLeave={(e) => e.currentTarget.style.background = "white"}
                >
                  <td style={{ padding: "12px 14px", fontFamily: "'Open Sans', sans-serif", fontSize: "0.8rem", fontWeight: 600 }}>{o.id}</td>
                  <td style={{ padding: "12px 14px", fontFamily: "'Open Sans', sans-serif", fontSize: "0.82rem" }}>{o.customer}</td>
                  <td style={{ padding: "12px 14px", fontFamily: "'Open Sans', sans-serif", fontSize: "0.78rem", color: "var(--ink-muted)" }}>{o.phone}</td>
                  <td style={{ padding: "12px 14px", fontFamily: "'Open Sans', sans-serif", fontSize: "0.75rem", color: "var(--ink-muted)", maxWidth: "160px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {(o.items || []).map((i) => `${i.name} ×${i.qty}`).join(", ")}
                  </td>
                  <td style={{ padding: "12px 14px", fontFamily: "'Lato', 'Open Sans', sans-serif", fontSize: "0.9rem", fontWeight: 400 }}>
                    ₹{(o.total || 0).toLocaleString()}
                  </td>
                  <td style={{ padding: "12px 14px", fontFamily: "'Open Sans', sans-serif", fontSize: "0.75rem", color: "var(--ink-muted)" }}>{o.payment}</td>
                  <td style={{ padding: "12px 14px" }}>{statusBadge(o.status || "Pending")}</td>
                  <td style={{ padding: "12px 14px" }}>
                      <select
                      value={o.status || "Pending"}
                      onChange={(e) => updateStatus(o.id, e.target.value)}
                      style={{ fontFamily: "'Open Sans', sans-serif", fontSize: "0.75rem", border: "1px solid var(--border)", background: "var(--cream)", padding: "5px 8px", borderRadius: "1px", outline: "none", cursor: "pointer" }}
                    >
                      {["Pending","Confirmed","Shipped","Delivered"].map((s) => (
                        <option key={s}>{s}</option>
                      ))}
                    </select>
                  </td>
                  <td style={{ padding: "12px 14px" }}>
                    <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
                        <input
                        id={`track_${o.id}`}
                        placeholder="Paste Shiprocket link"
                        defaultValue={o.trackingLink || ""}
                        onChange={(e) => setTrackingInputs((prev) => ({ ...prev, [o.id]: e.target.value }))}
                        style={{ width: "140px", padding: "5px 8px", border: "1px solid var(--border)", fontFamily: "'Open Sans', sans-serif", fontSize: "0.7rem", background: "var(--cream)", outline: "none", borderRadius: "1px" }}
                      />
                      <button
                        onClick={() => saveTracking(o.id)}
                        style={{ background: "var(--gold)", color: "white", border: "none", padding: "5px 12px", fontFamily: "'Open Sans', sans-serif", fontSize: "0.65rem", letterSpacing: "1px", textTransform: "uppercase", cursor: "pointer", whiteSpace: "nowrap", borderRadius: "1px" }}
                      >
                        Save
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {filtered.length === 0 && (
                <tr>
                  <td colSpan="9" style={{ padding: "3rem", textAlign: "center", fontFamily: "'Jost', sans-serif", fontSize: "0.83rem", color: "var(--ink-faint)" }}>
                    {orders.length === 0 ? "No orders yet. They'll appear here once customers start ordering." : "No orders match your search."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
