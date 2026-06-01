// src/pages/admin/AdminAnalytics.jsx
import { useState, useEffect } from "react";
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import LoadingSkeleton from "../../components/admin/LoadingSkeleton";

const COLORS = ["#a855f7", "#fb923c", "#0ea5e9", "#10b981", "#f59e0b"];

export default function AdminAnalytics() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const response = await fetch("/api/settings/analytics");
      if (!response.ok) throw new Error("Failed to fetch");
      const data = await response.json();
      setAnalytics(data);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8">
        <LoadingSkeleton rows={4} columns={2} />
      </div>
    );
  }

  const chartData = analytics?.monthlySales?.map((item) => ({
    month: `${item._id.month}/${item._id.year}`,
    revenue: item.revenue,
    orders: item.orders,
  })) || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900">Analytics</h1>
        <p className="text-gray-500 mt-2">Comprehensive business insights and metrics</p>
      </div>

      {/* Charts Grid */}
      <div className="space-y-8">
        {/* Revenue Trend */}
        <div className="bg-white rounded-2xl shadow-md p-6 border border-gray-100">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Revenue Trend</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip contentStyle={{ backgroundColor: "#fff", border: "1px solid #e5e7eb", borderRadius: "8px" }} />
              <Legend />
              <Line type="monotone" dataKey="revenue" stroke="#a855f7" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Revenue & Orders Comparison */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Revenue by Month */}
          <div className="bg-white rounded-2xl shadow-md p-6 border border-gray-100">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Orders by Month</h2>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" />
                <Tooltip contentStyle={{ backgroundColor: "#fff", border: "1px solid #e5e7eb", borderRadius: "8px" }} />
                <Bar dataKey="orders" fill="#a855f7" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Category Distribution */}
          <div className="bg-white rounded-2xl shadow-md p-6 border border-gray-100">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Top Categories</h2>
            {/* Placeholder pie chart */}
            <div className="h-250 flex items-center justify-center text-gray-500">
              Category data will be displayed here
            </div>
          </div>
        </div>

        {/* Metrics Summary */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-2xl shadow-md p-6 border border-gray-100">
            <p className="text-gray-600 text-sm font-medium mb-2">Total Revenue</p>
            <h3 className="text-3xl font-bold text-gray-900">₹{analytics?.totalRevenue.toLocaleString()}</h3>
            <p className="text-xs text-emerald-600 mt-2">↑ 12% from last month</p>
          </div>
          <div className="bg-white rounded-2xl shadow-md p-6 border border-gray-100">
            <p className="text-gray-600 text-sm font-medium mb-2">Total Orders</p>
            <h3 className="text-3xl font-bold text-gray-900">{analytics?.totalOrders}</h3>
            <p className="text-xs text-emerald-600 mt-2">↑ 8% from last month</p>
          </div>
          <div className="bg-white rounded-2xl shadow-md p-6 border border-gray-100">
            <p className="text-gray-600 text-sm font-medium mb-2">Avg Order Value</p>
            <h3 className="text-3xl font-bold text-gray-900">₹{Math.round(analytics?.totalRevenue / (analytics?.totalOrders || 1)).toLocaleString()}</h3>
            <p className="text-xs text-gray-500 mt-2">Across all orders</p>
          </div>
          <div className="bg-white rounded-2xl shadow-md p-6 border border-gray-100">
            <p className="text-gray-600 text-sm font-medium mb-2">Total Customers</p>
            <h3 className="text-3xl font-bold text-gray-900">{analytics?.totalCustomers}</h3>
            <p className="text-xs text-emerald-600 mt-2">↑ 15% from last month</p>
          </div>
        </div>
      </div>
    </div>
  );
}
