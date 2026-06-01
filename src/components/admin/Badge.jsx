// src/components/admin/Badge.jsx
const statusColors = {
  Pending: "bg-yellow-100 text-yellow-800",
  Confirmed: "bg-blue-100 text-blue-800",
  Packed: "bg-purple-100 text-purple-800",
  Shipped: "bg-indigo-100 text-indigo-800",
  Delivered: "bg-emerald-100 text-emerald-800",
  Cancelled: "bg-red-100 text-red-800",
  pending: "bg-yellow-100 text-yellow-800",
  approved: "bg-emerald-100 text-emerald-800",
  rejected: "bg-red-100 text-red-800",
  active: "bg-emerald-100 text-emerald-800",
  inactive: "bg-gray-100 text-gray-800",
};

export default function Badge({ status, children = status }) {
  const baseClasses = "px-3 py-1 rounded-full text-sm font-semibold";
  const colorClass = statusColors[status] || "bg-gray-100 text-gray-800";

  return <span className={`${baseClasses} ${colorClass}`}>{children}</span>;
}
