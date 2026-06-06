// src/pages/Cart.jsx
import { useNavigate } from "react-router-dom";
import { Minus, Plus, Trash2, ArrowRight, X } from "lucide-react";
import { useCart } from "../context/CartContext";
import { validateCoupon, validateStock } from "../services/api";
import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { useProducts } from "../hooks/useProducts";
import { getAvailableStock, isOutOfStock } from "../utils/stock";

export default function Cart() {
  const { cart, updateQty, removeFromCart, cartSubtotal, coupon, applyCoupon, removeCoupon } = useCart();
  const { products } = useProducts();
  const navigate = useNavigate();
  const [couponCode, setCouponCode] = useState("");
  const [loading, setLoading] = useState(false);

  const latestProductMap = useMemo(() => new Map(products.map((product) => [String(product.id), product])), [products]);

  useEffect(() => {
    const hasUnavailableItems = cart.some((item) => {
      const latest = latestProductMap.get(String(item.id)) || item;
      return isOutOfStock(latest) || getAvailableStock(latest) < item.qty;
    });

    if (hasUnavailableItems) {
      toast.error("Some items in your cart are no longer available.", {
        style: { fontFamily: "'Open Sans', sans-serif", fontSize: "0.83rem" },
      });
    }
  }, [cart, latestProductMap]);

  const delivery = cartSubtotal >= 999 ? 0 : 60;
  const baseTotal = cartSubtotal + delivery;
  const discount = coupon?.finalDiscount || 0;
  const total = baseTotal - discount;

  const handleValidateCoupon = async () => {
    if (!couponCode.trim()) {
      toast.error("Please enter a coupon code", {
        style: { fontFamily: "'Open Sans', sans-serif", fontSize: "0.83rem" },
      });
      return;
    }

    setLoading(true);
    try {
      const result = await validateCoupon(couponCode.toUpperCase(), baseTotal);
      applyCoupon({
        code: result.code,
        finalDiscount: result.finalDiscount,
        discountType: result.discountType,
        discountValue: result.discountValue,
      });
      toast.success(`Coupon "${result.code}" applied successfully!`, {
        style: { fontFamily: "'Open Sans', sans-serif", fontSize: "0.83rem" },
      });
      setCouponCode("");
    } catch (error) {
      toast.error(error.message || "Invalid coupon code", {
        style: { fontFamily: "'Open Sans', sans-serif", fontSize: "0.83rem" },
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveCoupon = () => {
    removeCoupon();
    setCouponCode("");
  };

  const getAvailability = (item) => {
    const latest = latestProductMap.get(String(item.id)) || item;
    const availableStock = getAvailableStock(latest);
    return {
      latest,
      availableStock,
      outOfStock: isOutOfStock(latest),
    };
  };

  const handleIncrement = async (item) => {
    const { availableStock, outOfStock } = getAvailability(item);
    const desiredQty = item.qty + 1;

    if (outOfStock || desiredQty > availableStock) {
      toast.error("Maximum available stock reached.", {
        style: { fontFamily: "'Open Sans', sans-serif", fontSize: "0.83rem" },
      });
      return;
    }

    try {
      await validateStock([{ productId: item.id, qty: desiredQty }]);
      updateQty(item.id, desiredQty);
    } catch {
      toast.error("Maximum available stock reached.", {
        style: { fontFamily: "'Open Sans', sans-serif", fontSize: "0.83rem" },
      });
    }
  };

  if (!cart.length) {
    return (
      <div className="page-enter max-w-7xl mx-auto px-6 py-20 text-center animate-section">
        <div className="font-serif text-[4rem] text-border mb-4">○</div>
        <h2 className="font-serif text-[2rem] font-normal text-ink-muted mb-3 animate-item">Your cart is empty</h2>
        <p className="font-sans text-[0.85rem] text-ink-faint mb-8">
          Discover our curated collection and find the perfect gift.
        </p>
        <button
          onClick={() => navigate("/shop")}
          className="bg-gold text-white px-8 py-3.5 font-sans text-[0.75rem] tracking-[1.5px] uppercase hover:bg-gold-light transition-all"
        >
          Browse Products
        </button>
      </div>
    );
  }

  return (
    <div className="page-enter max-w-7xl mx-auto px-6 py-16 animate-section">
      <div className="mb-10">
        <div className="text-[0.62rem] font-sans tracking-[3px] uppercase text-gold mb-2 animate-item">Your</div>
        <h1 className="font-serif text-[2.6rem] font-normal text-ink animate-item">Shopping <em className="italic font-light">Cart</em></h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-8 items-start">
        {/* Items */}
        <div className="bg-white border border-border-soft animate-item">
          {cart.map((item, i) => (
            (() => {
              const { availableStock, outOfStock } = getAvailability(item);

              return (
            <div key={item.id} className={`flex gap-5 p-5 animate-item ${i < cart.length - 1 ? "border-b border-border-soft" : ""}`}>
              <div className="w-[84px] h-[84px] rounded-sm overflow-hidden bg-cream-2 flex-shrink-0">
                <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
              </div>
              <div className="flex-1">
                <div className="text-[0.6rem] font-sans tracking-[2px] uppercase text-ink-faint mb-1">{item.category}</div>
                <div className="font-serif text-[1rem] font-normal text-ink mb-3">{item.name}</div>
                <div className="text-[0.62rem] font-sans tracking-[1.5px] uppercase mb-3">
                  <span className={`px-2.5 py-1 rounded-sm ${outOfStock ? "bg-red-50 text-red-700" : "bg-emerald-50 text-emerald-700"}`}>
                    {outOfStock ? "Out of stock" : `${availableStock} available`}
                  </span>
                </div>
                <div className="flex items-center border border-border rounded-sm w-fit overflow-hidden">
                  <button onClick={() => updateQty(item.id, item.qty - 1)} className="w-7 h-7 flex items-center justify-center hover:bg-cream-2 transition-colors">
                    <Minus size={12} className="text-ink-muted" />
                  </button>
                  <span className="w-8 text-center font-sans text-[0.82rem] font-medium border-x border-border">{item.qty}</span>
                  <button onClick={() => handleIncrement(item)} className="w-7 h-7 flex items-center justify-center hover:bg-cream-2 transition-colors">
                    <Plus size={12} className="text-ink-muted" />
                  </button>
                </div>
              </div>
              <div className="flex flex-col items-end justify-between">
                <div className="font-serif text-[1rem] font-normal text-ink">
                  ₹{(item.price * item.qty).toLocaleString()}
                </div>
                <button
                  onClick={() => removeFromCart(item.id)}
                  className="text-ink-faint hover:text-red-500 transition-colors"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
              );
            })()
          ))}
        </div>

        {/* Summary */}
        <div className="bg-cream-2 border border-border-soft p-7 sticky top-24 animate-item">
          <h3 className="font-serif text-[1.2rem] font-normal text-ink mb-6 pb-4 border-b border-border">
            Order Summary
          </h3>
          <div className="space-y-3 mb-4 font-sans text-[0.85rem]">
            <div className="flex justify-between text-ink-soft">
              <span>Items ({cart.reduce((s, i) => s + i.qty, 0)})</span>
              <span>₹{cartSubtotal.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-ink-soft">
              <span>Delivery</span>
              <span className={delivery === 0 ? "text-green-600 font-medium" : ""}>
                {delivery === 0 ? "FREE" : `₹${delivery}`}
              </span>
            </div>
            {delivery > 0 && (
              <div className="text-[0.72rem] text-ink-faint">
                Add ₹{(999 - cartSubtotal).toLocaleString()} more for free delivery
              </div>
            )}
          </div>

          {/* Coupon Section */}
          <div className="bg-gold-xpale border border-gold-light rounded-sm p-4 mb-4">
            {coupon ? (
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-sans text-[0.75rem] font-medium text-ink-muted mb-1">COUPON APPLIED</div>
                  <div className="font-serif text-[1rem] font-normal text-green-600">
                    -{coupon.discountType === "percentage" ? `${coupon.discountValue}%` : `₹${coupon.finalDiscount}`}
                  </div>
                  <div className="font-sans text-[0.65rem] text-ink-faint mt-1">{coupon.code}</div>
                </div>
                <button
                  onClick={handleRemoveCoupon}
                  className="text-ink-faint hover:text-red-500 transition-colors"
                >
                  <X size={18} />
                </button>
              </div>
            ) : (
              <div>
                <label className="block text-[0.62rem] font-medium tracking-[2px] uppercase text-ink-muted mb-2 font-sans">
                  Have a coupon?
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Enter coupon code"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    disabled={loading}
                    className="flex-1 px-3 py-2 border border-gold text-[0.85rem] font-sans rounded-sm outline-none focus:border-gold-light disabled:opacity-50"
                  />
                  <button
                    onClick={handleValidateCoupon}
                    disabled={loading || !couponCode.trim()}
                    className="px-4 py-2 bg-gold text-white font-sans text-[0.75rem] font-medium rounded-sm hover:bg-gold-light transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? "..." : "Apply"}
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-between font-serif text-[1.05rem] border-t border-border pt-4 mt-2">
            <span>Total</span>
            <div className="text-right">
              {discount > 0 && (
                <div className="text-[0.75rem] text-green-600 font-sans mb-1">
                  Saved: ₹{discount.toLocaleString()}
                </div>
              )}
              <span>₹{total.toLocaleString()}</span>
            </div>
          </div>
          <button
            onClick={() => navigate("/checkout")}
            className="w-full bg-ink text-white bg-black mt-6 py-3.5 font-sans text-[0.75rem] font-medium tracking-[2px] uppercase flex items-center justify-center gap-2 hover:bg-gold transition-colors"
          >
            Proceed to Checkout <ArrowRight size={14} />
          </button>
          <div className="mt-4 text-center text-[0.68rem] font-sans text-ink-faint leading-relaxed">
            🔒 Secure checkout · WhatsApp confirmation · 7-day returns
          </div>
        </div>
      </div>
    </div>
  );
}
