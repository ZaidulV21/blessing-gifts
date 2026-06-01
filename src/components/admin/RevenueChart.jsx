// src/components/admin/RevenueChart.jsx
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

export default function RevenueChart({ data = [] }) {
  if (!data.length) {
    return (
      <div className="h-80 flex items-center justify-center text-gray-500">
        No data available
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis dataKey="month" stroke="#9ca3af" />
        <YAxis stroke="#9ca3af" />
        <Tooltip
          contentStyle={{
            backgroundColor: "#fff",
            border: "1px solid #e5e7eb",
            borderRadius: "8px",
          }}
        />
        <Legend />
        <Line
          type="monotone"
          dataKey="revenue"
          stroke="#a855f7"
          strokeWidth={2}
          dot={{ fill: "#a855f7", r: 4 }}
          activeDot={{ r: 6 }}
          name="Revenue (₹)"
        />
        <Line
          type="monotone"
          dataKey="orders"
          stroke="#fb923c"
          strokeWidth={2}
          dot={{ fill: "#fb923c", r: 4 }}
          activeDot={{ r: 6 }}
          name="Orders"
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
