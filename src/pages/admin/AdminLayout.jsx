// src/pages/admin/AdminLayout.jsx
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAdmin } from "../../context/AdminContext";
import {
  LayoutDashboard, Package, ShoppingBag, Users, LogOut, ExternalLink,
} from "lucide-react";

const navItems = [
  { to: "/admin/dashboard", icon: <LayoutDashboard size={16} />, label: "Dashboard" },
  { to: "/admin/orders", icon: <Package size={16} />, label: "Orders" },
  { to: "/admin/products", icon: <ShoppingBag size={16} />, label: "Products" },
  { to: "/admin/customers", icon: <Users size={16} />, label: "Customers" },
];

export default function AdminLayout() {
  const { adminLogout, isAdminLoggedIn } = useAdmin();
  const navigate = useNavigate();

  if (!isAdminLoggedIn) {
    navigate("/admin");
    return null;
  }

  const handleLogout = () => {
    adminLogout();
    navigate("/admin");
  };

  return (
    <div className="flex min-h-[calc(100vh-68px)]">
      {/* Sidebar */}
      <aside className="w-[220px] bg-ink flex-shrink-0 flex flex-col">
        <div className="px-6 py-6 border-b border-white/10">
          <div className="font-serif text-gold text-[1.05rem] font-normal">Blessing Gifts</div>
          <div className="text-[0.58rem] font-sans tracking-[2px] uppercase text-white/30 mt-0.5">Admin Panel</div>
        </div>

        <nav className="flex-1 py-3">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-6 py-2.5 font-sans text-[0.78rem] font-normal tracking-wide transition-all border-l-2 ${
                  isActive
                    ? "text-gold-light border-gold bg-white/5"
                    : "text-white/45 border-transparent hover:text-white/75 hover:bg-white/3"
                }`
              }
            >
              <span className="opacity-70">{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-white/10 py-3">
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-3 px-6 py-2.5 w-full font-sans text-[0.75rem] text-white/30 hover:text-white/55 transition-colors"
          >
            <ExternalLink size={14} />
            View Store
          </button>
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-6 py-2.5 w-full font-sans text-[0.75rem] text-red-400/70 hover:text-red-400 transition-colors"
          >
            <LogOut size={14} />
            Logout
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 bg-cream-2 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}
