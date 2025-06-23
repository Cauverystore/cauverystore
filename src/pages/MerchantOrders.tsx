// src/pages/MerchantOrders.tsx
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import toast from 'react-hot-toast';

import Spinner from '@/components/ui/Spinner';
import PageHeader from '@/components/ui/PageHeader';
import EmptyState from '@/components/ui/EmptyState';
import Button from '@/components/ui/Button';

interface Order {
  id: string;
  user_id: string;
  items: any[];
  status: string;
  created_at: string;
  total_price: number;
  shipping_address: string;
  payment_method: string;
}

export default function MerchantOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchMerchantOrders();
  }, []);

  const fetchMerchantOrders = async () => {
    setLoading(true);

    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session?.user) {
      toast.error('Please login to continue');
      navigate('/login');
      return;
    }

    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .contains('items', [{ merchant_id: session.user.id }])
      .order('created_at', { ascending: false });

    if (error) {
      toast.error('Failed to fetch merchant orders.');
    } else {
      setOrders(data || []);
    }

    setLoading(false);
  };

  const advanceOrderStatus = async (order: Order) => {
    const nextStatus =
      order.status === 'pending'
        ? 'shipped'
        : order.status === 'shipped'
        ? 'delivered'
        : null;

    if (!nextStatus) {
      toast('This order is already delivered.');
      return;
    }

    const { error } = await supabase
      .from('orders')
      .update({ status: nextStatus })
      .eq('id', order.id);

    if (error) {
      toast.error('Failed to update order status.');
    } else {
      toast.success(`Order marked as ${nextStatus}`);
      fetchMerchantOrders();
    }
  };

  if (loading) {
    return (
      <div className="p-6 text-center">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-6">
      <Helmet>
        <title>Merchant Orders | Cauvery Store</title>
        <meta name="description" content="Manage and fulfill orders for your Cauvery Store listings." />
      </Helmet>

      <PageHeader title="Merchant Orders" subtitle="Manage and fulfill incoming orders" />

      {orders.length === 0 ? (
        <EmptyState
          title="No Orders Yet"
          description="You'll see customer orders here once they purchase your products."
          actionLabel="Go to Dashboard"
          onAction={() => navigate('/merchant/dashboard')}
        />
      ) : (
        <ul className="space-y-6">
          {orders.map((order) => (
            <li key={order.id} className="border rounded p-4 shadow-sm">
              <div className="text-sm space-y-1">
                <p><strong>Order ID:</strong> {order.id}</p>
                <p><strong>Status:</strong> {order.status}</p>
                <p><strong>Total:</strong> ₹{order.total_price}</p>
                <p><strong>Payment:</strong> {order.payment_method}</p>
                <p><strong>Shipping Address:</strong> {order.shipping_address}</p>
                <p><strong>Ordered On:</strong> {new Date(order.created_at).toLocaleString()}</p>
              </div>

              <div className="mt-4">
                <h4 className="font-semibold mb-2">Items (Your Products):</h4>
                {order.items
                  .filter((item: any) => item.merchant_id === supabase.auth.getUser().data?.user?.id)
                  .map((item: any, idx: number) => (
                    <div key={idx} className="flex justify-between text-sm mb-1">
                      <span>{item.name} × {item.quantity}</span>
                      <span>₹{item.price * item.quantity}</span>
                    </div>
                  ))}
              </div>

              <div className="mt-4 flex gap-3">
                {order.status !== 'delivered' && (
                  <Button onClick={() => advanceOrderStatus(order)} className="bg-green-600 text-white">
                    Mark as {order.status === 'pending' ? 'Shipped' : 'Delivered'}
                  </Button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
