// --- AdminOrderTrackingPage.tsx ---

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Helmet } from "react-helmet-async";

interface Order {
  id: number;
  product_name?: string;
  tracking_id?: string;
  courier_service?: string;
  estimated_delivery_date?: string;
  tracking_status?: string;
}

export default function AdminOrderTrackingPage() {
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    const { data, error } = await supabase.from("orders").select("*");
    if (!error && data) setOrders(data);
  };

  const updateTracking = async (id: number, field: string, value: string) => {
    const { error } = await supabase.from("orders").update({ [field]: value }).eq("id", id);
    if (!error) fetchOrders();
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <Helmet>
        <title>Track Orders | Admin | Cauverystore</title>
        <meta
          name="description"
          content="Admin tracking and delivery updates for Cauverystore orders."
        />
      </Helmet>
      <h1 className="text-2xl font-bold mb-6">Admin Order Tracking</h1>
      {orders.map((order) => (
        <div key={order.id} className="border p-4 mb-4 bg-white rounded-lg">
          <p className="font-semibold">Order ID: {order.id}</p>
          {order.product_name && (
            <p className="text-sm text-gray-600 mb-1">Product: {order.product_name}</p>
          )}
          <input
            className="border px-2 py-1 w-full my-1"
            defaultValue={order.tracking_id || ""}
            onBlur={(e) => updateTracking(order.id, "tracking_id", e.target.value)}
            placeholder="Tracking ID"
          />
          <input
            className="border px-2 py-1 w-full my-1"
            defaultValue={order.courier_service || ""}
            onBlur={(e) => updateTracking(order.id, "courier_service", e.target.value)}
            placeholder="Courier Service"
          />
          <input
            className="border px-2 py-1 w-full my-1"
            defaultValue={order.estimated_delivery_date || ""}
            onBlur={(e) => updateTracking(order.id, "estimated_delivery_date", e.target.value)}
            placeholder="Estimated Delivery Date"
          />
          <select
            className="border px-2 py-1 w-full my-1"
            value={order.tracking_status || "pending"}
            onChange={(e) => updateTracking(order.id, "tracking_status", e.target.value)}
          >
            <option value="pending">Pending</option>
            <option value="shipped">Shipped</option>
            <option value="out_for_delivery">Out for Delivery</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      ))}
    </div>
  );
}
