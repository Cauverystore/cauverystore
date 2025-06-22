// src/pages/CustomerSupportPage.tsx
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Helmet } from 'react-helmet-async';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

export default function CustomerSupportPage() {
  const [orderId, setOrderId] = useState('');
  const [message, setMessage] = useState('');
  const [userId, setUserId] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    getCurrentUser();
  }, []);

  const getCurrentUser = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      toast.error('Please log in to contact support');
      navigate('/login');
    } else {
      setUserId(user.id);
    }
  };

  const submitRequest = async () => {
    if (!orderId.trim() || !message.trim()) {
      toast.error('Please provide order ID and message');
      return;
    }

    const { error } = await supabase.from('support_requests').insert([
      {
        order_id: orderId,
        message,
        user_id: userId,
      },
    ]);

    if (error) {
      toast.error('Failed to submit request');
    } else {
      toast.success('Support request submitted');
      setOrderId('');
      setMessage('');
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white dark:bg-gray-900 text-gray-800 dark:text-white">
      <Helmet>
        <title>Customer Support | Cauverystore</title>
      </Helmet>
      <h1 className="text-2xl font-bold mb-6 text-green-700">Customer Support</h1>

      <div className="space-y-4">
        <input
          type="text"
          value={orderId}
          onChange={(e) => setOrderId(e.target.value)}
          placeholder="Enter Order ID"
          className="w-full border p-2 rounded"
        />
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Describe your issue..."
          className="w-full border p-2 rounded h-32 resize-none"
        />
        <button
          onClick={submitRequest}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        >
          Submit Request
        </button>
      </div>
    </div>
  );
}
