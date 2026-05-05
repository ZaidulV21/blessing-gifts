// src/components/Footer.jsx
import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="bg-ink text-white/40 mt-0">
      <div className="max-w-7xl mx-auto px-6 py-10 grid grid-cols-1 md:grid-cols-3 items-center gap-6">
        <div>
          <div className="font-serif text-white/80 text-xl mb-1">Blessing Gifts</div>
          <div className="text-[0.65rem] font-sans tracking-[2px] uppercase text-gold">
            Premium Gift Collection
          </div>
        </div>
        <div className="text-center">
          <div className="text-[0.68rem] font-sans tracking-wide mb-2">
            © {new Date().getFullYear()} Blessing Gifts · All Rights Reserved
          </div>
          <div className="flex justify-center gap-6 text-[0.65rem] tracking-wide">
            <Link to="/shop" className="hover:text-gold transition-colors">Shop</Link>
            <Link to="/track" className="hover:text-gold transition-colors">Track Order</Link>
            <Link to="/admin" className="hover:text-gold transition-colors">Admin</Link>
          </div>
        </div>
        <div className="text-right text-[0.68rem] font-sans tracking-wide">
          <div>Lucknow, Uttar Pradesh</div>
          <div className="text-[0.65rem] mt-1">7-day returns · Pan-India delivery · WhatsApp support</div>
        </div>
      </div>
    </footer>
  );
}
