import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import toast from 'react-hot-toast';
import { Helmet } from 'react-helmet-async';

interface Order {
  id: string;
  user_email: string;
  status: string;
  tracking_info: string;
  created_at: string;
}

export default function AdminOrderTrackingPage() {
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

    if (error) toast.error('Failed to fetch orders');
    else setOrders(data || []);
    setLoading(false);
  };

  const updateTracking = async (id: string, info: string) => {
    const { error } = await supabase
      .from('orders')
      .update({ tracking_info: info })
      .eq('id', id);

    if (!error) {
      toast.success('Tracking updated');
      fetchOrders();
    } else {
      toast.error('Update failed');
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <Helmet>
        <title>Admin Order Tracking</title>
      </Helmet>
      <h1 className="text-2xl font-bold mb-4 text-green-700">Order Tracking</h1>

      {loading ? (
        <p>Loading orders...</p>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div
              key={order.id}
              className="p-4 border rounded bg-white dark:bg-gray-800 flex justify-between items-center"
            >
              <div>
                <p className="text-sm font-semibold text-green-700">Order ID: {order.id}</p>
                <p className="text-sm text-gray-600">User: {order.user_email}</p>
                <p className="text-sm text-gray-600">Status: {order.status}</p>
                <p className="text-xs text-gray-400">
                  Placed: {new Date(order.created_at).toLocaleString()}
                </p>
                <p className="text-sm text-gray-700 mt-2">
                  Tracking Info:{" "}
                  <span className="font-mono text-blue-700">{order.tracking_info || 'N/A'}</span>
                </p>
              </div>
              <div className="flex flex-col gap-1">
                <input
                  type="text"
                  placeholder="Update tracking info"
                  defaultValue={order.tracking_info || ''}
                  onBlur={(e) => updateTracking(order.id, e.target.value)}
                  className="border px-3 py-1 rounded text-sm"
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
