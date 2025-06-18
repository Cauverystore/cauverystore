// src/pages/CancelOrderPage.tsx
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

export default function CancelOrderPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    getUserAndOrders();
  }, []);

  const getUserAndOrders = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return navigate("/login");

    setUserId(user.id);
    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      toast.error("Failed to fetch orders");
    } else {
      setOrders(data || []);
    }
    setLoading(false);
  };

  const handleCancel = async (orderId: string) => {
    const confirm = window.confirm("Are you sure you want to cancel this order?");
    if (!confirm) return;

    const { error } = await supabase
      .from("orders")
      .update({ status: "cancelled" })
      .eq("id", orderId);

    if (!error) {
      toast.success("Order cancelled");
      setOrders((prev) =>
        prev.map((o) =>
          o.id === orderId ? { ...o, status: "cancelled" } : o
        )
      );
    } else toast.error("Failed to cancel order");
  };

  return (
    <div className="max-w-5xl mx-auto p-6 min-h-screen">
      <h1 className="text-2xl font-bold text-red-700 mb-6">Cancel an Order</h1>

      {loading ? (
        <p>Loading orders...</p>
      ) : orders.length === 0 ? (
        <p className="text-gray-500">You have no orders.</p>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div
              key={order.id}
              className="border p-4 rounded shadow bg-white dark:bg-gray-900"
            >
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-lg font-semibold text-green-700">
                    Order #{order.id}
                  </p>
                  <p className="text-sm text-gray-600">
                    Status:{" "}
                    <span
                      className={`font-bold ${
                        order.status === "cancelled"
                          ? "text-red-600"
                          : "text-blue-600"
                      }`}
                    >
                      {order.status}
                    </span>
                  </p>
                </div>
                {order.status === "placed" && (
                  <button
                    onClick={() => handleCancel(order.id)}
                    className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
                  >
                    Cancel Order
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
