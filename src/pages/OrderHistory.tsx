import { useEffect, useState } from "react";
import { supabase } from "@/lib/SupabaseClient";
import toast from "react-hot-toast";

interface Order {
  id: string;
  created_at: string;
  total: number;
  items: { id: string; name: string; price: number; quantity: number }[];
}

const OrderHistory = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error("Please login to view orders.");
        return;
      }

      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .eq("user_id", session.user.id)
        .order("created_at", { ascending: false });

      if (error) {
        toast.error("Failed to load orders.");
        console.error(error);
      } else {
        setOrders(data || []);
      }

      setLoading(false);
    };

    fetchOrders();
  }, []);

  if (loading) return <div className="text-center py-10">Loading your orders...</div>;

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6 text-green-700">Your Order History</h1>

      {orders.length === 0 ? (
        <p className="text-gray-600">You have not placed any orders yet.</p>
      ) : (
        orders.map((order) => (
          <div key={order.id} className="mb-6 bg-white p-4 rounded shadow">
            <div className="flex justify-between text-sm text-gray-500 mb-2">
              <span>Order ID: {order.id}</span>
              <span>{new Date(order.created_at).toLocaleString()}</span>
            </div>

            <ul className="mb-2 text-sm">
              {order.items.map((item) => (
                <li key={item.id} className="flex justify-between">
                  <span>
                    {item.name} × {item.quantity}
                  </span>
                  <span>₹{item.price * item.quantity}</span>
                </li>
              ))}
            </ul>

            <div className="text-right font-semibold">Total: ₹{order.total}</div>
          </div>
        ))
      )}
    </div>
  );
};

export default OrderHistory;
