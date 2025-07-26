// src/pages/CancelOrderPage.tsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { supabase } from "@/lib/supabaseClient";

import PageHeader from "@/components/ui/PageHeader";
import Spinner from "@/components/ui/Spinner";
import ErrorAlert from "@/components/ui/ErrorAlert";
import { Button } from "@/components/ui/Button";
import InputError from "@/components/ui/InputError";
import toast from "react-hot-toast";

export default function CancelOrderPage() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedOrderId, setSelectedOrderId] = useState("");
  const [cancelReason, setCancelReason] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);
  const [session, setSession] = useState<any>(null);

  useEffect(() => {
    const init = async () => {
      const { data } = await supabase.auth.getSession();
      setSession(data.session);
      setAuthChecked(true);
    };
    init();
  }, []);

  useEffect(() => {
    if (!authChecked) return;
    fetchOrders();
  }, [authChecked]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .eq("user_id", user.id)
        .eq("status", "pending");

      if (error) throw error;
      setOrders(data || []);
    } catch (err: any) {
      console.error(err);
      setError("Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!selectedOrderId || !cancelReason.trim()) {
      toast.error("Please select an order and provide a reason");
      return;
    }

    setSubmitting(true);
    try {
      const { error } = await supabase
        .from("orders")
        .update({ status: "cancelled", cancel_reason: cancelReason })
        .eq("id", selectedOrderId);

      if (error) throw error;

      toast.success("Order cancelled successfully");

      // ✅ GA4 event: cancel_order
      if (typeof window !== "undefined" && window.gtag) {
        window.gtag("event", "cancel_order", {
          order_id: selectedOrderId,
          reason: cancelReason,
        });
      }

      setCancelReason("");
      setSelectedOrderId("");
      fetchOrders();
    } catch (err: any) {
      toast.error("Failed to cancel order");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6">
      <Helmet>
        <title>Cancel Order | Cauverystore</title>
        <meta
          name="description"
          content="Cancel your pending Cauverystore order by selecting a reason and confirming."
        />
        <meta property="og:title" content="Cancel Order | Cauverystore" />
        <meta
          property="og:description"
          content="Easily cancel pending orders on Cauverystore with a valid reason."
        />
        <meta name="twitter:title" content="Cancel Order | Cauverystore" />
        <meta
          name="twitter:description"
          content="Visit this page to cancel any of your pending Cauverystore orders."
        />
        <script async src="https://www.googletagmanager.com/gtag/js?id=G-3KRHXGB7JV"></script>
        <script>{`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', 'G-3KRHXGB7JV');
        `}</script>
      </Helmet>

      <PageHeader title="Cancel an Order" subtitle="Select a pending order to cancel" />

      {loading ? (
        <div className="flex justify-center py-10">
          <Spinner size="lg" />
        </div>
      ) : error ? (
        <ErrorAlert message={error} />
      ) : orders.length === 0 ? (
        <p className="text-center text-gray-600">No pending orders to cancel.</p>
      ) : (
        <div className="space-y-4">
          <div>
            <label className="block mb-1 font-medium">Select Order</label>
            <select
              value={selectedOrderId}
              onChange={(e) => setSelectedOrderId(e.target.value)}
              className="border rounded w-full p-2 dark:bg-gray-800 dark:text-white"
            >
              <option value="">-- Select --</option>
              {orders.map((order) => (
                <option key={order.id} value={order.id}>
                  #{order.id.slice(0, 8)} - ₹{order.total_price}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block mb-1 font-medium">Reason for Cancellation</label>
            <textarea
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              className="border rounded w-full p-2 min-h-[100px] dark:bg-gray-800 dark:text-white"
            />
            <InputError message={!cancelReason && submitting ? "Reason is required" : ""} />
          </div>

          <Button onClick={handleCancel} disabled={submitting}>
            {submitting ? "Cancelling..." : "Cancel Order"}
          </Button>
        </div>
      )}
    </div>
  );
}
