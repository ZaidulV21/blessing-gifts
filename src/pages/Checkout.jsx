// src/pages/Checkout.jsx
// Professional Razorpay Payment Integration with error handling

import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { WHATSAPP_NUMBER } from "../data/products";
import { 
  createOrder, 
  createPaymentOrder, 
  verifyRazorpayPayment, 
  handlePaymentFailure 
} from "../services/api";
import toast from "react-hot-toast";

export default function Checkout() {
  const { cart, cartSubtotal, coupon, clearCart } = useCart();
  const navigate = useNavigate();
  const [payment, setPayment] = useState("COD");
  const [errors, setErrors] = useState({});
  const [isProcessing, setIsProcessing] = useState(false);
  const razorpayScriptRef = useRef(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    email: "",
    addr1: "",
    addr2: "",
    city: "",
    state: "",
    pin: "",
    note: "",
    country: "India",
  });

  const delivery = cartSubtotal >= 999 ? 0 : 60;
  const baseTotal = cartSubtotal + delivery;
  const discount = coupon?.finalDiscount || 0;
  const total = baseTotal - discount;

  // Helper: get value from controlled form state
  const val = (id) => {
    const key = id.replace(/^co-/, "");
    return (formData[key] || "").trim();
  };

  const handleChange = (key, value) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
    }
  };

  const validate = () => {
    const newErrors = {};

    const get = (id) => (val(id) || "").trim();
    const firstName = get("co-firstName");
    const lastName = get("co-lastName");
    const phone = get("co-phone");
    const addr1 = get("co-addr1");
    const city = get("co-city");
    const state = get("co-state");
    const pin = get("co-pin");

    if (!firstName) newErrors.firstName = "First name is required";
    if (!lastName) newErrors.lastName = "Last name is required";
    if (!addr1) newErrors.addr1 = "Address is required";
    if (!city) newErrors.city = "City is required";
    if (!state) newErrors.state = "State is required";

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

    if (Object.keys(newErrors).length > 0) {
      // Focus and scroll to first invalid field for usability
      const firstKey = Object.keys(newErrors)[0];
      const el = document.getElementById(`co-${firstKey}`);
      if (el) {
        el.focus();
        el.scrollIntoView({ behavior: "smooth", block: "center" });
      }
      return false;
    }

    return true;
  };

  /**
   * Load Razorpay script dynamically
   */
  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      if (razorpayScriptRef.current) {
        resolve(true);
        return;
      }

      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.async = true;
      script.onload = () => {
        razorpayScriptRef.current = true;
        resolve(true);
      };
      script.onerror = () => {
        console.error("Failed to load Razorpay script");
        resolve(false);
      };
      document.body.appendChild(script);
    });
  };

  /**
   * Handle Razorpay payment
   * Professional e-commerce flow with error handling
   */
  const handleRazorpayPayment = async (orderData, orderId) => {
    try {
      setIsProcessing(true);

      // Load Razorpay script if not loaded
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        throw new Error("Failed to load payment gateway. Please try again.");
      }

      // Create Razorpay order
      const paymentResponse = await createPaymentOrder(orderData);
      const { order, razorpay } = paymentResponse;

      // Prepare Razorpay options
      const options = {
        key: razorpay.keyId,
        amount: razorpay.amount,
        currency: razorpay.currency,
        order_id: razorpay.orderId,
        name: "Blessing Gifts",
        description: `Order #${orderId}`,
        image: "https://blessing-gifts.com/logo.png", // Replace with your logo
        handler: async (response) => {
          try {
            // Verify payment on backend
            const verifyResponse = await verifyRazorpayPayment({
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
              orderId: order.orderId,
            });

            if (verifyResponse.paymentStatus === "completed") {
              toast.success("Payment successful! Order confirmed.", {
                style: { fontFamily: "'Open Sans', sans-serif", fontSize: "0.83rem" },
                duration: 3,
              });

              clearCart();
              navigate("/order-success", { state: { orderId: order.orderId } });
            } else {
              throw new Error("Payment verification failed. Please try again.");
            }
          } catch (error) {
            console.error("Payment verification error:", error);
            toast.error(
              error.message || "Payment verification failed. Please contact support.",
              { style: { fontFamily: "'Open Sans', sans-serif", fontSize: "0.83rem" } }
            );

            // Log payment failure
            await handlePaymentFailure({
              orderId: order.orderId,
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              reason: "Verification failed",
            }).catch(console.error);
          }
        },
        prefill: {
          name: `${val("co-firstName")} ${val("co-lastName")}`,
          email: val("co-email"),
          contact: val("co-phone"),
        },
        notes: {
          orderId: order.orderId,
          address: orderData.address,
        },
        theme: {
          color: "#B8912A", // Gold color
        },
        modal: {
          ondismiss: async () => {
            console.log("Payment modal closed");
            // Log payment cancellation
            await handlePaymentFailure({
              orderId: order.orderId,
              reason: "User cancelled",
            }).catch(console.error);
          },
        },
      };

      // Open Razorpay checkout
      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", async (response) => {
        const description = response?.error?.description || "Payment failed";
        const reason = response?.error?.reason || "unknown_reason";
        const metadataOrderId = response?.error?.metadata?.order_id;
        const metadataPaymentId = response?.error?.metadata?.payment_id;

        toast.error(description, {
          style: { fontFamily: "'Open Sans', sans-serif", fontSize: "0.83rem" },
        });

        await handlePaymentFailure({
          orderId: order.orderId,
          razorpayOrderId: metadataOrderId || order.razorpayOrderId,
          razorpayPaymentId: metadataPaymentId,
          reason,
        }).catch(console.error);
      });
      rzp.open();
    } catch (error) {
      console.error("Razorpay payment error:", error);
      toast.error(
        error.message || "Unable to process payment. Please try again.",
        { style: { fontFamily: "'Open Sans', sans-serif", fontSize: "0.83rem" } }
      );

      // Cleanup on error
      await handlePaymentFailure({
        orderId,
        reason: error.message,
      }).catch(console.error);
    } finally {
      setIsProcessing(false);
    }
  };

  /**
   * Handle COD (Cash on Delivery) order
   */
  const handleCODOrder = async (orderData, orderId) => {
    try {
      // Create order via existing flow
      await createOrder(orderData);

      // Build WhatsApp message
      const msg =
        `🎁 *NEW ORDER — Blessing Gifts*\n\n` +
        `📋 *Order ID:* ${orderId}\n` +
        `👤 *Customer:* ${val("co-firstName")} ${val("co-lastName")}\n` +
        `📞 *Phone:* ${val("co-phone")}\n` +
        (val("co-email") ? `📧 *Email:* ${val("co-email")}\n` : "") +
        `📍 *Address:* ${orderData.address}\n\n` +
        `🛍️ *Items Ordered:*\n` +
        cart.map((i) => `  • ${i.name} × ${i.qty}  →  ₹${(i.price * i.qty).toLocaleString()}`).join("\n") +
        `\n\n💰 *Subtotal:* ₹${cartSubtotal.toLocaleString()}` +
        `\n🚚 *Delivery:* ${delivery === 0 ? "FREE" : "₹" + delivery}` +
        `\n💳 *Total:* ₹${total.toLocaleString()}` +
        `\n💳 *Payment:* Cash on Delivery` +
        (val("co-note") ? `\n📝 *Note:* ${val("co-note")}` : "") +
        `\n\n_Please confirm this order._`;

      window.open(
        `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`,
        "_blank"
      );

      clearCart();
      navigate("/order-success", { state: { orderId } });
    } catch (error) {
      toast.error(error.message || "Unable to place order right now.", {
        style: { fontFamily: "'Open Sans', sans-serif", fontSize: "0.83rem" },
      });
    }
  };

  /**
   * Main order placement handler
   */
  const placeOrder = async () => {
    if (!cart.length) {
      toast.error("Your cart is empty!");
      return;
    }

    if (!validate()) {
      toast.error("Please fill all required fields correctly.", {
        style: { fontFamily: "'Open Sans', sans-serif", fontSize: "0.83rem" },
      });
      const firstErr = document.querySelector(".field-error");
      if (firstErr) firstErr.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }

    if (isProcessing) {
      toast.error("Please wait, processing your order...", {
        style: { fontFamily: "'Open Sans', sans-serif", fontSize: "0.83rem" },
      });
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
      couponCode: coupon?.code || null,
      discountAmount: discount,
      payment,
      note,
    };

    // Get or create order ID
    let orderId = "";

    if (payment === "Razorpay") {
      // For Razorpay, let the backend generate the order ID
      await handleRazorpayPayment(orderData, orderId);
    } else {
      // For COD, create order first
      try {
        const createdOrder = await createOrder(orderData);
        orderId = createdOrder.orderId || createdOrder.id;
        await handleCODOrder(orderData, orderId);
      } catch (error) {
        toast.error(error.message || "Unable to place order right now.", {
          style: { fontFamily: "'Open Sans', sans-serif", fontSize: "0.83rem" },
        });
      }
    }
  };

  // ── INPUT COMPONENT ───────────────────────────────────────────
  const Field = ({ id, label, placeholder, type = "text", required = false, readOnly = false }) => {
    const key = id.replace(/^co-/, "");
    return (
      <div className="mb-4">
        <label className="block text-[0.62rem] font-medium tracking-[2px] uppercase text-ink-muted mb-2 font-sans">
          {label} {required && <span className="text-red-400">*</span>}
        </label>
        <input
          id={id}
          type={type}
          placeholder={placeholder}
          readOnly={readOnly}
          value={formData[key]}
          disabled={isProcessing}
          onChange={(e) => handleChange(key, e.target.value)}
          className={`w-full px-4 py-2.5 border font-sans text-[0.88rem] outline-none transition-colors placeholder-ink-faint/50 rounded-sm disabled:opacity-50 disabled:cursor-not-allowed ${
            readOnly
              ? "bg-cream-3 text-ink-faint border-border cursor-not-allowed"
              : errors[key]
              ? "border-red-400 bg-red-50 focus:border-red-500"
              : "border-border bg-cream focus:border-gold"
          }`}
        />
        {errors[key] && (
          <p className="field-error text-[0.7rem] text-red-500 mt-1 font-sans">
            {errors[key]}
          </p>
        )}
      </div>
    );
  };

  return (
    <div className="page-enter max-w-7xl mx-auto px-4 sm:px-6 py-10 sm:py-16 animate-section">
      {/* Header */}
      <div className="mb-8 sm:mb-10">
        <div className="text-[0.62rem] font-sans tracking-[3px] uppercase text-gold mb-1 animate-item">
          Secure
        </div>
        <h1 className="font-serif text-[2.2rem] sm:text-[2.6rem] font-normal text-ink animate-item">
          Check<em className="italic font-light">out</em>
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6 sm:gap-8 items-start">
        {/* ── LEFT: FORMS ── */}
        <div className="animate-item" style={{ opacity: isProcessing ? 0.6 : 1, pointerEvents: isProcessing ? "none" : "auto" }}>

          {/* Customer Details */}
          <div className="bg-white border border-border-soft p-5 sm:p-7 mb-4 rounded-sm animate-item">
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
          <div className="bg-white border border-border-soft p-5 sm:p-7 mb-4 rounded-sm animate-item">
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
                disabled={isProcessing}
                className="w-full px-4 py-2.5 border border-border bg-cream font-sans text-[0.88rem] outline-none focus:border-gold rounded-sm resize-none placeholder-ink-faint/50 disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>
          </div>

          {/* Payment */}
          <div className="bg-white border border-border-soft p-5 sm:p-7 rounded-sm animate-item">
            <h3 className="font-serif text-[1.05rem] font-normal text-ink mb-5 pb-4 border-b border-border-soft">
              Payment Method
            </h3>
            <div className="grid grid-cols-2 gap-3 mb-4">
              {["Razorpay", "COD"].map((m) => (
                <div
                  key={m}
                  onClick={() => !isProcessing && setPayment(m)}
                  className={`border-2 rounded-sm p-4 cursor-pointer text-center transition-all ${
                    isProcessing ? "opacity-50 cursor-not-allowed" : ""
                  } ${
                    payment === m
                      ? "border-gold bg-gold-xpale"
                      : "border-border hover:border-ink-muted"
                  }`}
                >
                  <div className="text-2xl mb-2">{m === "Razorpay" ? "💳" : "💵"}</div>
                  <div className="font-sans text-[0.72rem] font-medium tracking-[1px] uppercase text-ink-soft">
                    {m === "Razorpay" ? "Online Payment" : "Cash on Delivery"}
                  </div>
                </div>
              ))}
            </div>

            {payment === "Razorpay" && (
              <div className="bg-gold-xpale border-l-2 border-gold px-4 py-3 font-sans text-[0.8rem] text-ink-muted leading-relaxed mb-4 rounded-r-sm">
                💳 Secure payment via Razorpay. Supports all major credit/debit cards, UPI, and digital wallets.
              </div>
            )}

            {payment === "COD" && (
              <div className="bg-gold-xpale border-l-2 border-gold px-4 py-3 font-sans text-[0.8rem] text-ink-muted leading-relaxed mb-4 rounded-r-sm">
                💵 Pay when your order arrives. We'll send you confirmation via WhatsApp.
              </div>
            )}

            <button
              onClick={placeOrder}
              disabled={isProcessing}
              className="w-full flex items-center justify-center gap-3 rounded-sm transition-all hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                background: isProcessing ? "#999" : "#2D7A4F",
                color: "white",
                border: "none",
                padding: "15px",
                fontFamily: "'Open Sans', sans-serif",
                fontSize: "0.78rem",
                fontWeight: 500,
                letterSpacing: "2px",
                textTransform: "uppercase",
              }}
              onMouseEnter={(e) => !isProcessing && (e.currentTarget.style.background = "#245f3c")}
              onMouseLeave={(e) => !isProcessing && (e.currentTarget.style.background = "#2D7A4F")}
            >
              <span>{isProcessing ? "⏳" : payment === "Razorpay" ? "💳" : "📲"}</span>
              {isProcessing ? "Processing..." : payment === "Razorpay" ? "Proceed to Payment" : "Confirm Order via WhatsApp"}
            </button>
            <p className="text-center text-[0.68rem] font-sans text-ink-faint mt-2">
              {isProcessing
                ? "Please wait while we process your order..."
                : payment === "Razorpay"
                ? "Your order details will be sent after payment confirmation"
                : "Your full order details will open in WhatsApp"}
            </p>
          </div>
        </div>

        {/* ── RIGHT: ORDER SUMMARY ── */}
        <div
          className="rounded-sm lg:sticky lg:top-24 animate-item"
          style={{ background: "#111010", opacity: isProcessing ? 0.6 : 1 }}
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
              {coupon && (
                <div className="flex justify-between font-sans text-[0.82rem] mb-2" style={{ color: "#6EE7B7" }}>
                  <span>
                    Discount ({coupon.discountType === "percentage" ? `${coupon.discountValue}%` : "Fixed"})
                  </span>
                  <span>-₹{discount.toLocaleString()}</span>
                </div>
              )}
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
