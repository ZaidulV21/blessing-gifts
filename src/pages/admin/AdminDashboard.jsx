// src/pages/admin/AdminDashboard.jsx
import { useState, useEffect } from "react";
import { Package, ShoppingBag, Users, TrendingUp, DollarSign, AlertCircle } from "lucide-react";
import StatsCard from "../../components/admin/StatsCard";
import LoadingSkeleton from "../../components/admin/LoadingSkeleton";
import EmptyState from "../../components/admin/EmptyState";
import RevenueChart from "../../components/admin/RevenueChart";
import TopProducts from "../../components/admin/TopProducts";
import Badge from "../../components/admin/Badge";
import toast from "react-hot-toast";

export default function AdminDashboard() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    pendingOrders: 0,
    totalProducts: 0,
    totalCustomers: 0,
  });

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/settings/analytics");
      if (!response.ok) throw new Error("Failed to fetch analytics");

      const data = await response.json();
      setAnalytics(data);
      setStats({
        totalRevenue: data.totalRevenue || 0,
        totalOrders: data.totalOrders || 0,
        pendingOrders: data.totalOrders * 0.3,
        totalProducts: data.totalProducts || 0,
        totalCustomers: data.totalCustomers || 0,
      });
    } catch (error) {
      console.error("Error fetching analytics:", error);
      toast.error("Failed to load analytics");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8">
        <LoadingSkeleton rows={4} columns={5} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-8 py-6">
        <div>
          <h1 className="text-4xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500 mt-2">Welcome back! Here's your ecommerce overview.</p>
        </div>
      </div>

      {/* Content */}
      <div className="p-8 space-y-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          <StatsCard
            icon={DollarSign}
            label="Total Revenue"
            value={`₹${stats.totalRevenue.toLocaleString()}`}
            trend={12}
            color="purple"
          />
          <StatsCard
            icon={ShoppingBag}
            label="Total Orders"
            value={stats.totalOrders}
            trend={8}
            color="orange"
          />
          <StatsCard
            icon={AlertCircle}
            label="Pending Orders"
            value={Math.floor(stats.pendingOrders)}
            trend={-5}
            color="blue"
          />
          <StatsCard
            icon={Package}
            label="Total Products"
            value={stats.totalProducts}
            trend={3}
            color="emerald"
          />
          <StatsCard
            icon={Users}
            label="Total Customers"
            value={stats.totalCustomers}
            trend={15}
            color="purple"
          />
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Revenue Chart */}
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-md p-6 border border-gray-100">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Revenue & Orders Trend</h2>
            {analytics?.monthlySales?.length > 0 ? (
              <RevenueChart
                data={
                  analytics.monthlySales.map((item) => ({
                    month: `${item._id.month}/${item._id.year}`,
                    revenue: item.revenue,
                    orders: item.orders,
                  })) || []
                }
              />
            ) : (
              <EmptyState title="No Data" description="No sales data available yet" />
            )}
          </div>

          {/* Quick Stats */}
          <div className="bg-white rounded-2xl shadow-md p-6 border border-gray-100 space-y-4">
            <h2 className="text-xl font-bold text-gray-900">Quick Stats</h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-gradient-to-r from-purple-50 to-transparent rounded-lg">
                <span className="text-sm text-gray-600">Avg Order Value</span>
                <span className="font-bold text-gray-900">
                  ₹{stats.totalOrders > 0 ? Math.round(stats.totalRevenue / stats.totalOrders) : 0}
                </span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gradient-to-r from-orange-50 to-transparent rounded-lg">
                <span className="text-sm text-gray-600">Conversion Rate</span>
                <span className="font-bold text-gray-900">2.4%</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gradient-to-r from-blue-50 to-transparent rounded-lg">
                <span className="text-sm text-gray-600">Repeat Customers</span>
                <span className="font-bold text-gray-900">18%</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gradient-to-r from-emerald-50 to-transparent rounded-lg">
                <span className="text-sm text-gray-600">Inventory Value</span>
                <span className="font-bold text-gray-900">₹2.5L</span>
              </div>
            </div>
          </div>
        </div>

        {/* Top Products */}
        <div className="bg-white rounded-2xl shadow-md p-6 border border-gray-100">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Top Selling Products</h2>
          {analytics?.topProducts?.length > 0 ? (
            <TopProducts products={analytics.topProducts} />
          ) : (
            <EmptyState title="No Products" description="No sales data available yet" />
          )}
        </div>

        {/* Recent Orders Preview */}
        <div className="bg-white rounded-2xl shadow-md p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Recent Orders</h2>
            <a href="/admin/orders" className="text-purple-600 hover:text-purple-700 text-sm font-semibold">
              View All →
            </a>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Order ID</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Customer</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Amount</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Status</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Date</th>
                </tr>
              </thead>
              <tbody>
                {[1, 2, 3, 4, 5].map((item) => (
                  <tr key={item} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-4 px-4 text-sm font-medium text-gray-900">BG-123456</td>
                    <td className="py-4 px-4 text-sm text-gray-600">John Doe</td>
                    <td className="py-4 px-4 text-sm font-semibold text-gray-900">₹5,999</td>
                    <td className="py-4 px-4 text-sm">
                      <Badge status="Delivered" />
                    </td>
                    <td className="py-4 px-4 text-sm text-gray-600">Today</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
