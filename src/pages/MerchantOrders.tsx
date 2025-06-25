import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { supabase } from '@/lib/supabaseClient';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import ErrorAlert from '@/components/ui/ErrorAlert';
import Button from '@/components/ui/Button';
import toast from 'react-hot-toast';

interface Order {
  id: string;
  product_id: string;
  user_id: string;
  quantity: number;
  total_price: number;
  status: string;
  tracking_id?: string;
  created_at: string;
  user?: { email: string };
  product?: { name: string; merchant_id?: string };
}

export default function MerchantOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [trackingUpdates, setTrackingUpdates] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    setError('');

    try {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user) throw new Error('Unable to get current user');

      const { data, error } = await supabase
        .from('orders')
        .select('*, user:user_id(email), product:product_id(name, merchant_id)')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const merchantOrders = data.filter(
        (order) => order.product?.merchant_id === user.id
      );

      setOrders(merchantOrders);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (orderId: string, newStatus: string) => {
    const tracking_id = trackingUpdates[orderId]?.trim();

    if (newStatus === 'shipped' && !tracking_id) {
      toast.error('Please enter a tracking ID');
      return;
    }

    const { error } = await supabase
      .from('orders')
      .update({ status: newStatus, tracking_id })
      .eq('id', orderId);

    if (error) {
      toast.error('Failed to update order');
    } else {
      toast.success('Order updated');
      fetchOrders();
    }
  };

  const statusOptions = ['pending', 'confirmed', 'shipped', 'delivered'];

  return (
    <div className="p-6">
      <Helmet>
        <title>Merchant Orders | Cauverystore</title>
        <meta
          name="description"
          content="View and manage all orders placed for your products on Cauverystore."
        />
        <meta property="og:title" content="Merchant Orders | Cauverystore" />
        <meta
          property="og:description"
          content="Track, update, and fulfill your customer orders on Cauverystore."
        />
        <meta property="og:type" content="website" />
        <meta property="twitter:card" content="summary" />
        <meta property="twitter:title" content="Merchant Orders | Cauverystore" />
        <meta
          property="twitter:description"
          content="Easily manage all orders for your shop on Cauverystore."
        />
      </Helmet>

      <h1 className="text-2xl font-bold text-green-700 mb-4">Your Orders</h1>

      {loading ? (
        <div className="flex justify-center py-10">
          <LoadingSpinner size="lg" />
        </div>
      ) : error ? (
        <ErrorAlert message={error} />
      ) : orders.length === 0 ? (
        <p className="text-gray-600 text-sm">No orders found for your products.</p>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => (
            <div
              key={order.id}
              className="border p-4 rounded shadow bg-white dark:bg-gray-800"
            >
              <div className="mb-2">
                <span className="font-semibold">Product:</span>{' '}
                {order.product?.name || 'Unknown'}
              </div>
              <div className="mb-2">
                <span className="font-semibold">Customer:</span>{' '}
                {order.user?.email || 'N/A'}
              </div>
              <div className="mb-2">
                <span className="font-semibold">Quantity:</span> {order.quantity}
              </div>
              <div className="mb-2">
                <span className="font-semibold">Total:</span> ₹{order.total_price}
              </div>
              <div className="mb-2">
                <span className="font-semibold">Placed On:</span>{' '}
                {new Date(order.created_at).toLocaleString()}
              </div>
              <div className="mb-2">
                <span className="font-semibold">Current Status:</span>{' '}
                <span className="capitalize">{order.status}</span>
              </div>

              <div className="mb-4">
                <label className="block mb-1 font-semibold">Tracking ID:</label>
                <input
                  type="text"
                  value={trackingUpdates[order.id] ?? order.tracking_id ?? ''}
                  onChange={(e) =>
                    setTrackingUpdates((prev) => ({
                      ...prev,
                      [order.id]: e.target.value,
                    }))
                  }
                  className="w-full border p-2 rounded"
                  placeholder="Enter tracking ID (required for shipping)"
                />
              </div>

              <div className="flex flex-wrap gap-2">
                {statusOptions.map((status) => (
                  <Button
                    key={status}
                    variant={order.status === status ? 'default' : 'outline'}
                    onClick={() => handleStatusUpdate(order.id, status)}
                  >
                    Mark as {status}
                  </Button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
