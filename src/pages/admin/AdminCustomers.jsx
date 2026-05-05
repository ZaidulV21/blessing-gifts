// src/pages/admin/AdminCustomers.jsx
import { useMemo } from "react";

export default function AdminCustomers() {
  const customers = useMemo(() => {
    const orders = JSON.parse(localStorage.getItem("bg_orders") || "[]");
    const map = {};
    orders.forEach((o) => {
      if (!map[o.phone]) {
        map[o.phone] = {
          name: o.customer,
          phone: o.phone,
          email: o.email || "—",
          city: (o.address || "").split(",")[2]?.trim() || "—",
          orders: 0,
          total: 0,
          lastOrder: o.date,
        };
      }
      map[o.phone].orders += 1;
      map[o.phone].total += o.total || 0;
    });
    return Object.values(map).sort((a, b) => b.total - a.total);
  }, []);

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="font-serif text-[1.8rem] font-normal text-ink mb-1">Customers</h1>
        <div className="font-sans text-[0.75rem] text-ink-faint">{customers.length} unique customers</div>
      </div>

      <div className="bg-white border border-border-soft rounded-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-cream border-b border-border-soft">
                {["Name", "Phone", "Email", "City", "Orders", "Total Spent", "Last Order"].map((h) => (
                  <th key={h} className="px-5 py-3.5 text-left font-sans text-[0.6rem] font-medium tracking-[2px] uppercase text-ink-faint">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {customers.map((c) => (
                <tr key={c.phone} className="border-t border-border-soft hover:bg-cream/50 transition-colors">
                  <td className="px-5 py-4 font-sans text-[0.85rem] font-medium text-ink">{c.name}</td>
                  <td className="px-5 py-4 font-sans text-[0.82rem] text-ink-soft">{c.phone}</td>
                  <td className="px-5 py-4 font-sans text-[0.78rem] text-ink-muted">{c.email}</td>
                  <td className="px-5 py-4 font-sans text-[0.78rem] text-ink-muted">{c.city}</td>
                  <td className="px-5 py-4 font-sans text-[0.85rem] text-ink-soft">{c.orders}</td>
                  <td className="px-5 py-4 font-serif text-[0.9rem] text-gold">₹{c.total.toLocaleString()}</td>
                  <td className="px-5 py-4 font-sans text-[0.75rem] text-ink-faint">{c.lastOrder}</td>
                </tr>
              ))}
              {customers.length === 0 && (
                <tr>
                  <td colSpan="7" className="px-5 py-16 text-center font-sans text-[0.83rem] text-ink-faint">
                    No customers yet. They appear automatically once orders are placed.
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
