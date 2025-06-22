// src/pages/ReturnRequestPage.tsx

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import toast from 'react-hot-toast';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';

export default function ReturnRequestPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [selectedOrderId, setSelectedOrderId] = useState('');
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      toast.error('Please log in to request a return');
      navigate('/login');
      return;
    }

    const { data, error } = await supabase
      .from('orders')
      .select('id, product_name, created_at')
      .eq('user_id', user.id)
      .eq('status', 'delivered');

    if (error) {
      toast.error('Failed to fetch orders');
    } else {
      setOrders(data || []);
    }

    setLoading(false);
  };

  const submitReturnRequest = async () => {
    if (!selectedOrderId || !reason.trim()) {
      toast.error('Please select an order and provide a reason');
      return;
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { error } = await supabase.from('return_requests').insert([
      {
        order_id: selectedOrderId,
        user_id: user?.id,
        reason,
      },
    ]);

    if (error) {
      toast.error('Failed to submit request');
    } else {
      toast.success('Return request submitted');
      setReason('');
      setSelectedOrderId('');
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6">
      <Helmet>
        <title>Return Request | Cauverystore</title>
      </Helmet>
      <h1 className="text-2xl font-bold mb-4 text-green-700">Request a Return</h1>

      {loading ? (
        <p>Loading your orders...</p>
      ) : (
        <div className="space-y-4 bg-white dark:bg-gray-800 p-4 rounded shadow">
          <label className="block">
            <span className="text-sm font-medium">Select Order</span>
            <select
              value={selectedOrderId}
              onChange={(e) => setSelectedOrderId(e.target.value)}
              className="w-full border px-3 py-2 rounded mt-1"
            >
              <option value="">-- Select an order --</option>
              {orders.map((order) => (
                <option key={order.id} value={order.id}>
                  #{order.id} - {order.product_name}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="text-sm font-medium">Reason for Return</span>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={4}
              className="w-full border px-3 py-2 rounded mt-1"
              placeholder="Describe the reason for return..."
            ></textarea>
          </label>

          <button
            onClick={submitReturnRequest}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          >
            Submit Request
          </button>
        </div>
      )}
    </div>
  );
}
