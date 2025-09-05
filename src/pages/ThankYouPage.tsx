// src/pages/ThankYouPage.tsx
import { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { supabase } from "@/lib/supabaseClient";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

export default function ThankYouPage() {
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [authChecked, setAuthChecked] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (typeof window === "undefined") return;

    const fetchLastPaidOrder = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error("Please log in to view your order.");
        navigate("/login");
        return;
      }

      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .eq("user_id", session.user.id)
        .eq("status", "paid")
        .order("paid_at", { ascending: false })
        .limit(1)
        .single();

      if (error || !data) {
        toast.error("No recent paid order found.");
        navigate("/");
        return;
      }

      setOrder(data);
      setLoading(false);

      // ✅ Google Analytics 4: Purchase confirmation tracking
      if (typeof window !== "undefined" && window.gtag && Array.isArray(data.items)) {
        window.gtag("event", "purchase", {
          transaction_id: data.id,
          value: data.total || 0,
          currency: "INR",
          items: data.items.map((item: any) => ({
            item_name: item.name,
            item_id: item.product_id,
            price: item.price,
            quantity: item.quantity,
          })),
        });
      }
    };

    fetchLastPaidOrder();
    setAuthChecked(true);
  }, [navigate]);

  if (!authChecked) return null;

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white dark:bg-gray-900 shadow rounded">
      <Helmet>
        <title>Thank You | Cauverystore</title>
        <meta
          name="description"
          content="Thank you for your purchase. View order summary and delivery details."
        />
        <meta property="og:title" content="Thank You | Cauverystore" />
        <meta
          property="og:description"
          content="Your order has been placed successfully. Continue shopping with Cauverystore."
        />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://cauverystore.in/thank-you" />
        <meta property="og:image" content="https://cauverystore.in/og-thankyou.jpg" />
        <meta name="twitter:title" content="Thank You | Cauverystore" />
        <meta
          name="twitter:description"
          content="Order placed successfully. Check your summary or continue browsing."
        />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:image" content="https://cauverystore.in/og-thankyou.jpg" />
        <script async src="https://www.googletagmanager.com/gtag/js?id=G-3KRHXGB7JV"></script>
        <script>{`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', 'G-3KRHXGB7JV');
        `}</script>
      </Helmet>

      {loading ? (
        <div className="text-center py-12">Loading your order...</div>
      ) : (
        <>
          <h1 className="text-3xl font-bold text-green-600 text-center mb-4">🎉 Thank You!</h1>
          <p className="text-center text-lg text-gray-700 dark:text-gray-300 mb-6">
            Your order has been placed successfully.
          </p>

          <div className="mb-4 space-y-2">
            <div><strong>Order ID:</strong> {order.id}</div>
            <div><strong>Total Amount:</strong> ₹{(order.total || 0).toFixed(2)}</div>
            <div>
              <strong>Delivery Address:</strong>
              <div className="border p-2 rounded bg-gray-50 dark:bg-gray-800 mt-1">
                {order.address || "No address provided"}
              </div>
            </div>
          </div>

          {Array.isArray(order.items) && order.items.length > 0 && (
            <div className="mb-6">
              <h2 className="text-lg font-semibold mb-2">Ordered Items</h2>
              <ul className="space-y-2">
                {order.items.map((item: any, i: number) => (
                  <li
                    key={i}
                    className="flex justify-between border p-2 rounded bg-gray-100 dark:bg-gray-800"
                  >
                    <span>{item.name} × {item.quantity}</span>
                    <span>₹{(item.price * item.quantity).toFixed(2)}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="text-center">
            <Link
              to="/"
              className="inline-block bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700 transition"
            >
              Continue Shopping
            </Link>
          </div>
        </>
      )}
    </div>
  );
}
