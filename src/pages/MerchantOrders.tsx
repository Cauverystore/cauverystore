import { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { supabase } from "@/lib/supabaseClient";

import { Button } from "@/components/ui/button"; // ✅ Corrected import
import Spinner from "@/components/ui/Spinner";
import ErrorAlert from "@/components/ui/ErrorAlert";
import EmptyState from "@/components/ui/EmptyState";
import { formatPrice } from "@/utils/formatPrice";

interface OrderItem {
  product_id: string;
  quantity: number;
  price: number;
}

interface Order {
  id: string;
  created_at: string;
  items: OrderItem[];
  user_id: string;
}

export default function MerchantOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchMerchantOrders();
  }, []);

  const fetchMerchantOrders = async () => {
    setLoading(true);
    setError("");

    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        setError("You must be logged in to view orders.");
        return;
      }

      const { data, error: orderError } = await supabase
        .from("orders")
        .select("*")
        .contains("items", [{ product_id: "" }]) // Workaround for Supabase array filtering
        .order("created_at", { ascending: false });

      if (orderError) throw orderError;

      // Optional: Filter to only include orders with products owned by this merchant
      const { data: merchantProducts } = await supabase
        .from("products")
        .select("id")
        .eq("merchant_id", user.id);

      const productIds = (merchantProducts || []).map((p) => p.id);

      const filteredOrders = (data || []).filter((order: Order) =>
        order.items.some((item) => productIds.includes(item.product_id))
      );

      setOrders(filteredOrders);
    } catch (err: any) {
      console.error("Merchant order fetch error:", err);
      setError("Failed to load orders.");
    } finally {
      setLoading(false);
    }
  };

  const totalAmount = (items: OrderItem[]) =>
    items.reduce((sum, item) => sum + item.quantity * item.price, 0);

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <Helmet>
        <title>Merchant Orders | Cauverystore</title>
        <meta name="description" content="View all customer orders for your products." />
        <meta property="og:title" content="Merchant Orders | Cauverystore" />
        <meta property="og:description" content="Track and manage orders placed by customers." />
        <meta name="twitter:title" content="Merchant Orders | Cauverystore" />
        <meta name="twitter:description" content="Track and manage orders placed by customers." />
      </Helmet>

      <h1 className="text-3xl font-bold text-green-700 mb-6">Merchant Orders</h1>

      {loading ? (
        <div className="py-12 flex justify-center">
          <Spinner size="lg" />
        </div>
      ) : error ? (
        <ErrorAlert message={error} />
      ) : orders.length === 0 ? (
        <EmptyState message="No orders found for your products yet." />
      ) : (
        <div className="space-y-6">
          {orders.map((order) => (
            <div key={order.id} className="border rounded-lg p-4 shadow-sm">
              <div className="flex justify-between items-center mb-2">
                <p className="text-sm text-gray-500">
                  Order ID: <span className="font-medium">{order.id}</span>
                </p>
                <p className="text-sm text-gray-500">
                  {new Date(order.created_at).toLocaleString()}
                </p>
              </div>

              <ul className="space-y-2 mb-3">
                {order.items.map((item, index) => (
                  <li key={index} className="text-sm text-gray-700">
                    {item.quantity} × Product #{item.product_id} @ ₹{item.price}
                  </li>
                ))}
              </ul>

              <div className="flex justify-between items-center">
                <p className="font-semibold text-green-700">
                  Total: {formatPrice(totalAmount(order.items))}
                </p>
                <Button variant="outline" onClick={() => window.print()}>
                  Print
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
