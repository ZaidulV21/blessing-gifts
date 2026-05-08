// src/pages/TrackOrder.jsx
import { useState } from "react";
import { Search } from "lucide-react";
import { getOrderStatus } from "../services/api";

const STEPS = ["Pending", "Confirmed", "Shipped", "Delivered"];
const STEP_ICONS = { Pending: "🕐", Confirmed: "✅", Shipped: "🚚", Delivered: "🎉" };

export default function TrackOrder() {
  const [query, setQuery] = useState("");
  const [order, setOrder] = useState(null);
  const [notFound, setNotFound] = useState(false);

  const track = async () => {
    const q = query.trim();
    if (!q) return;

    try {
      const found = await getOrderStatus(q);

      if (found) {
        setOrder(found);
        setNotFound(false);
        return;
      }
    } catch {
      // Fall through to the legacy localStorage lookup below.
    }

    const orders = JSON.parse(localStorage.getItem("bg_orders") || "[]");
    const foundLocal = orders.find(
      (o) =>
        o.id === q ||
        o.phone === q ||
        o.phone?.replace(/\D/g, "") === q.replace(/\D/g, "")
    );
    setOrder(foundLocal || null);
    setNotFound(!foundLocal);
  };

  const curStep = order ? STEPS.indexOf(order.status) : -1;

  return (
    <div className="page-enter max-w-[580px] mx-auto px-6 py-20 animate-section">
      <div className="bg-white border border-border-soft p-10 rounded-sm">
        <div className="text-center mb-8">
          <div className="text-[0.62rem] font-sans tracking-[3px] uppercase text-gold mb-3 animate-item">Order Status</div>
          <h1 className="font-serif text-[2.2rem] font-normal text-ink mb-2 animate-item">Track Your Order</h1>
          <p className="font-sans text-[0.82rem] font-light text-ink-faint animate-item">
            Enter your Order ID or registered phone number
          </p>
        </div>

        {/* Search */}
        <div className="flex border border-border overflow-hidden rounded-sm mb-8 animate-item">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && track()}
            placeholder="BG-123456  or  9876543210"
            className="flex-1 px-4 py-3 font-sans text-[0.88rem] bg-cream outline-none placeholder-ink-faint/50"
          />
          <button
            onClick={track}
            className="bg-ink text-white px-5 flex items-center gap-2 font-sans text-[0.72rem] tracking-[1.5px] uppercase hover:bg-gold transition-colors"
          >
            <Search size={14} />
            Track
          </button>
        </div>

        {/* Not found */}
        {notFound && (
          <div className="text-center py-6 font-sans text-[0.83rem] text-ink-faint animate-item">
            ❌ No order found. Please check your Order ID or phone number.
          </div>
        )}

        {/* Result */}
        {order && (
          <div className="animate-item">
            {/* Order info card */}
            <div className="bg-cream-2 rounded-sm p-4 mb-8 grid grid-cols-3 gap-4">
              {[
                { label: "Order ID", value: order.id },
                { label: "Date", value: order.date },
                { label: "Total", value: `₹${order.total?.toLocaleString()}` },
              ].map((item) => (
                <div key={item.label}>
                  <div className="text-[0.58rem] font-sans tracking-[2px] uppercase text-ink-faint mb-1">
                    {item.label}
                  </div>
                  <div className="font-serif text-[0.95rem] font-normal text-ink">{item.value}</div>
                </div>
              ))}
            </div>

            {/* Status badge */}
            <div className="flex items-center justify-center mb-8">
              <span className={`status-${order.status} font-sans text-[0.72rem] font-medium tracking-[1px] uppercase px-4 py-1.5 rounded-sm`}>
                {STEP_ICONS[order.status]} {order.status}
              </span>
            </div>

            {/* Progress steps */}
            <div className="flex flex-col gap-0">
              {STEPS.map((step, i) => (
                <div key={step} className="flex gap-4 items-flex-start">
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center text-[0.72rem] font-bold border-2 flex-shrink-0 z-10 ${
                        i < curStep
                          ? "bg-green-600 border-green-600 text-white"
                          : i === curStep
                          ? "bg-gold border-gold text-white"
                          : "bg-white border-border text-ink-faint"
                      }`}
                    >
                      {i <= curStep ? "✓" : i + 1}
                    </div>
                    {i < STEPS.length - 1 && (
                      <div className={`w-px h-8 mt-0.5 ${i < curStep ? "bg-green-600" : "bg-border"}`} />
                    )}
                  </div>
                  <div className={`pb-8 ${i === STEPS.length - 1 ? "pb-0" : ""}`}>
                    <div className={`font-sans text-[0.88rem] font-medium mb-0.5 ${i <= curStep ? "text-ink" : "text-ink-faint"}`}>
                      {step}
                    </div>
                    <div className="font-sans text-[0.73rem] text-ink-faint">
                      {i === 0 && "Order received, awaiting confirmation"}
                      {i === 1 && "Order confirmed and being packed"}
                      {i === 2 && "Out for delivery" + (order.trackingLink ? ` — ` : "")}
                      {i === 2 && order.trackingLink && (
                        <a href={order.trackingLink} target="_blank" rel="noreferrer" className="text-gold underline ml-1">
                          Track Shipment
                        </a>
                      )}
                      {i === 3 && "Delivered to your address"}
                    </div>
                    <div className="font-sans text-[0.7rem] text-ink-faint mt-0.5">
                      {i <= curStep ? order.date : "Pending"}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* WhatsApp support */}
            <div className="mt-8 pt-6 border-t border-border-soft text-center animate-item">
              <p className="font-sans text-[0.75rem] text-ink-faint mb-3">
                Need help? Contact us on WhatsApp
              </p>
              <a
                href={`https://wa.me/919876543210?text=Hi! I need help with my order ${order.id}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 bg-green-600 text-white px-5 py-2.5 rounded-sm font-sans text-[0.72rem] tracking-[1px] uppercase hover:bg-green-700 transition-colors"
              >
                💬 Chat on WhatsApp
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
