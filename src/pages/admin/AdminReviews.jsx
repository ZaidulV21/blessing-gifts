// src/pages/admin/AdminReviews.jsx
import { useState, useEffect } from "react";
import { Check, X, Trash2, Star, Search } from "lucide-react";
import Badge from "../../components/admin/Badge";
import LoadingSkeleton from "../../components/admin/LoadingSkeleton";
import EmptyState from "../../components/admin/EmptyState";
import toast from "react-hot-toast";

export default function AdminReviews() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("pending");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/reviews?status=pending");
      if (!response.ok) throw new Error("Failed to fetch");
      const data = await response.json();
      setReviews(data);
    } catch (error) {
      toast.error("Failed to load reviews");
    } finally {
      setLoading(false);
    }
  };

  const updateReviewStatus = async (id, status) => {
    try {
      const endpoint = status === "approved" ? `approve` : `reject`;
      const response = await fetch(`/api/reviews/${id}/${endpoint}`, { method: "POST" });
      if (!response.ok) throw new Error("Failed to update");
      toast.success(`Review ${status}`);
      fetchReviews();
    } catch (error) {
      toast.error("Failed to update review");
    }
  };

  const deleteReview = async (id) => {
    if (!window.confirm("Delete this review?")) return;

    try {
      const response = await fetch(`/api/reviews/${id}`, { method: "DELETE" });
      if (!response.ok) throw new Error("Failed to delete");
      toast.success("Review deleted");
      fetchReviews();
    } catch (error) {
      toast.error("Failed to delete review");
    }
  };

  const filteredReviews = reviews.filter((r) =>
    r.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="p-8">
        <LoadingSkeleton rows={6} columns={5} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900">Reviews</h1>
        <p className="text-gray-500 mt-2">{reviews.length} pending reviews for moderation</p>
      </div>

      {/* Filters & Search */}
      <div className="bg-white rounded-2xl shadow-md p-6 border border-gray-100 mb-8">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search reviews..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-purple-500 transition-colors"
            />
          </div>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-purple-500 transition-colors"
          >
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      {/* Reviews */}
      {filteredReviews.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-12">
          <EmptyState title="No Reviews" description="No reviews to moderate" />
        </div>
      ) : (
        <div className="space-y-4">
          {filteredReviews.map((review) => (
            <div key={review._id} className="bg-white rounded-xl shadow-md border border-gray-100 p-6 hover:shadow-lg transition-all">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-bold text-gray-900">{review.title}</h3>
                    <div className="flex gap-1">
                      {Array(review.rating)
                        .fill(0)
                        .map((_, i) => (
                          <Star key={i} size={16} className="fill-yellow-400 text-yellow-400" />
                        ))}
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">{review.content}</p>
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <span>By {review.customerName}</span>
                    <span>{review.customerEmail}</span>
                  </div>
                </div>
                <Badge status={review.status} />
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 pt-4 border-t border-gray-100">
                <button
                  onClick={() => updateReviewStatus(review._id, "approved")}
                  className="flex items-center gap-2 px-4 py-2 bg-emerald-100 text-emerald-600 rounded-lg hover:bg-emerald-200 transition-colors font-medium text-sm"
                >
                  <Check size={16} />
                  Approve
                </button>
                <button
                  onClick={() => updateReviewStatus(review._id, "rejected")}
                  className="flex items-center gap-2 px-4 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors font-medium text-sm"
                >
                  <X size={16} />
                  Reject
                </button>
                <button
                  onClick={() => deleteReview(review._id)}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors font-medium text-sm ml-auto"
                >
                  <Trash2 size={16} />
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
