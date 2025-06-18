// src/pages/TrackOrderPage.tsx
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

export default function TrackOrderPage() {
  const [userId, setUserId] = useState<string | null>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
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

    if (error) toast.error("Failed to fetch orders");
    else setOrders(data || []);
  };

  const handleSelectOrder = (order: any) => {
    setSelectedOrder(order);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 min-h-screen">
      <h1 className="text-2xl font-bold text-green-700 mb-6">Track Your Order</h1>

      {orders.length === 0 ? (
        <p className="text-gray-500">You haven't placed any orders yet.</p>
      ) : (
        <>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Select an order:</label>
            <select
              onChange={(e) =>
                handleSelectOrder(orders.find((o) => o.id === e.target.value))
              }
              className="border px-3 py-2 rounded w-full"
            >
              <option value="">-- Select Order --</option>
              {orders.map((order) => (
                <option key={order.id} value={order.id}>
                  Order #{order.id} - {new Date(order.created_at).toLocaleDateString()}
                </option>
              ))}
            </select>
          </div>

          {selectedOrder && (
            <div className="border rounded p-4 bg-white dark:bg-gray-900">
              <h2 className="text-lg font-semibold text-green-700 mb-2">
                Order #{selectedOrder.id}
              </h2>
              <p>
                <span className="font-medium">Status:</span>{" "}
                <span className="text-blue-600">{selectedOrder.status}</span>
              </p>
              <p>
                <span className="font-medium">Expected Delivery:</span>{" "}
                {selectedOrder.expected_delivery
                  ? new Date(selectedOrder.expected_delivery).toLocaleDateString()
                  : "Not available"}
              </p>
              <p>
                <span className="font-medium">Shipping Address:</span>{" "}
                {selectedOrder.shipping_address}
              </p>
              {selectedOrder.tracking_info && (
                <p>
                  <span className="font-medium">Tracking Info:</span>{" "}
                  {selectedOrder.tracking_info}
                </p>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
