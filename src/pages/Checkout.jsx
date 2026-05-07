// src/pages/Checkout.jsx
// FIX: Validation now uses getElementById directly — no false "required" errors

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { WHATSAPP_NUMBER } from "../data/products";
import { createOrder } from "../services/api";
import toast from "react-hot-toast";

export default function Checkout() {
  const { cart, cartSubtotal, clearCart } = useCart();
  const navigate = useNavigate();
  const [payment, setPayment] = useState("UPI");
  const [errors, setErrors] = useState({});

  const delivery = cartSubtotal >= 999 ? 0 : 60;
  const total = cartSubtotal + delivery;

  // Helper: get value safely
  const val = (id) => {
    const el = document.getElementById(id);
    return el ? el.value.trim() : "";
  };

  // ── VALIDATION FIX ────────────────────────────────────────────
  // Each field is read directly by its exact id string.
  // No regex on the container — just getElementById.
  const validate = () => {
    const newErrors = {};

    const firstName = val("co-firstName");
    const lastName  = val("co-lastName");
    const phone     = val("co-phone");
    const addr1     = val("co-addr1");
    const city      = val("co-city");
    const state     = val("co-state");
    const pin       = val("co-pin");

    if (!firstName) newErrors.firstName = "First name is required";
    if (!lastName)  newErrors.lastName  = "Last name is required";
    if (!addr1)     newErrors.addr1     = "Address is required";
    if (!city)      newErrors.city      = "City is required";
    if (!state)     newErrors.state     = "State is required";

    if (!phone) {
      newErrors.phone = "Phone number is required";
    } else {
      const digits = phone.replace(/\D/g, "");
      if (digits.length < 10) {
        newErrors.phone = "Enter a valid 10-digit phone number";
      }
    }

    if (!pin) {
      newErrors.pin = "PIN code is required";
    } else if (!/^\d{6}$/.test(pin)) {
      newErrors.pin = "PIN code must be 6 digits";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const placeOrder = async () => {
    if (!cart.length) {
      toast.error("Your cart is empty!");
      return;
    }

    if (!validate()) {
      toast.error("Please fill all required fields correctly.", {
        style: { fontFamily: "'Jost', sans-serif", fontSize: "0.83rem" },
      });
      // Scroll to first error
      const firstErr = document.querySelector(".field-error");
      if (firstErr) firstErr.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }

    const firstName = val("co-firstName");
    const lastName  = val("co-lastName");
    const phone     = val("co-phone");
    const email     = val("co-email");
    const addr1     = val("co-addr1");
    const addr2     = val("co-addr2");
    const city      = val("co-city");
    const state     = val("co-state");
    const pin       = val("co-pin");
    const note      = val("co-note");

    const address = [addr1, addr2, city, `${state} - ${pin}`]
      .filter(Boolean)
      .join(", ");

    let orderId = "";

    const orderData = {
      customerName: `${firstName} ${lastName}`,
      phone,
      email,
      address,
      items: cart.map((i) => ({
        productId: i.id,
        name: i.name,
        qty: i.qty,
        price: i.price,
        imageUrl: i.imageUrl,
        category: i.category,
      })),
      totalAmount: total,
      payment,
      note,
    };

    try {
      const createdOrder = await createOrder(orderData);
      orderId = createdOrder.orderId || createdOrder.id;
    } catch (error) {
      toast.error(error.message || "Unable to place order right now.");
      return;
    }

    // Build WhatsApp message
    const msg =
      `🎁 *NEW ORDER — Blessing Gifts*\n\n` +
      `📋 *Order ID:* ${orderId}\n` +
      `👤 *Customer:* ${firstName} ${lastName}\n` +
      `📞 *Phone:* ${phone}\n` +
      (email ? `📧 *Email:* ${email}\n` : "") +
      `📍 *Address:* ${address}\n\n` +
      `🛍️ *Items Ordered:*\n` +
      cart.map((i) => `  • ${i.name} × ${i.qty}  →  ₹${(i.price * i.qty).toLocaleString()}`).join("\n") +
      `\n\n💰 *Subtotal:* ₹${cartSubtotal.toLocaleString()}` +
      `\n🚚 *Delivery:* ${delivery === 0 ? "FREE" : "₹" + delivery}` +
      `\n💳 *Total:* ₹${total.toLocaleString()}` +
      `\n💳 *Payment:* ${payment}` +
      (note ? `\n📝 *Note:* ${note}` : "") +
      `\n\n_Please confirm this order._`;

    window.open(
      `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`,
      "_blank"
    );

    clearCart();
    navigate("/order-success", { state: { orderId } });
  };

  // ── INPUT COMPONENT ───────────────────────────────────────────
  const Field = ({ id, label, placeholder, type = "text", required = false, readOnly = false, defaultValue = "" }) => (
    <div className="mb-4">
      <label className="block text-[0.62rem] font-medium tracking-[2px] uppercase text-ink-muted mb-2 font-sans">
        {label} {required && <span className="text-red-400">*</span>}
      </label>
      <input
        id={id}
        type={type}
        placeholder={placeholder}
        readOnly={readOnly}
        defaultValue={defaultValue}
        onChange={() => {
          // Clear error when user starts typing
          if (errors[id.replace("co-", "")]) {
            setErrors((prev) => {
              const next = { ...prev };
              delete next[id.replace("co-", "")];
              return next;
            });
          }
        }}
        className={`w-full px-4 py-2.5 border font-sans text-[0.88rem] outline-none transition-colors placeholder-ink-faint/50 rounded-sm ${
          readOnly
            ? "bg-cream-3 text-ink-faint border-border cursor-not-allowed"
            : errors[id.replace("co-", "")]
            ? "border-red-400 bg-red-50 focus:border-red-500"
            : "border-border bg-cream focus:border-gold"
        }`}
      />
      {errors[id.replace("co-", "")] && (
        <p className="field-error text-[0.7rem] text-red-500 mt-1 font-sans">
          {errors[id.replace("co-", "")]}
        </p>
      )}
    </div>
  );

  return (
    <div className="page-enter max-w-7xl mx-auto px-4 sm:px-6 py-10 sm:py-16">
      {/* Header */}
      <div className="mb-8 sm:mb-10">
        <div className="text-[0.62rem] font-sans tracking-[3px] uppercase text-gold mb-1">
          Secure
        </div>
        <h1 className="font-serif text-[2.2rem] sm:text-[2.6rem] font-normal text-ink">
          Check<em className="italic font-light">out</em>
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6 sm:gap-8 items-start">
        {/* ── LEFT: FORMS ── */}
        <div>

          {/* Customer Details */}
          <div className="bg-white border border-border-soft p-5 sm:p-7 mb-4 rounded-sm">
            <h3 className="font-serif text-[1.05rem] font-normal text-ink mb-5 pb-4 border-b border-border-soft">
              Customer Details
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4">
              <Field id="co-firstName" label="First Name" placeholder="Raj"         required />
              <Field id="co-lastName"  label="Last Name"  placeholder="Sharma"      required />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4">
              <Field id="co-phone" label="Phone Number" placeholder="+91 98765 43210" type="tel" required />
              <Field id="co-email" label="Email"        placeholder="raj@gmail.com"   type="email" />
            </div>
          </div>

          {/* Delivery Address */}
          <div className="bg-white border border-border-soft p-5 sm:p-7 mb-4 rounded-sm">
            <h3 className="font-serif text-[1.05rem] font-normal text-ink mb-5 pb-4 border-b border-border-soft">
              Delivery Address
            </h3>
            <Field id="co-addr1" label="Address Line 1" placeholder="House No, Street Name" required />
            <Field id="co-addr2" label="Landmark / Locality" placeholder="Colony, Near landmark (optional)" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4">
              <Field id="co-city"  label="City"  placeholder="Lucknow"       required />
              <Field id="co-state" label="State" placeholder="Uttar Pradesh" required />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4">
              <Field id="co-pin"     label="PIN Code" placeholder="226001" required />
              <Field id="co-country" label="Country"  defaultValue="India" readOnly />
            </div>
            <div className="mb-4">
              <label className="block text-[0.62rem] font-medium tracking-[2px] uppercase text-ink-muted mb-2 font-sans">
                Delivery Instructions
              </label>
              <textarea
                id="co-note"
                placeholder="Any special delivery notes..."
                rows={3}
                className="w-full px-4 py-2.5 border border-border bg-cream font-sans text-[0.88rem] outline-none focus:border-gold rounded-sm resize-none placeholder-ink-faint/50"
              />
            </div>
          </div>

          {/* Payment */}
          <div className="bg-white border border-border-soft p-5 sm:p-7 rounded-sm">
            <h3 className="font-serif text-[1.05rem] font-normal text-ink mb-5 pb-4 border-b border-border-soft">
              Payment Method
            </h3>
            <div className="grid grid-cols-2 gap-3 mb-4">
              {["UPI", "COD"].map((m) => (
                <div
                  key={m}
                  onClick={() => setPayment(m)}
                  className={`border-2 rounded-sm p-4 cursor-pointer text-center transition-all ${
                    payment === m
                      ? "border-gold bg-gold-xpale"
                      : "border-border hover:border-ink-muted"
                  }`}
                >
                  <div className="text-2xl mb-2">{m === "UPI" ? "📱" : "💵"}</div>
                  <div className="font-sans text-[0.72rem] font-medium tracking-[1px] uppercase text-ink-soft">
                    {m === "UPI" ? "UPI Payment" : "Cash on Delivery"}
                  </div>
                </div>
              ))}
            </div>

            {payment === "UPI" && (
              <div className="bg-gold-xpale border-l-2 border-gold px-4 py-3 font-sans text-[0.8rem] text-ink-muted leading-relaxed mb-4 rounded-r-sm">
                📱 After placing your order, you'll receive our UPI QR code via WhatsApp.
                Send your payment screenshot to confirm the order.
              </div>
            )}

            <button
              onClick={placeOrder}
              className="w-full flex items-center justify-center gap-3 rounded-sm transition-all hover:-translate-y-0.5"
              style={{
                background: "#2D7A4F",
                color: "white",
                border: "none",
                padding: "15px",
                fontFamily: "'Jost', sans-serif",
                fontSize: "0.78rem",
                fontWeight: 500,
                letterSpacing: "2px",
                textTransform: "uppercase",
                cursor: "pointer",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "#245f3c")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "#2D7A4F")}
            >
              <span>📲</span>
              Confirm Order via WhatsApp
            </button>
            <p className="text-center text-[0.68rem] font-sans text-ink-faint mt-2">
              Your full order details will open in WhatsApp
            </p>
          </div>
        </div>

        {/* ── RIGHT: ORDER SUMMARY ── */}
        <div
          className="rounded-sm lg:sticky lg:top-24"
          style={{ background: "#111010" }}
        >
          <div className="p-5 sm:p-6">
            <div
              className="font-serif text-[1.1rem] text-gold mb-5 pb-4"
              style={{ borderBottom: "1px solid rgba(255,255,255,0.1)" }}
            >
              Order Summary
            </div>

            <div className="space-y-3 mb-4">
              {cart.map((i) => (
                <div key={i.id} className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-sm overflow-hidden flex-shrink-0"
                    style={{ background: "rgba(255,255,255,0.08)" }}
                  >
                    <img
                      src={i.imageUrl}
                      alt={i.name}
                      className="w-full h-full object-cover"
                      style={{ opacity: 0.85 }}
                    />
                  </div>
                  <span className="flex-1 font-serif text-[0.85rem]" style={{ color: "rgba(255,255,255,0.65)" }}>
                    {i.name} ×{i.qty}
                  </span>
                  <span className="font-sans text-[0.8rem] font-medium" style={{ color: "#D4A843" }}>
                    ₹{(i.price * i.qty).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>

            <div style={{ borderTop: "1px solid rgba(255,255,255,0.1)", paddingTop: "0.8rem" }}>
              <div className="flex justify-between font-sans text-[0.82rem] mb-2" style={{ color: "rgba(255,255,255,0.5)" }}>
                <span>Subtotal</span>
                <span>₹{cartSubtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between font-sans text-[0.82rem] mb-2" style={{ color: "rgba(255,255,255,0.5)" }}>
                <span>Delivery</span>
                <span style={{ color: delivery === 0 ? "#6EE7B7" : "rgba(255,255,255,0.5)" }}>
                  {delivery === 0 ? "FREE" : `₹${delivery}`}
                </span>
              </div>
              <div
                className="flex justify-between font-serif text-[1.05rem] pt-2 mt-1"
                style={{ borderTop: "1px solid rgba(255,255,255,0.1)", color: "white" }}
              >
                <span>Total</span>
                <span>₹{total.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
