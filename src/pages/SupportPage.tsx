import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabaseClient';
import toast from 'react-hot-toast';

export default function SupportPage() {
  const [searchParams] = useSearchParams();
  const [orderId, setOrderId] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const id = searchParams.get('order_id');
    if (id) setOrderId(id);
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) {
      toast.error('Please enter a message.');
      return;
    }

    setLoading(true);
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      toast.error('Login required.');
      setLoading(false);
      return;
    }

    const { error } = await supabase.from('order_support_requests').insert({
      user_id: session.user.id,
      order_id: orderId,
      message,
    });

    setLoading(false);

    if (error) {
      toast.error('Failed to send request.');
    } else {
      toast.success('Support request submitted.');
      navigate('/my-orders');
    }
  };

  return (
    <div className="max-w-xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Contact Support</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Order ID</label>
          <input
            type="text"
            value={orderId}
            readOnly
            className="w-full p-2 border rounded bg-gray-100"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Message</label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={5}
            className="w-full p-2 border rounded"
            placeholder="Describe your issue or query..."
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          {loading ? 'Sending...' : 'Submit Request'}
        </button>
      </form>
    </div>
  );
}
