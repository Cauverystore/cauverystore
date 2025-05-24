import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

interface Order {
  id: number;
  customer_name: string;
  email: string;
  address: string;
  total_amount: number;
  created_at: string;
  status: string;
  items: any;
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .order("created_at", { ascending: false });

      if (!error && data) setOrders(data);
      setLoading(false);
    };

    fetchOrders();
  }, []);

  const updateStatus = async (id: number, status: string) => {
    const { error } = await supabase
      .from("orders")
      .update({ status })
      .eq("id", id);

    if (!error) {
      setOrders((prev) =>
        prev.map((o) => (o.id === id ? { ...o, status } : o))
      );
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Admin Order Management</h1>

      {loading ? (
        <p>Loading orders...</p>
      ) : orders.length === 0 ? (
        <p>No orders found.</p>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => (
            <div key={order.id} className="border p-4 rounded shadow">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">
                  Order #{order.id} — ₹{order.total_amount}
                </h2>
                <select
                  value={order.status}
                  onChange={(e) => updateStatus(order.id, e.target.value)}
                  className="p-1 border rounded"
                >
                  <option value="pending">Pending</option>
                  <option value="shipped">Shipped</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
              <p className="text-sm text-gray-500">
                Placed on {new Date(order.created_at).toLocaleString()}
              </p>
              <p className="text-sm">
                <strong>{order.customer_name}</strong> — {order.email}
              </p>
              <p className="text-sm">Address: {order.address}</p>

              <div className="mt-4">
                <h3 className="font-semibold mb-1">Items:</h3>
                <ul className="text-sm list-disc list-inside">
                  {JSON.parse(order.items).map((item: any, idx: number) => (
                    <li key={idx}>
                      {item.name} — ₹{item.price} × {item.quantity}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
