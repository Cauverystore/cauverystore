import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import CheckoutButton from '@/components/CheckoutButton';

export default function Checkout() {
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchOrder = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error('Please login to continue');
        navigate('/login');
        return;
      }

      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('User_id', session.user.id)
        .eq('status', 'pending')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error || !data) {
        toast.error('No pending order found.');
        navigate('/');
        return;
      }

      setOrder(data);
      setLoading(false);
    };

    fetchOrder();
  }, [navigate]);

  if (loading) return <div className="p-6 text-center">Loading checkout...</div>;

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white dark:bg-gray-900 shadow rounded">
      <h1 className="text-2xl font-bold mb-4">Checkout</h1>

      <div className="space-y-2 mb-4">
        <div><strong>Order ID:</strong> {order.id}</div>
        <div><strong>Total Amount:</strong> ₹{order.total?.toFixed(2)}</div>
        <div>
          <strong>Delivery Address:</strong>
          <div className="border p-2 rounded bg-gray-100 dark:bg-gray-800 mt-1">
            {order.address || 'No address provided'}
          </div>
        </div>
      </div>

      {Array.isArray(order.items) && order.items.length > 0 && (
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-2">Items in Your Order</h2>
          <ul className="space-y-2">
            {order.items.map((item: any, i: number) => (
              <li
                key={i}
                className="flex justify-between border p-2 rounded bg-gray-50 dark:bg-gray-800"
              >
                <span>{item.name} × {item.quantity}</span>
                <span>₹{(item.price * item.quantity).toFixed(2)}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="mt-6 text-center">
        <CheckoutButton amount={order.total} orderId={order.id} />
      </div>
    </div>
  );
}
