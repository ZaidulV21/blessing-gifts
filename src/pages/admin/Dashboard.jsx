// src/pages/admin/Dashboard.jsx
import { useMemo } from "react";
import { Package, TrendingUp, ShoppingBag, AlertCircle } from "lucide-react";
import { PRODUCTS } from "../../data/products";

export default function Dashboard() {
  const orders = useMemo(() => JSON.parse(localStorage.getItem("bg_orders") || "[]"), []);

  const stats = useMemo(() => ({
    totalOrders: orders.length,
    revenue: orders.reduce((s, o) => s + (o.total || 0), 0),
    pending: orders.filter((o) => o.status === "Pending").length,
    products: PRODUCTS.length,
  }), [orders]);

  const statCards = [
    { label: "Total Orders", value: stats.totalOrders, icon: <Package size={18} />, note: "All time", color: "text-blue-600" },
    { label: "Revenue", value: `₹${stats.revenue.toLocaleString()}`, icon: <TrendingUp size={18} />, note: "All time", color: "text-green-600" },
    { label: "Products", value: stats.products, icon: <ShoppingBag size={18} />, note: "Active listings", color: "text-purple-600" },
    { label: "Pending Orders", value: stats.pending, icon: <AlertCircle size={18} />, note: "Needs action", color: "text-amber-600" },
  ];

  const statusClass = (s) => `status-${s} font-sans text-[0.62rem] font-medium tracking-[1px] uppercase px-2.5 py-1`;

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-serif text-[1.8rem] font-normal text-ink">Dashboard</h1>
          <div className="font-sans text-[0.75rem] text-ink-faint mt-0.5">
            {new Date().toLocaleDateString("en-IN", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map((s) => (
          <div key={s.label} className="bg-white border border-border-soft p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="text-[0.62rem] font-sans font-medium tracking-[2px] uppercase text-ink-faint">
                {s.label}
              </div>
              <span className={s.color}>{s.icon}</span>
            </div>
            <div className="font-serif text-[2rem] font-normal text-ink">{s.value}</div>
            <div className="text-[0.7rem] font-sans text-ink-faint mt-1">{s.note}</div>
          </div>
        ))}
      </div>

      {/* Recent Orders */}
      <div className="bg-white border border-border-soft">
        <div className="px-6 py-4 border-b border-border-soft flex items-center justify-between">
          <h2 className="font-serif text-[1rem] font-normal text-ink">Recent Orders</h2>
          <span className="font-sans text-[0.7rem] text-ink-faint">{orders.length} total</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-cream">
                {["Order ID", "Customer", "Phone", "Items", "Amount", "Status", "Date"].map((h) => (
                  <th key={h} className="px-5 py-3 text-left font-sans text-[0.6rem] font-medium tracking-[2px] uppercase text-ink-faint">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {orders.slice(0, 8).map((o, i) => (
                <tr key={o.id} className={`border-t border-border-soft hover:bg-cream/50 transition-colors ${i % 2 === 0 ? "" : ""}`}>
                  <td className="px-5 py-3.5 font-sans text-[0.82rem] font-medium text-ink">{o.id}</td>
                  <td className="px-5 py-3.5 font-sans text-[0.82rem] text-ink-soft">{o.customer}</td>
                  <td className="px-5 py-3.5 font-sans text-[0.82rem] text-ink-muted">{o.phone}</td>
                  <td className="px-5 py-3.5 font-sans text-[0.78rem] text-ink-muted">{o.items?.length} item(s)</td>
                  <td className="px-5 py-3.5 font-serif text-[0.88rem] font-normal text-ink">₹{o.total?.toLocaleString()}</td>
                  <td className="px-5 py-3.5">
                    <span className={`${statusClass(o.status)} rounded-sm`}>{o.status}</span>
                  </td>
                  <td className="px-5 py-3.5 font-sans text-[0.78rem] text-ink-faint">{o.date}</td>
                </tr>
              ))}
              {orders.length === 0 && (
                <tr>
                  <td colSpan="7" className="px-5 py-16 text-center font-sans text-[0.83rem] text-ink-faint">
                    No orders yet. They'll appear here once customers start ordering.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
