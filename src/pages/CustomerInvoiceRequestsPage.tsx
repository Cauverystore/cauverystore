// src/pages/CustomerInvoiceRequestsPage.tsx
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Helmet } from 'react-helmet-async';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

export default function CustomerInvoiceRequestsPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchUserAndOrders();
  }, []);

  const fetchUserAndOrders = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      toast.error('Please log in to request invoices');
      navigate('/login');
      return;
    }

    setUserId(user.id);

    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      toast.error('Failed to fetch orders');
    } else {
      setOrders(data || []);
    }
  };

  const requestInvoice = async (orderId: string) => {
    const { error } = await supabase
      .from('invoice_requests')
      .insert([{ user_id: userId, order_id: orderId }]);

    if (error) {
      toast.error('Invoice request failed');
    } else {
      toast.success('Invoice requested successfully');
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white dark:bg-gray-900 text-gray-800 dark:text-white">
      <Helmet>
        <title>Request Invoice | Cauverystore</title>
      </Helmet>
      <h1 className="text-2xl font-bold mb-4 text-green-700">Invoice Requests</h1>

      {orders.length === 0 ? (
        <p>No past orders found.</p>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div
              key={order.id}
              className="border rounded p-4 bg-gray-50 dark:bg-gray-800 shadow-sm"
            >
              <p><strong>Order ID:</strong> {order.id}</p>
              <p><strong>Total:</strong> ₹{order.total}</p>
              <p><strong>Status:</strong> {order.status}</p>
              <button
                onClick={() => requestInvoice(order.id)}
                className="mt-2 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              >
                Request Invoice
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
