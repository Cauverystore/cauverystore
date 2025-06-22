// src/pages/OrderHistory.tsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabaseClient";
import toast from "react-hot-toast";

interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

interface Order {
  id: string;
  created_at: string;
  total: number;
  items: OrderItem[];
}

export default function OrderHistory() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchOrders = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        toast.error("Please login to view your order history.");
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("orders")
        .select("id, created_at, total, items(order_items(*))")
        .eq("user_id", session.user.id)
        .order("created_at", { ascending: false });

      if (error) {
        toast.error("Failed to load orders.");
        console.error(error);
      } else if (data) {
        // Flatten nested items
        const cleanData: Order[] = (data as any[]).map((o) => ({
          id: o.id,
          created_at: o.created_at,
          total: o.total,
          items: o.items.order_items.map((it: any) => ({
            id: it.id,
            name: it.name,
            price: it.price,
            quantity: it.quantity,
          })),
        }));
        setOrders(cleanData);
      }

      setLoading(false);
    };

    fetchOrders();
  }, []);

  if (loading)
    return <div className="text-center py-10">Loading your orders...</div>;

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6 text-green-700">
        Your Order History
      </h1>

      {orders.length === 0 ? (
        <p className="text-gray-600">No past orders found.</p>
      ) : (
        orders.map((order) => (
          <div
            key={order.id}
            className="mb-6 bg-white dark:bg-gray-800 p-4 rounded shadow"
          >
            <div className="flex justify-between text-sm text-gray-500 mb-2">
              <span>Order ID: {order.id}</span>
              <span>{new Date(order.created_at).toLocaleString()}</span>
            </div>

            <ul className="mb-2 text-sm">
              {order.items.map((item) => (
                <li
                  key={item.id}
                  className="flex justify-between border-b py-1"
                >
                  <span>
                    {item.name} × {item.quantity}
                  </span>
                  <span>₹{item.price * item.quantity}</span>
                </li>
              ))}
            </ul>

            <div className="flex justify-between items-center">
              <div className="font-semibold">Total: ₹{order.total}</div>
              <button
                onClick={() => navigate(`/invoice/${order.id}`)}
                className="text-blue-600 hover:underline text-sm"
              >
                View Invoice
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
