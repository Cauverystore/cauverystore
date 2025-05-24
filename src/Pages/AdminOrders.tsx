import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

type Order = {
  id: string;
  customer_name: string;
  email: string;
  total_amount: number;
  created_at: string;
  items: any[];
};

export default function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Failed to fetch orders:", error.message);
      } else {
        const formatted = data.map((order) => ({
          ...order,
          items: typeof order.items === "string" ? JSON.parse(order.items) : order.items,
        }));
        setOrders(formatted);
      }

      setLoading(false);
    };

    fetchOrders();
  }, []);

  if (loading) return <div className="p-6 text-center">Loading orders...</div>;

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h2 className="text-3xl font-bold mb-6">Admin Orders</h2>
      <div className="space-y-6">
        {orders.map((order) => (
          <div
            key={order.id}
            className="border border-gray-300 rounded-lg p-4 shadow-sm"
          >
            <div className="flex justify-between">
              <div>
                <h3 className="font-semibold text-lg">
                  {order.customer_name} ({order.email})
                </h3>
                <p className="text-sm text-gray-600">
                  Placed on: {new Date(order.created_at).toLocaleString()}
                </p>
              </div>
              <div className="text-right font-semibold text-green-700">
                ₹{order.total_amount.toFixed(2)}
              </div>
            </div>
            <ul className="mt-4 space-y-2 text-sm text-gray-700">
              {order.items.map((item: any, idx: number) => (
                <li key={idx}>
                  • {item.name} (x{item.quantity}) – ₹{item.price * item.quantity}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
