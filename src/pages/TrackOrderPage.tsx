// src/pages/TrackOrderPage.tsx
import { useState } from "react";
import { Helmet } from "react-helmet-async";
import { supabase } from "@/lib/supabaseClient";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import Spinner from "@/components/ui/Spinner";
import ErrorAlert from "@/components/ui/ErrorAlert";

export default function TrackOrderPage() {
  const [orderId, setOrderId] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [order, setOrder] = useState<any | null>(null);
  const [error, setError] = useState("");

  const handleTrackOrder = async () => {
    setError("");
    setOrder(null);

    if (!orderId.trim() || !email.trim()) {
      setError("Please enter both Order ID and Email.");
      return;
    }

    setLoading(true);

    const { data, error } = await supabase
      .from("orders")
      .select("*, order_items(*, product:product_id(name, image_url))")
      .eq("id", orderId.trim())
      .eq("email", email.trim())
      .single();

    if (error || !data) {
      setError("No matching order found.");
    } else {
      setOrder(data);

      // ✅ Google Analytics 4: Track Order event
      if (typeof window !== "undefined" && "gtag" in window) {
        window.gtag("event", "track_order", {
          order_id: data.id,
          email: email.trim(),
        });
      }
    }

    setLoading(false);
  };

  return (
    <div className="max-w-3xl mx-auto p-6">
      <Helmet>
        <title>Track Your Order | Cauverystore</title>
        <meta name="description" content="Check your order delivery status using your order ID and email." />
        <meta property="og:title" content="Track Your Order | Cauverystore" />
        <meta property="og:description" content="Check your order delivery status using your order ID and email." />
        <meta name="twitter:title" content="Track Your Order | Cauverystore" />
        <meta name="twitter:description" content="Check your order delivery status using your order ID and email." />
      </Helmet>

      <h1 className="text-2xl font-bold text-green-700 mb-6">Track Your Order</h1>

      <div className="space-y-4 mb-6">
        <Input
          type="text"
          value={orderId}
          onChange={(e) => setOrderId(e.target.value)}
          placeholder="Enter your Order ID"
        />
        <Input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your Email"
        />
        <Button onClick={handleTrackOrder} disabled={loading}>
          {loading ? "Tracking..." : "Track Order"}
        </Button>
      </div>

      {loading && (
        <div className="flex justify-center py-6">
          <Spinner size="lg" />
        </div>
      )}

      {error && <ErrorAlert message={error} />}

      {order && (
        <div className="border rounded-lg p-4 bg-white dark:bg-gray-900 shadow-sm">
          <h2 className="text-xl font-semibold mb-4">Order Details</h2>
          <p className="text-sm text-gray-600 mb-1">
            <strong>Order ID:</strong> {order.id}
          </p>
          <p className="text-sm text-gray-600 mb-1">
            <strong>Placed on:</strong> {new Date(order.created_at).toLocaleString()}
          </p>
          <p className="text-sm text-gray-600 mb-3">
            <strong>Status:</strong>{" "}
            <span className="font-medium text-green-700">
              {order.status || "Processing"}
            </span>
          </p>

          <h3 className="font-semibold mb-2">Items:</h3>
          <ul className="space-y-2">
            {order.order_items?.map((item: any) => (
              <li key={item.id} className="flex items-center gap-4">
                <img
                  src={item.product?.image_url}
                  alt={item.product?.name}
                  className="w-12 h-12 object-cover rounded border"
                />
                <span>{item.product?.name} × {item.quantity}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
