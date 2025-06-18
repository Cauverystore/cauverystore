import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

export default function ThankYouPage() {
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchLastPaidOrder = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error('Please log in to view your order.');
        navigate('/login');
        return;
      }

      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('User_id', session.user.id)
        .eq('status', 'paid')
        .order('paid_at', { ascending: false })
        .limit(1)
        .single();

      if (error || !data) {
        toast.error('No recent paid order found.');
        navigate('/');
        return;
      }

      setOrder(data);
      setLoading(false);
    };

    fetchLastPaidOrder();
  }, [navigate]);

  if (loading) return <div className="p-6 text-center">Loading your order...</div>;

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white dark:bg-gray-900 shadow rounded">
      <h1 className="text-3xl font-bold text-green-600 text-center mb-4">🎉 Thank You!</h1>
      <p className="text-center text-lg text-gray-700 dark:text-gray-300 mb-6">
        Your order has been placed successfully.
      </p>

      <div className="mb-4 space-y-2">
        <div><strong>Order ID:</strong> {order.id}</div>
        <div><strong>Total Amount:</strong> ₹{order.total?.toFixed(2)}</div>
        <div>
          <strong>Delivery Address:</strong>
          <div className="border p-2 rounded bg-gray-50 dark:bg-gray-800 mt-1">
            {order.address || 'No address provided'}
          </div>
        </div>
      </div>

      {Array.isArray(order.items) && order.items.length > 0 && (
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-2">Ordered Items</h2>
          <ul className="space-y-2">
            {order.items.map((item: any, i: number) => (
              <li
                key={i}
                className="flex justify-between border p-2 rounded bg-gray-100 dark:bg-gray-800"
              >
                <span>{item.name} × {item.quantity}</span>
                <span>₹{(item.price * item.quantity).toFixed(2)}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="text-center">
        <Link
          to="/"
          className="inline-block bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700 transition"
        >
          Continue Shopping
        </Link>
      </div>
    </div>
  );
}
