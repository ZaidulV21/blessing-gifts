// src/pages/Cart.jsx
import { useNavigate } from "react-router-dom";
import { Minus, Plus, Trash2, ArrowRight } from "lucide-react";
import { useCart } from "../context/CartContext";

export default function Cart() {
  const { cart, updateQty, removeFromCart, cartSubtotal } = useCart();
  const navigate = useNavigate();
  const delivery = cartSubtotal >= 999 ? 0 : 60;
  const total = cartSubtotal + delivery;

  if (!cart.length) {
    return (
      <div className="page-enter max-w-7xl mx-auto px-6 py-20 text-center">
        <div className="font-serif text-[4rem] text-border mb-4">○</div>
        <h2 className="font-serif text-[2rem] font-normal text-ink-muted mb-3">Your cart is empty</h2>
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
    <div className="page-enter max-w-7xl mx-auto px-6 py-16">
      <div className="mb-10">
        <div className="text-[0.62rem] font-sans tracking-[3px] uppercase text-gold mb-2">Your</div>
        <h1 className="font-serif text-[2.6rem] font-normal text-ink">Shopping <em className="italic font-light">Cart</em></h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-8 items-start">
        {/* Items */}
        <div className="bg-white border border-border-soft">
          {cart.map((item, i) => (
            <div key={item.id} className={`flex gap-5 p-5 ${i < cart.length - 1 ? "border-b border-border-soft" : ""}`}>
              <div className="w-[84px] h-[84px] rounded-sm overflow-hidden bg-cream-2 flex-shrink-0">
                <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
              </div>
              <div className="flex-1">
                <div className="text-[0.6rem] font-sans tracking-[2px] uppercase text-ink-faint mb-1">{item.category}</div>
                <div className="font-serif text-[1rem] font-normal text-ink mb-3">{item.name}</div>
                <div className="flex items-center border border-border rounded-sm w-fit overflow-hidden">
                  <button onClick={() => updateQty(item.id, item.qty - 1)} className="w-7 h-7 flex items-center justify-center hover:bg-cream-2 transition-colors">
                    <Minus size={12} className="text-ink-muted" />
                  </button>
                  <span className="w-8 text-center font-sans text-[0.82rem] font-medium border-x border-border">{item.qty}</span>
                  <button onClick={() => updateQty(item.id, item.qty + 1)} className="w-7 h-7 flex items-center justify-center hover:bg-cream-2 transition-colors">
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
          ))}
        </div>

        {/* Summary */}
        <div className="bg-cream-2 border border-border-soft p-7 sticky top-24">
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
          <div className="flex justify-between font-serif text-[1.05rem] border-t border-border pt-4 mt-2">
            <span>Total</span>
            <span>₹{total.toLocaleString()}</span>
          </div>
          <button
            onClick={() => navigate("/checkout")}
            className="w-full bg-ink text-white mt-6 py-3.5 font-sans text-[0.75rem] font-medium tracking-[2px] uppercase flex items-center justify-center gap-2 hover:bg-gold transition-colors"
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
