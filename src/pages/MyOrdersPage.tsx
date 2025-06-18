// MyOrdersPage.tsx - Full Order System + Review + Support Integration
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import InvoiceGenerator from '@/components/InvoiceGenerator';
import { useCartStore } from '@/stores/useCartStore';

export default function MyOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showReturnForm, setShowReturnForm] = useState<string | null>(null);
  const [returnType, setReturnType] = useState<'return' | 'replace'>('return');
  const [reason, setReason] = useState('');
  const [reviewingProductId, setReviewingProductId] = useState<string | null>(null);
  const [reviewText, setReviewText] = useState('');
  const [reviewRating, setReviewRating] = useState(5);
  const navigate = useNavigate();
  const addToCart = useCartStore((state) => state.addToCart);

  useEffect(() => {
    const fetchOrders = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error('Please log in to view your orders.');
        navigate('/login');
        return;
      }

      const { data, error } = await supabase
        .from('orders')
        .select('*, order_items(*)')
        .eq('User_id', session.user.id)
        .order('created_at', { ascending: false });

      if (error) {
        toast.error('Failed to fetch your orders.');
        return;
      }

      setOrders(data);
      setLoading(false);
    };

    fetchOrders();
  }, [navigate]);

  const submitReview = async (productId: string) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return toast.error('Login required');

    const { error } = await supabase.from('product_reviews').insert({
      product_id: productId,
      user_id: session.user.id,
      rating: reviewRating,
      comment: reviewText,
    });

    if (error) {
      toast.error('Failed to submit review');
    } else {
      toast.success('Review submitted!');
      setReviewText('');
      setReviewRating(5);
      setReviewingProductId(null);
    }
  };

  const handleCancelOrder = async (orderId: string) => {
    const confirm = window.confirm('Are you sure you want to cancel this order?');
    if (!confirm) return;

    const { error } = await supabase
      .from('orders')
      .update({ status: 'cancelled' })
      .eq('id', orderId);

    if (error) {
      toast.error('Failed to cancel order.');
    } else {
      toast.success('Order cancelled successfully.');
      setOrders((prev) =>
        prev.map((order) =>
          order.id === orderId ? { ...order, status: 'cancelled' } : order
        )
      );
    }
  };

  const submitReturnRequest = async (orderId: string) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return toast.error('User not authenticated');

    const { error } = await supabase.from('order_returns').insert({
      order_id: orderId,
      user_id: session.user.id,
      type: returnType,
      reason,
    });

    if (error) {
      toast.error('Failed to submit request');
    } else {
      toast.success('Return/Replace request submitted');
      setShowReturnForm(null);
      setReason('');
    }
  };

  const contactSupport = (orderId: string) => {
    toast.success('Redirecting to support contact form...');
    navigate(`/support?order_id=${orderId}`);
  };

  if (loading) return <div className="p-6 text-center">Loading your orders...</div>;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">My Orders</h1>
      {orders.length === 0 ? (
        <p className="text-gray-600">No orders placed yet.</p>
      ) : (
        <ul className="space-y-6">
          {orders.map((order) => (
            <li key={order.id} className="border rounded p-4 shadow-sm">
              <div className="mb-2">
                <strong>Order ID:</strong> {order.id} <br />
                <strong>Status:</strong> {order.status} <br />
                <strong>Total:</strong> ₹{order.total} <br />
                <strong>Date:</strong> {new Date(order.created_at).toLocaleString()}
              </div>
              <InvoiceGenerator order={order} />
              <div className="mt-4">
                <h4 className="font-semibold">Items:</h4>
                {order.order_items?.map((item: any, idx: number) => (
                  <div key={idx} className="flex justify-between items-center mb-2">
                    <span>{item.name} × {item.quantity}</span>
                    <span>₹{item.price * item.quantity}</span>
                    {order.status === 'delivered' && (
                      <button
                        className="text-sm text-purple-600 underline ml-2"
                        onClick={() => setReviewingProductId(item.product_id)}
                      >
                        ✍️ Review
                      </button>
                    )}
                  </div>
                ))}
              </div>
              {reviewingProductId && (
                <div className="mt-4 border rounded p-4 bg-gray-50">
                  <h4 className="font-semibold mb-2">Leave a Review</h4>
                  <textarea
                    className="w-full border p-2 rounded mb-2"
                    placeholder="Your thoughts..."
                    value={reviewText}
                    onChange={(e) => setReviewText(e.target.value)}
                  />
                  <select
                    className="w-full border p-2 rounded mb-2"
                    value={reviewRating}
                    onChange={(e) => setReviewRating(Number(e.target.value))}
                  >
                    {[5, 4, 3, 2, 1].map((r) => (
                      <option key={r} value={r}>{r} Star{r > 1 && 's'}</option>
                    ))}
                  </select>
                  <div className="flex gap-2">
                    <button
                      onClick={() => submitReview(reviewingProductId)}
                      className="bg-purple-600 text-white px-4 py-1 rounded"
                    >
                      Submit
                    </button>
                    <button
                      onClick={() => setReviewingProductId(null)}
                      className="text-gray-600"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
              <div className="mt-4 flex gap-3 flex-wrap">
                <button
                  onClick={() => addToCart({ id: order.id, name: 'Reorder', price: order.total, quantity: 1 })}
                  className="bg-green-600 text-white px-4 py-2 rounded"
                >
                  Reorder
                </button>
                <button
                  onClick={() => contactSupport(order.id)}
                  className="bg-blue-600 text-white px-4 py-2 rounded"
                >
                  Contact Support
                </button>
                {order.status === 'pending' && (
                  <button
                    onClick={() => handleCancelOrder(order.id)}
                    className="bg-red-600 text-white px-4 py-2 rounded"
                  >
                    Cancel Order
                  </button>
                )}
                {order.status === 'delivered' && (
                  <button
                    onClick={() => setShowReturnForm(order.id)}
                    className="bg-yellow-600 text-white px-4 py-2 rounded"
                  >
                    Request Return/Replace
                  </button>
                )}
              </div>
              {showReturnForm === order.id && (
                <div className="mt-4 p-4 border rounded bg-gray-100">
                  <h3 className="text-lg font-semibold mb-2">Submit Return/Replace Request</h3>
                  <div className="mb-2">
                    <label className="mr-4">
                      <input type="radio" value="return" checked={returnType === 'return'} onChange={() => setReturnType('return')} /> Return
                    </label>
                    <label>
                      <input type="radio" value="replace" checked={returnType === 'replace'} onChange={() => setReturnType('replace')} /> Replace
                    </label>
                  </div>
                  <textarea
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="Enter reason..."
                    className="w-full p-2 border rounded"
                  />
                  <div className="mt-2 flex gap-2">
                    <button
                      onClick={() => submitReturnRequest(order.id)}
                      className="bg-purple-600 text-white px-4 py-2 rounded"
                    >
                      Submit Request
                    </button>
                    <button
                      onClick={() => setShowReturnForm(null)}
                      className="text-gray-600 hover:text-gray-800"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
