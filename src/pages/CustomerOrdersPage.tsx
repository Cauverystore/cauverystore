import { useEffect, useState } from "react";
import { useAuth } from "@/Components/AuthProvider";
import { supabase } from "@/lib/supabaseClient";
import toast from "react-hot-toast";

export default function CustomerOrdersPage() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      if (!user) return;

      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .eq("User_id", user.id)
        .order("created_at", { ascending: false });

      if (error) {
        toast.error("Failed to fetch orders.");
        setLoading(false);
        return;
      }

      setOrders(data || []);
      setLoading(false);
    };

    fetchOrders();
  }, [user]);

  if (loading) return <div className="p-4">Loading orders...</div>;

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">My Orders</h2>

      {orders.length === 0 ? (
        <p className="text-gray-600">You have not placed any orders yet.</p>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div
              key={order.id}
              className="bg-white rounded-xl shadow p-4 text-sm md:text-base"
            >
              <div className="flex flex-col sm:flex-row sm:justify-between gap-2 sm:items-center mb-2">
                <span className="font-medium">Order ID: {order.id}</span>
                <span className={`px-3 py-1 rounded text-white text-xs sm:text-sm
                  ${order.status === "pending" ? "bg-yellow-500" : "bg-green-600"}`}>
                  {order.status}
                </span>
              </div>

              <div className="mb-2">
                <h4 className="font-semibold mb-1">Items:</h4>
                <ul className="list-disc list-inside space-y-1">
                  {order.items.map((item: any, idx: number) => (
                    <li key={idx}>
                      {item.name} × {item.quantity} — ₹{(item.price * item.quantity).toFixed(2)}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mb-2">
                <h4 className="font-semibold mb-1">Delivery Address:</h4>
                <p className="text-gray-700 leading-snug">
                  {order.address?.fullName}, {order.address?.street},<br />
                  {order.address?.city} - {order.address?.pincode}<br />
                  Phone: {order.address?.phone}
                </p>
              </div>

              <div className="text-right font-semibold text-blue-700 mt-2">
                Total: ₹{order.total.toFixed(2)}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
