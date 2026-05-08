// src/pages/OrderSuccess.jsx
import { useLocation, useNavigate } from "react-router-dom";

export default function OrderSuccess() {
  const location = useLocation();
  const navigate = useNavigate();
  const orderId = location.state?.orderId || "BG-XXXXXX";

  return (
    <div className="page-enter max-w-2xl mx-auto px-6 py-24 text-center animate-section">
      <div className="w-20 h-20 rounded-full border-[1.5px] border-gold flex items-center justify-center text-3xl mx-auto mb-8">
        ✓
      </div>
      <h1 className="font-serif text-[2.5rem] font-normal text-ink mb-3 animate-item">Order Confirmed!</h1>
      <p className="font-sans text-[0.88rem] font-light text-ink-muted leading-relaxed mb-10 animate-item">
        Your order has been sent to Blessing Gifts via WhatsApp.<br />
        You will receive a call or message shortly to confirm your order.
      </p>

      <div className="inline-block bg-cream-2 border border-dashed border-gold px-10 py-5 rounded-sm mb-10">
        <div className="text-[0.6rem] font-sans tracking-[2px] uppercase text-ink-faint mb-1">
          Your Order ID
        </div>
        <div className="font-serif text-[1.5rem] font-normal text-ink">{orderId}</div>
      </div>

      <div className="flex gap-4 justify-center flex-wrap">
        <button
          onClick={() => navigate("/track")}
          className="bg-gold text-white px-8 py-3.5 font-sans text-[0.75rem] tracking-[1.5px] uppercase hover:bg-gold-light transition-all"
        >
          Track My Order
        </button>
        <button
          onClick={() => navigate("/")}
          className="text-ink border border-border px-8 py-3.5 font-sans text-[0.75rem] tracking-[1.5px] uppercase hover:border-ink-muted transition-colors"
        >
          Continue Shopping
        </button>
      </div>
    </div>
  );
}
