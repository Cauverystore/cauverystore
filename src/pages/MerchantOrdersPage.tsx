import { useEffect, useState } from "react";
import { supabase } from "@/lib/SupabaseClient";
import toast from "react-hot-toast";

interface Order {
  id: string;
  created_at: string;
  user_id: string;
  items: {
    id: string;
    name: string;
    merchant_id: string;
    price: number;
    quantity: number;
  }[];
}

const MerchantOrdersPage = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [merchantId, setMerchantId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error("Please login to view orders.");
        return;
      }

      setMerchantId(session.user.id);

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

  const getMerchantItems = (items: Order["items"]) =>
    items.filter((item) => item.merchant_id === merchantId);

  if (loading) return <div className="text-center py-10">Loading merchant orders...</div>;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6 text-green-700">Merchant Order View</h1>

      {orders.filter((order) => getMerchantItems(order.items).length > 0).length === 0 ? (
        <p className="text-gray-600">No orders for your products yet.</p>
      ) : (
        orders.map((order) => {
          const merchantItems = getMerchantItems(order.items);
          if (merchantItems.length === 0) return null;

          return (
            <div key={order.id} className="mb-6 bg-white rounded shadow p-4">
              <div className="flex justify-between text-sm text-gray-500 mb-2">
                <span>Order ID: {order.id}</span>
                <span>{new Date(order.created_at).toLocaleString()}</span>
              </div>

              <ul className="text-sm">
                {merchantItems.map((item) => (
                  <li key={item.id} className="flex justify-between border-b py-1">
                    <span>
                      {item.name} × {item.quantity}
                    </span>
                    <span>₹{item.price * item.quantity}</span>
                  </li>
                ))}
              </ul>
            </div>
          );
        })
      )}
    </div>
  );
};

export default MerchantOrdersPage;
