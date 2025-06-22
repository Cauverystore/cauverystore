import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import toast from 'react-hot-toast';
import { Helmet } from 'react-helmet-async';

interface InvoiceRequest {
  id: string;
  order_id: string;
  user_email: string;
  requested_at: string;
  status: string;
}

export default function AdminInvoiceRequestsPage() {
  const [requests, setRequests] = useState<InvoiceRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('invoice_requests')
      .select('*')
      .order('requested_at', { ascending: false });

    if (error) {
      toast.error('Failed to load requests');
    } else {
      setRequests(data || []);
    }
    setLoading(false);
  };

  const markAsCompleted = async (id: string) => {
    const { error } = await supabase
      .from('invoice_requests')
      .update({ status: 'completed' })
      .eq('id', id);

    if (error) {
      toast.error('Failed to mark as completed');
    } else {
      toast.success('Marked as completed');
      fetchRequests();
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <Helmet>
        <title>Invoice Requests</title>
      </Helmet>
      <h1 className="text-2xl font-bold mb-4 text-green-700">Invoice Requests</h1>

      {loading ? (
        <p>Loading...</p>
      ) : requests.length === 0 ? (
        <p className="text-gray-500">No invoice requests found.</p>
      ) : (
        <div className="space-y-4">
          {requests.map((req) => (
            <div
              key={req.id}
              className="p-4 border rounded bg-white dark:bg-gray-800 flex justify-between items-center"
            >
              <div>
                <p className="text-sm">
                  <strong>Order ID:</strong> {req.order_id}
                </p>
                <p className="text-sm">
                  <strong>Email:</strong> {req.user_email}
                </p>
                <p className="text-xs text-gray-500">
                  Requested: {new Date(req.requested_at).toLocaleString()}
                </p>
                <p className="text-xs text-gray-500">Status: {req.status}</p>
              </div>
              {req.status !== 'completed' && (
                <button
                  onClick={() => markAsCompleted(req.id)}
                  className="text-sm text-white bg-green-600 px-3 py-1 rounded hover:bg-green-700"
                >
                  Mark as Completed
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
