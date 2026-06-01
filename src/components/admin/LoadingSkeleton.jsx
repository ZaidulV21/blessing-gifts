// src/components/admin/LoadingSkeleton.jsx
export default function LoadingSkeleton({ rows = 5, columns = 4 }) {
  return (
    <div className="space-y-4">
      {Array(rows)
        .fill(0)
        .map((_, i) => (
          <div key={i} className="flex gap-4">
            {Array(columns)
              .fill(0)
              .map((_, j) => (
                <div key={j} className="flex-1 h-12 bg-gray-200 rounded-lg animate-pulse"></div>
              ))}
          </div>
        ))}
    </div>
  );
}
