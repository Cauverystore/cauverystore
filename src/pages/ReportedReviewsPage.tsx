import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import toast from "react-hot-toast";

export default function ReportedReviewsPage() {
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [replyMap, setReplyMap] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchReportedReviews();
  }, []);

  const fetchReportedReviews = async () => {
    const { data, error } = await supabase
      .from("review_reports")
      .select("*, review:review_id(*, product:product_id(name))")
      .order("created_at", { ascending: false });

    if (error) {
      toast.error("Failed to load reports");
      setLoading(false);
      return;
    }

    const enriched = data.map((r: any) => ({
      ...r.review,
      report_reason: r.reason,
      report_id: r.id,
    }));

    setReviews(enriched);
    setLoading(false);
  };

  const handleReply = async (reviewId: string) => {
    const reply = replyMap[reviewId];
    if (!reply.trim()) return toast.error("Reply cannot be empty");

    const { error } = await supabase
      .from("product_reviews")
      .update({ admin_reply: reply })
      .eq("id", reviewId);

    if (!error) {
      toast.success("Reply saved");
      setReplyMap((prev) => ({ ...prev, [reviewId]: "" }));
      fetchReportedReviews();
    } else {
      toast.error("Failed to save reply");
    }
  };

  if (loading) return <div className="p-4">Loading reported reviews...</div>;

  return (
    <div className="p-4 max-w-5xl mx-auto">
      <h2 className="text-2xl font-bold text-red-700 mb-6">Reported Reviews</h2>
      {reviews.length === 0 ? (
        <p>No reported reviews found.</p>
      ) : (
        <div className="space-y-6">
          {reviews.map((review) => (
            <div key={review.id} className="border p-4 bg-white rounded shadow-sm space-y-2">
              <p className="text-sm text-gray-600">
                <span className="font-medium">Product:</span> {review.product?.name || "Unknown"}
              </p>
              <p className="text-sm">
                <span className="font-medium">User Review:</span> {review.content}
              </p>
              <p className="text-sm text-red-600">
                <span className="font-medium">Reported Reason:</span> {review.report_reason}
              </p>
              <textarea
                value={replyMap[review.id] || ""}
                onChange={(e) => setReplyMap((prev) => ({ ...prev, [review.id]: e.target.value }))}
                placeholder="Write admin reply..."
                className="w-full border px-3 py-2 rounded text-sm"
              />
              <button
                onClick={() => handleReply(review.id)}
                className="bg-green-600 text-white px-4 py-1 text-sm rounded hover:bg-green-700"
              >
                Submit Reply
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
