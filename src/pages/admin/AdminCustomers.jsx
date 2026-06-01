// src/pages/admin/AdminCustomers.jsx
import { useState, useEffect } from "react";
import { ShoppingBag, TrendingUp, Search } from "lucide-react";
import LoadingSkeleton from "../../components/admin/LoadingSkeleton";
import EmptyState from "../../components/admin/EmptyState";
import Badge from "../../components/admin/Badge";
import toast from "react-hot-toast";

export default function AdminCustomers() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      // Fetch all orders to extract customers
      const { getOrders } = await import("../../services/api");
      const orders = await getOrders();

      // Group customers by phone
      const customerMap = {};
      orders.forEach((order) => {
        if (!customerMap[order.phone]) {
          customerMap[order.phone] = {
            id: order.phone,
            name: order.customer,
            email: order.email || "N/A",
            phone: order.phone,
            orders: 0,
            totalSpent: 0,
            lastOrder: order.date,
            address: order.address || "N/A",
          };
        }
        customerMap[order.phone].orders += 1;
        customerMap[order.phone].totalSpent += order.total || 0;
      });

      const customersList = Object.values(customerMap).sort((a, b) => b.totalSpent - a.totalSpent);
      setCustomers(customersList);
    } catch (error) {
      toast.error("Failed to load customers");
    } finally {
      setLoading(false);
    }
  };

  const filteredCustomers = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.phone.includes(searchTerm)
  );

  if (loading) {
    return (
      <div className="p-8">
        <LoadingSkeleton rows={5} columns={3} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900">Customers</h1>
        <p className="text-gray-500 mt-2">{customers.length} total customers</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <p className="text-gray-600 font-medium">Total Orders</p>
            <ShoppingBag size={24} className="text-orange-500" />
          </div>
          <h3 className="text-3xl font-bold text-gray-900">
            {customers.reduce((sum, c) => sum + c.orders, 0)}
          </h3>
        </div>

        <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <p className="text-gray-600 font-medium">Total Revenue</p>
            <TrendingUp size={24} className="text-purple-500" />
          </div>
          <h3 className="text-3xl font-bold text-gray-900">
            ₹{customers.reduce((sum, c) => sum + c.totalSpent, 0).toLocaleString()}
          </h3>
        </div>

        <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <p className="text-gray-600 font-medium">Avg Spent</p>
            <TrendingUp size={24} className="text-emerald-500" />
          </div>
          <h3 className="text-3xl font-bold text-gray-900">
            ₹{customers.length > 0 ? Math.round(customers.reduce((sum, c) => sum + c.totalSpent, 0) / customers.length).toLocaleString() : "0"}
          </h3>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white rounded-2xl shadow-md p-4 mb-8 border border-gray-100">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search customers by name, email, or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-purple-500 transition-colors"
          />
        </div>
      </div>

      {/* Customers Grid/Table */}
      {filteredCustomers.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-12">
          <EmptyState
            title="No Customers"
            description="Customers will appear here as orders are placed"
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCustomers.map((customer) => (
            <div
              key={customer.id}
              className="bg-white rounded-xl shadow-md border border-gray-100 p-6 hover:shadow-lg transition-all"
            >
              <div className="mb-4">
                <h3 className="text-lg font-bold text-gray-900">{customer.name}</h3>
                <p className="text-sm text-gray-500">{customer.email}</p>
              </div>

              <div className="space-y-2 mb-4 pb-4 border-b border-gray-100">
                <a
                  href={`tel:${customer.phone}`}
                  className="block text-sm text-purple-600 hover:text-purple-700"
                >
                  {customer.phone}
                </a>
                <p className="text-xs text-gray-500">{customer.address}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-500 uppercase font-semibold">Orders</p>
                  <p className="text-2xl font-bold text-gray-900">{customer.orders}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase font-semibold">Total Spent</p>
                  <p className="text-2xl font-bold text-purple-600">₹{customer.totalSpent.toLocaleString()}</p>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-100">
                <p className="text-xs text-gray-500">Last Order: {customer.lastOrder}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
