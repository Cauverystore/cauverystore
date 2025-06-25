import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Helmet } from "react-helmet-async";
import PageHeader from "@/components/ui/PageHeader";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import ErrorAlert from "@/components/ui/ErrorAlert";
import Button from "@/components/ui/Button";
import InputError from "@/components/ui/InputError";
import toast from "react-hot-toast";

interface Order {
  id: string;
  created_at: string;
  total_price: number;
  items: any[];
  status: string;
}

export default function MyOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reviewingOrderId, setReviewingOrderId] = useState<string | null>(null);
  const [reviewText, setReviewText] = useState("");
  const [reviewRating, setReviewRating] = useState(5);
  const [submittingReview, setSubmittingReview] = useState(false);

  const [requestingReturnId, setRequestingReturnId] = useState<string | null>(null);
  const [returnReason, setReturnReason] = useState("");
  const [submittingReturn, setSubmittingReturn] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    setError("");

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not logged in");

      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;

      setOrders(data || []);
    } catch (err: any) {
      console.error(err);
      setError("Failed to fetch orders");
    } finally {
      setLoading(false);
    }
  };

  const handleReviewSubmit = async (orderId: string, productId: string) => {
    if (!reviewText.trim() || reviewRating === 0) {
      toast.error("Please enter review and rating");
      return;
    }

    setSubmittingReview(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not logged in");

      const { error } = await supabase.from("product_reviews").insert([
        {
          user_id: user.id,
          product_id: productId,
          rating: reviewRating,
          review: reviewText,
        },
      ]);

      if (error) throw error;

      toast.success("Review submitted");
      setReviewText("");
      setReviewRating(5);
      setReviewingOrderId(null);
    } catch (err) {
      toast.error("Failed to submit review");
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleReturnRequest = async (orderId: string) => {
    if (!returnReason.trim()) {
      toast.error("Please enter reason");
      return;
    }

    setSubmittingReturn(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not logged in");

      const { error } = await supabase.from("support_requests").insert([
        {
          user_id: user.id,
          order_id: orderId,
          type: "return_or_replace",
          message: returnReason,
          status: "open",
        },
      ]);

      if (error) throw error;

      toast.success("Request submitted");
      setReturnReason("");
      setRequestingReturnId(null);
    } catch (err) {
      toast.error("Failed to submit return request");
    } finally {
      setSubmittingReturn(false);
    }
  };

  return (
    <div className="p-4 max-w-5xl mx-auto space-y-6">
      <Helmet>
        <title>My Orders | Cauverystore</title>
        <meta
          name="description"
          content="View and manage your past orders. Submit reviews, request returns, and download invoices."
        />
      </Helmet>

      <PageHeader title="My Orders" />

      {loading ? (
        <div className="flex justify-center py-20">
          <LoadingSpinner />
        </div>
      ) : error ? (
        <ErrorAlert message={error} />
      ) : orders.length === 0 ? (
        <p className="text-center text-gray-500">You have no orders yet.</p>
      ) : (
        orders.map((order) => (
          <div
            key={order.id}
            className="border rounded p-4 bg-white dark:bg-gray-800 shadow-sm"
          >
            <div className="flex justify-between items-center mb-2">
              <div className="text-sm text-gray-500">
                Order #{order.id.slice(0, 8)} | {new Date(order.created_at).toLocaleDateString()}
              </div>
              <div className="text-sm font-medium text-green-700 capitalize">{order.status}</div>
            </div>

            <ul className="space-y-2 mb-4">
              {order.items?.map((item: any) => (
                <li key={item.id} className="flex justify-between items-center">
                  <span>{item.name} × {item.quantity}</span>
                  <span className="text-sm">₹{item.price * item.quantity}</span>
                </li>
              ))}
            </ul>

            <div className="text-right font-semibold mb-3">
              Total: ₹{order.total_price}
            </div>

            <div className="flex flex-wrap gap-3">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setReviewingOrderId(order.id)}
              >
                Write Review
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setRequestingReturnId(order.id)}
              >
                Return / Replace
              </Button>
              <Button
                size="sm"
                asChild
              >
                <a href={`/invoice/${order.id}`} target="_blank" rel="noreferrer">
                  Invoice
                </a>
              </Button>
              <Button
                size="sm"
                variant="link"
                asChild
              >
                <a href={`/contact-support?order_id=${order.id}`}>Contact Support</a>
              </Button>
            </div>

            {/* Review Form */}
            {reviewingOrderId === order.id && (
              <div className="mt-4 border-t pt-4 space-y-3">
                <h4 className="font-semibold">Submit Review</h4>
                <textarea
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  className="w-full border p-2 rounded"
                  placeholder="Write your review..."
                />
                <div className="flex items-center gap-2">
                  <select
                    value={reviewRating}
                    onChange={(e) => setReviewRating(Number(e.target.value))}
                    className="border p-1 rounded"
                  >
                    {[5, 4, 3, 2, 1].map((r) => (
                      <option key={r} value={r}>{r} Star</option>
                    ))}
                  </select>
                  <Button
                    size="sm"
                    onClick={() => handleReviewSubmit(order.id, order.items[0]?.id)}
                    disabled={submittingReview}
                  >
                    Submit
                  </Button>
                </div>
              </div>
            )}

            {/* Return Form */}
            {requestingReturnId === order.id && (
              <div className="mt-4 border-t pt-4 space-y-3">
                <h4 className="font-semibold">Return or Replace</h4>
                <textarea
                  value={returnReason}
                  onChange={(e) => setReturnReason(e.target.value)}
                  className="w-full border p-2 rounded"
                  placeholder="State your reason"
                />
                <div className="text-right">
                  <Button
                    size="sm"
                    onClick={() => handleReturnRequest(order.id)}
                    disabled={submittingReturn}
                  >
                    Submit Request
                  </Button>
                </div>
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
}
