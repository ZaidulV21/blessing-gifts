// src/components/admin/TopProducts.jsx
import Badge from "./Badge";

export default function TopProducts({ products = [] }) {
  if (!products.length) {
    return (
      <div className="text-center py-8 text-gray-500">
        No product data available
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {products.map((product, idx) => (
        <div key={idx} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-1">
              <span className="text-sm font-bold text-purple-600 bg-purple-100 w-6 h-6 rounded-full flex items-center justify-center">
                {idx + 1}
              </span>
              <h4 className="font-semibold text-gray-900 truncate">{product.name}</h4>
            </div>
            <p className="text-xs text-gray-500">{product.quantity} sold</p>
          </div>
          <div className="text-right">
            <p className="font-bold text-gray-900">₹{product.revenue?.toLocaleString() || 0}</p>
            <p className="text-xs text-gray-500">{product.quantity} units</p>
          </div>
        </div>
      ))}
    </div>
  );
}
