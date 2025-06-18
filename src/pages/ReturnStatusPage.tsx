// ReturnStatusPage.tsx - Customer view of return/replace requests
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import toast from 'react-hot-toast';
import { useCartStore } from '@/stores/useCartStore';
import { useNavigate } from 'react-router-dom';

interface ReturnRequest {
  id: string;
  order_id: string;
  type: 'return' | 'replace';
  reason: string;
  status: string;
  created_at: string;
}

export default function ReturnStatusPage() {
  const [requests, setRequests] = useState<ReturnRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const addToCart = useCartStore((state) => state.addToCart);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchReturns = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return toast.error('Login required');

      const { data, error } = await supabase
        .from('order_returns')
        .select('*')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false });

      if (error) {
        toast.error('Failed to fetch return requests');
        return;
      }

      setRequests(data);
      setLoading(false);
    };

    fetchReturns();
  }, []);

  const handleReorder = async (orderId: string) => {
    const { data: items, error } = await supabase
      .from('order_items')
      .select('product_id, name, price, quantity')
      .eq('order_id', orderId);

    if (error || !items) {
      toast.error('Failed to reorder items');
      return;
    }

    items.forEach((item) => {
      addToCart({
        id: item.product_id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
      });
    });

    toast.success('Items added to cart');
    navigate('/cart');
  };

  if (loading) return <div className="p-6">Loading return requests...</div>;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Your Return/Replace Requests</h1>
      {requests.length === 0 ? (
        <p className="text-gray-600">No return or replace requests submitted yet.</p>
      ) : (
        <ul className="space-y-4">
          {requests.map((req) => (
            <li
              key={req.id}
              className="border rounded p-4 shadow-sm bg-white dark:bg-gray-900"
            >
              <div className="mb-1 text-sm text-gray-700 dark:text-gray-300">
                <strong>Order ID:</strong> {req.order_id}
              </div>
              <div className="text-sm">
                <strong>Type:</strong> {req.type}
              </div>
              <div className="text-sm">
                <strong>Status:</strong>{' '}
                <span
                  className={
                    req.status === 'approved'
                      ? 'text-green-600'
                      : req.status === 'rejected'
                      ? 'text-red-600'
                      : 'text-yellow-600'
                  }
                >
                  {req.status}
                </span>
              </div>
              <div className="text-sm">
                <strong>Reason:</strong> {req.reason}
              </div>
              <div className="text-sm">
                <strong>Requested At:</strong>{' '}
                {new Date(req.created_at).toLocaleString()}
              </div>
              <button
                onClick={() => handleReorder(req.order_id)}
                className="mt-3 text-sm text-blue-600 underline hover:text-blue-800"
              >
                🔁 Reorder Items from this Order
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
