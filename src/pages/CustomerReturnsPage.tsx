// src/pages/CustomerReturnsPage.tsx

import { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { supabase } from "@/lib/supabaseClient";
import Spinner from "@/components/ui/Spinner";
import ErrorAlert from "@/components/ui/ErrorAlert";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import toast from "react-hot-toast";

interface Order {
  id: string;
  status: string;
  created_at: string;
  total_amount: number;
}

interface ReturnRequest {
  id: string;
  order_id: string;
  reason: string;
  status: string;
  created_at: string;
  image_url?: string;
}

export default function CustomerReturnsPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [returns, setReturns] = useState<ReturnRequest[]>([]);
  const [reasonMap, setReasonMap] = useState<Record<string, string>>({});
  const [fileMap, setFileMap] = useState<Record<string, File | null>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      loadData();
      window.gtag?.("event", "view_returns_page");
    }
  }, []);

  const loadData = async () => {
    setLoading(true);
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      setError("Authentication error");
      setLoading(false);
      return;
    }

    const { data: orderData, error: orderError } = await supabase
      .from("orders")
      .select("*")
      .eq("user_id", user.id)
      .in("status", ["delivered", "completed"]);

    const { data: returnData } = await supabase
      .from("returns")
      .select("*")
      .eq("user_id", user.id);

    if (orderError) {
      setError("Failed to fetch orders.");
    } else {
      setOrders(orderData || []);
      setReturns(returnData || []);
    }
    setLoading(false);
  };

  const submitReturn = async (orderId: string) => {
    const reason = reasonMap[orderId]?.trim();
    if (!reason) return toast.error("Please enter a reason");

    const file = fileMap[orderId];
    let image_url = null;

    if (file) {
      const { data, error: uploadError } = await supabase.storage
        .from("returns")
        .upload(`proofs/${orderId}-${Date.now()}`, file);

      if (uploadError) {
        toast.error("Image upload failed");
        return;
      }
      image_url = data?.path
        ? supabase.storage.from("returns").getPublicUrl(data.path).data.publicUrl
        : null;
    }

    const { data: { user } } = await supabase.auth.getUser();
    const { error } = await supabase.from("returns").insert([
      {
        order_id: orderId,
        reason,
        user_id: user?.id,
        status: "pending",
        image_url,
      },
    ]);

    if (!error) {
      toast.success("Return request submitted");
      window.gtag?.("event", "submit_return_request", { order_id: orderId });
      setReasonMap((prev) => ({ ...prev, [orderId]: "" }));
      setFileMap((prev) => ({ ...prev, [orderId]: null }));
      loadData();
    } else {
      toast.error("Failed to submit return");
    }
  };

  const getReturnStatus = (orderId: string) => {
    return returns.find((r) => r.order_id === orderId)?.status || "Not Requested";
  };

  const getStatusBadge = (status: string) => {
    const base = "inline-block px-2 py-1 text-xs rounded-full font-semibold";
    switch (status) {
      case "pending":
        return <span className={`${base} bg-yellow-100 text-yellow-800`}>Pending</span>;
      case "approved":
        return <span className={`${base} bg-green-100 text-green-800`}>Approved</span>;
      case "rejected":
        return <span className={`${base} bg-red-100 text-red-800`}>Rejected</span>;
      default:
        return <span className={`${base} bg-gray-100 text-gray-700`}>Not Requested</span>;
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <Helmet>
        <title>My Returns | Cauverystore</title>
        <meta name="description" content="View and manage your return requests." />
        <meta property="og:title" content="Returns - Cauverystore" />
        <meta name="twitter:title" content="Returns - Cauverystore" />
      </Helmet>

      <h1 className="text-3xl font-bold mb-4 text-green-700">Return Requests</h1>

      {loading ? (
        <Spinner size="lg" />
      ) : error ? (
        <ErrorAlert message={error} />
      ) : orders.length === 0 ? (
        <p className="text-gray-500">No delivered or completed orders found.</p>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => {
            const returnStatus = getReturnStatus(order.id);
            const alreadyRequested = returnStatus !== "Not Requested";
            return (
              <div
                key={order.id}
                className="border p-4 rounded-xl bg-white dark:bg-gray-900 shadow"
              >
                <div className="mb-2">
                  <p className="font-semibold text-gray-800 dark:text-gray-100">
                    Order ID: {order.id}
                  </p>
                  <p className="text-sm text-gray-500">
                    Date: {new Date(order.created_at).toLocaleDateString()}
                  </p>
                  <p className="text-sm text-gray-500">
                    Total: ₹{order.total_amount.toFixed(2)}
                  </p>
                  <p className="text-sm mt-1">
                    Return Status: {getStatusBadge(returnStatus)}
                  </p>
                </div>

                {!alreadyRequested && (
                  <div className="space-y-2 mt-3">
                    <Input
                      placeholder="Reason for return..."
                      value={reasonMap[order.id] || ""}
                      onChange={(e) =>
                        setReasonMap((prev) => ({
                          ...prev,
                          [order.id]: e.target.value,
                        }))
                      }
                    />
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={(e) =>
                        setFileMap((prev) => ({
                          ...prev,
                          [order.id]: e.target.files?.[0] || null,
                        }))
                      }
                    />
                    <Button onClick={() => submitReturn(order.id)}>Submit Return</Button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
