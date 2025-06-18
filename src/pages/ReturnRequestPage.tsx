// src/pages/ReturnRequestPage.tsx
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

export default function ReturnRequestPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [selectedOrderId, setSelectedOrderId] = useState("");
  const [reason, setReason] = useState("");
  const [type, setType] = useState("return");
  const [userId, setUserId] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    getUser();
  }, []);

  const getUser = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return navigate("/login");
    setUserId(user.id);
    fetchOrders(user.id);
  };

  const fetchOrders = async (uid: string) => {
    const { data, error } = await supabase
      .from("orders")
      .select("id, status, created_at")
      .eq("user_id", uid)
      .eq("status", "delivered")
      .order("created_at", { ascending: false });

    if (!error && data) {
      setOrders(data);
    }
  };

  const submitRequest = async () => {
    if (!selectedOrderId || !reason.trim()) {
      toast.error("Select order and enter reason");
      return;
    }

    const { error } = await supabase.from("return_requests").insert({
      user_id: userId,
      order_id: selectedOrderId,
      reason,
      type,
    });

    if (!error) {
      toast.success("Request submitted");
      setReason("");
      setSelectedOrderId("");
    } else {
      toast.error("Submission failed");
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6 min-h-screen">
      <h1 className="text-2xl font-bold text-green-700 mb-6">Return or Replace Product</h1>

      <div className="space-y-4 bg-white dark:bg-gray-900 p-6 rounded-lg shadow">
        <div>
          <label className="block font-semibold mb-1">Select Delivered Order</label>
          <select
            value={selectedOrderId}
            onChange={(e) => setSelectedOrderId(e.target.value)}
            className="w-full border px-3 py-2 rounded"
          >
            <option value="">Select Order</option>
            {orders.map((order) => (
              <option key={order.id} value={order.id}>
                #{order.id} - {new Date(order.created_at).toLocaleDateString()}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block font-semibold mb-1">Request Type</label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="w-full border px-3 py-2 rounded"
          >
            <option value="return">Return</option>
            <option value="replace">Replace</option>
          </select>
        </div>

        <div>
          <label className="block font-semibold mb-1">Reason</label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={4}
            placeholder="Explain why you want to return or replace..."
            className="w-full border px-4 py-2 rounded"
          ></textarea>
        </div>

        <button
          onClick={submitRequest}
          className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700"
        >
          Submit Request
        </button>
      </div>
    </div>
  );
}
