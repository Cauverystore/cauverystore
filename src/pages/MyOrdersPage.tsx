// src/pages/MyOrdersPage.tsx – Fully Integrated with Return/Review/Invoice Flow + Helmet SEO
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Helmet } from 'react-helmet';
import { useCartStore } from '@/stores/useCartStore';

import Spinner from '@/components/ui/Spinner';
import PageHeader from '@/components/ui/PageHeader';
import Button from '@/components/ui/Button';
import Textarea from '@/components/ui/Textarea';
import EmptyState from '@/components/ui/EmptyState';
import InvoiceGenerator from '@/components/InvoiceGenerator';

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
    navigate(`/support?order_id=${orderId}`);
  };

  if (loading) {
    return (
      <div className="p-6 text-center">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Helmet>
        <title>My Orders | Cauvery Store</title>
        <meta name="description" content="Track, review, and manage your Cauvery Store orders." />
      </Helmet>

      <PageHeader
        title="My Orders"
        subtitle="Track, manage, and review your orders"
      />

      {orders.length === 0 ? (
        <EmptyState
          title="No Orders Yet"
          description="Start shopping and place your first order!"
          actionLabel="Go to Store"
          onAction={() => navigate('/')}
        />
      ) : (
        <ul className="space-y-6">
          {orders.map((order) => (
            <li key={order.id} className="border rounded p-4 shadow-sm">
              <div className="mb-2 space-y-1 text-sm">
                <p><strong>Order ID:</strong> {order.id}</p>
                <p><strong>Status:</strong> {order.status}</p>
                <p><strong>Total:</strong> ₹{order.total}</p>
                <p><strong>Date:</strong> {new Date(order.created_at).toLocaleString()}</p>
              </div>

              <InvoiceGenerator order={order} />

              <div className="mt-4">
                <h4 className="font-semibold mb-2">Items:</h4>
                {order.order_items?.map((item: any, idx: number) => (
                  <div key={idx} className="flex justify-between items-center mb-2 text-sm">
                    <span>{item.name} × {item.quantity}</span>
                    <span>₹{item.price * item.quantity}</span>
                    {order.status === 'delivered' && (
                      <button
                        className="text-xs text-purple-600 underline ml-2"
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
                  <Textarea
                    value={reviewText}
                    onChange={(e) => setReviewText(e.target.value)}
                    placeholder="Your thoughts..."
                  />
                  <select
                    className="w-full border p-2 rounded mt-2"
                    value={reviewRating}
                    onChange={(e) => setReviewRating(Number(e.target.value))}
                  >
                    {[5, 4, 3, 2, 1].map((r) => (
                      <option key={r} value={r}>{r} Star{r > 1 && 's'}</option>
                    ))}
                  </select>
                  <div className="flex gap-2 mt-2">
                    <Button onClick={() => submitReview(reviewingProductId!)}>Submit</Button>
                    <Button variant="ghost" onClick={() => setReviewingProductId(null)}>
                      Cancel
                    </Button>
                  </div>
                </div>
              )}

              <div className="mt-4 flex gap-3 flex-wrap">
                <Button
                  onClick={() =>
                    addToCart({ id: order.id, name: 'Reorder', price: order.total, quantity: 1 })
                  }
                  className="bg-green-600 text-white"
                >
                  Reorder
                </Button>

                <Button
                  onClick={() => contactSupport(order.id)}
                  className="bg-blue-600 text-white"
                >
                  Contact Support
                </Button>

                {order.status === 'pending' && (
                  <Button
                    onClick={() => handleCancelOrder(order.id)}
                    className="bg-red-600 text-white"
                  >
                    Cancel Order
                  </Button>
                )}

                {order.status === 'delivered' && (
                  <Button
                    onClick={() => setShowReturnForm(order.id)}
                    className="bg-yellow-600 text-white"
                  >
                    Request Return/Replace
                  </Button>
                )}
              </div>

              {showReturnForm === order.id && (
                <div className="mt-4 p-4 border rounded bg-gray-100">
                  <h3 className="text-lg font-semibold mb-2">Submit Return/Replace Request</h3>
                  <div className="mb-2 text-sm space-x-4">
                    <label>
                      <input
                        type="radio"
                        value="return"
                        checked={returnType === 'return'}
                        onChange={() => setReturnType('return')}
                        className="mr-1"
                      />
                      Return
                    </label>
                    <label>
                      <input
                        type="radio"
                        value="replace"
                        checked={returnType === 'replace'}
                        onChange={() => setReturnType('replace')}
                        className="mr-1"
                      />
                      Replace
                    </label>
                  </div>

                  <Textarea
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="Enter reason..."
                  />

                  <div className="mt-2 flex gap-2">
                    <Button onClick={() => submitReturnRequest(order.id)}>
                      Submit Request
                    </Button>
                    <Button variant="ghost" onClick={() => setShowReturnForm(null)}>
                      Cancel
                    </Button>
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
