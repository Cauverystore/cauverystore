import { useEffect, useState } from "react";
import { supabase } from "@/lib/SupabaseClient";
import toast from "react-hot-toast";

interface Order {
  id: string;
  created_at: string;
  user_id: string;
  total: number;
  items: { name: string; quantity: number; price: number }[];
}

const AdminOrdersPage = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      const { data, error } = await supabase
        .from("orders")
        .select("*")
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

  if (loading) return <div className="text-center py-10">Loading all orders...</div>;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6 text-green-700">Admin Orders Overview</h1>

      {orders.length === 0 ? (
        <p className="text-gray-600">No orders found in the system.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full bg-white shadow rounded text-sm">
            <thead>
              <tr className="bg-gray-100 text-left text-gray-600">
                <th className="p-3">Order ID</th>
                <th className="p-3">User ID</th>
                <th className="p-3">Items</th>
                <th className="p-3">Total</th>
                <th className="p-3">Date</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id} className="border-t">
                  <td className="p-3 font-mono">{order.id}</td>
                  <td className="p-3 text-blue-600">{order.user_id}</td>
                  <td className="p-3">
                    <ul className="list-disc ml-4">
                      {order.items.map((item, index) => (
                        <li key={index}>
                          {item.name} × {item.quantity} – ₹{item.price * item.quantity}
                        </li>
                      ))}
                    </ul>
                  </td>
                  <td className="p-3 font-semibold">₹{order.total}</td>
                  <td className="p-3">{new Date(order.created_at).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminOrdersPage;
