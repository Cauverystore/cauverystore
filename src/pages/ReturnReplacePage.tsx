import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import toast from 'react-hot-toast';

export default function ReturnReplacePage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);
  const [reason, setReason] = useState('');
  const [type, setType] = useState<'return' | 'replace'>('return');

  useEffect(() => {
    getUserAndOrders();
  }, []);

  const getUserAndOrders = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      setUserId(user.id);
      const { data, error } = await supabase
        .from('orders')
        .select('id, product_id, status')
        .eq('user_id', user.id)
        .in('status', ['delivered', 'completed']);

      if (!error) setOrders(data);
    }
  };

  const handleSubmit = async () => {
    if (!selectedOrderId || !reason.trim() || !userId) {
      toast.error('Please fill all fields');
      return;
    }

    const { error } = await supabase.from('return_replace_requests').insert({
      order_id: selectedOrderId,
      user_id: userId,
      reason,
      type,
    });

    if (!error) {
      toast.success(`${type === 'return' ? 'Return' : 'Replacement'} request submitted`);
      setSelectedOrderId(null);
      setReason('');
    } else {
      toast.error('Request failed');
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto min-h-screen bg-white dark:bg-gray-900 text-gray-800 dark:text-white">
      <h1 className="text-2xl font-bold text-green-700 mb-4">Return or Replace a Product</h1>

      <div className="space-y-4">
        <div>
          <label className="block mb-1 font-medium">Select Order</label>
          <select
            value={selectedOrderId || ''}
            onChange={(e) => setSelectedOrderId(Number(e.target.value))}
            className="w-full border rounded px-3 py-2"
          >
            <option value="" disabled>
              -- Select an order --
            </option>
            {orders.map((order) => (
              <option key={order.id} value={order.id}>
                Order #{order.id} - Status: {order.status}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block mb-1 font-medium">Request Type</label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value as 'return' | 'replace')}
            className="w-full border rounded px-3 py-2"
          >
            <option value="return">Return</option>
            <option value="replace">Replace</option>
          </select>
        </div>

        <div>
          <label className="block mb-1 font-medium">Reason</label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="w-full border rounded px-3 py-2"
            placeholder="Describe your issue..."
          />
        </div>

        <button
          onClick={handleSubmit}
          className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700"
        >
          Submit Request
        </button>
      </div>
    </div>
  );
}
