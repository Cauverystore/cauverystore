// ✅ src/pages/MerchantOrder.tsx

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Helmet } from 'react-helmet-async';
import { format } from 'date-fns';

interface Order {
  id: string;
  user_id: string;
  created_at: string;
  status: string;
  total_amount: number;
}

export default function MerchantOrder() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching orders:', error);
    } else {
      setOrders(data || []);
    }
    setLoading(false);
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <Helmet>
        <title>Merchant Orders | Cauverystore</title>
      </Helmet>
      <h1 className="text-2xl font-bold mb-4 text-green-700">Merchant Orders</h1>

      {loading ? (
        <p>Loading orders...</p>
      ) : orders.length === 0 ? (
        <p>No orders found.</p>
      ) : (
        <div className="grid gap-4">
          {orders.map((order) => (
            <div
              key={order.id}
              className="p-4 border rounded bg-white dark:bg-gray-800 shadow-sm"
            >
              <p className="text-sm text-gray-600">
                <strong>Order ID:</strong> {order.id}
              </p>
              <p className="text-sm text-gray-600">
                <strong>User ID:</strong> {order.user_id}
              </p>
              <p className="text-sm text-gray-600">
                <strong>Total:</strong> ₹{order.total_amount}
              </p>
              <p className="text-sm text-gray-600">
                <strong>Status:</strong> {order.status}
              </p>
              <p className="text-sm text-gray-600">
                <strong>Placed At:</strong>{' '}
                {format(new Date(order.created_at), 'PPpp')}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
