// src/components/admin/EmptyState.jsx
import { InboxIcon } from "lucide-react";

export default function EmptyState({ title = "No Data", description = "No items to display", icon: Icon = InboxIcon, action = null }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className="bg-gradient-to-br from-gray-100 to-gray-50 p-8 rounded-full mb-6">
        <Icon className="w-12 h-12 text-gray-400" />
      </div>
      <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-500 text-center max-w-sm mb-6">{description}</p>
      {action && <div>{action}</div>}
    </div>
  );
}
