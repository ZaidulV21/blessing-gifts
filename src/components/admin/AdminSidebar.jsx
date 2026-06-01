// src/components/admin/AdminSidebar.jsx
import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAdmin } from "../../context/AdminContext";
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Users,
  Zap,
  TrendingUp,
  Ticket,
  Star,
  Settings,
  LogOut,
  Eye,
  ChevronDown,
  X,
} from "lucide-react";

const menuItems = [
  { label: "Dashboard", icon: LayoutDashboard, to: "/admin/dashboard" },
  { label: "Orders", icon: ShoppingBag, to: "/admin/orders" },
  { label: "Products", icon: Package, to: "/admin/products" },
  { label: "Customers", icon: Users, to: "/admin/customers" },
  { label: "Analytics", icon: TrendingUp, to: "/admin/analytics" },
  { label: "Coupons", icon: Ticket, to: "/admin/coupons" },
  { label: "Reviews", icon: Star, to: "/admin/reviews" },
  { label: "Settings", icon: Settings, to: "/admin/settings" },
];

export default function AdminSidebar({ isOpen, onClose }) {
  const navigate = useNavigate();
  const { adminLogout } = useAdmin();

  const handleLogout = () => {
    adminLogout();
    navigate("/");
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && <div className="fixed inset-0 bg-black bg-opacity-50 z-20 md:hidden" onClick={onClose}></div>}

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 h-screen w-64 bg-gradient-to-b from-slate-900 to-slate-800 text-white transform transition-transform duration-300 z-30 ${
          isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        {/* Header */}
        <div className="h-16 border-b border-slate-700 px-6 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold">Blessing Gifts</h1>
            <p className="text-xs text-slate-400">Admin Dashboard</p>
          </div>
          <button onClick={onClose} className="md:hidden p-1 hover:bg-slate-700 rounded">
            <X size={20} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 space-y-1 px-3">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => onClose?.()}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                    isActive
                      ? "bg-gradient-to-r from-purple-600 to-purple-500 text-white shadow-lg"
                      : "text-slate-300 hover:bg-slate-700 hover:text-white"
                  }`
                }
              >
                <Icon size={20} />
                <span className="font-medium">{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="border-t border-slate-700 p-4 space-y-2">
          <button
            onClick={() => navigate("/")}
            className="w-full flex items-center gap-3 px-4 py-3 text-slate-300 hover:text-white hover:bg-slate-700 rounded-lg transition-all duration-200"
          >
            <Eye size={20} />
            <span className="font-medium">View Store</span>
          </button>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 text-slate-300 hover:text-white hover:bg-red-700 rounded-lg transition-all duration-200"
          >
            <LogOut size={20} />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
}
