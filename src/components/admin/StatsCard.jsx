// src/components/admin/StatsCard.jsx
import { useState, useEffect } from "react";
import { TrendingUp, TrendingDown } from "lucide-react";

export default function StatsCard({ icon: Icon, label, value, trend = 0, color = "purple" }) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    let start = 0;
    const end = typeof value === "number" ? value : parseInt(value) || 0;
    const duration = 1000;
    const step = end / (duration / 16);

    const interval = setInterval(() => {
      start += step;
      if (start >= end) {
        setDisplayValue(end);
        clearInterval(interval);
      } else {
        setDisplayValue(Math.floor(start));
      }
    }, 16);

    return () => clearInterval(interval);
  }, [value]);

  const colorClasses = {
    purple: "from-purple-500 to-purple-600 text-purple-600",
    orange: "from-orange-500 to-orange-600 text-orange-600",
    blue: "from-blue-500 to-blue-600 text-blue-600",
    emerald: "from-emerald-500 to-emerald-600 text-emerald-600",
  };

  return (
    <div className="relative overflow-hidden rounded-2xl bg-white border border-gray-100 p-6 shadow-md hover:shadow-lg transition-all duration-300">
      {/* Gradient background */}
      <div className={`absolute -right-8 -top-8 w-32 h-32 bg-gradient-to-br ${colorClasses[color]} opacity-10 rounded-full`}></div>

      {/* Content */}
      <div className="relative z-10">
        <div className="flex items-start justify-between mb-4">
          <div className={`p-3 rounded-lg bg-gradient-to-br ${colorClasses[color]} bg-opacity-10`}>
            <Icon className={`w-6 h-6 ${colorClasses[color]}`} />
          </div>
          {trend !== 0 && (
            <div className={`flex items-center gap-1 text-sm font-semibold ${trend > 0 ? "text-emerald-600" : "text-red-600"}`}>
              {trend > 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
              {Math.abs(trend)}%
            </div>
          )}
        </div>

        <p className="text-gray-600 text-sm font-medium mb-1">{label}</p>
        <h3 className="text-3xl font-bold text-gray-900">
          {typeof value === "string" ? value : value >= 1000000 ? `${(displayValue / 1000000).toFixed(1)}M` : value >= 1000 ? `${(displayValue / 1000).toFixed(1)}K` : displayValue}
        </h3>
      </div>
    </div>
  );
}
