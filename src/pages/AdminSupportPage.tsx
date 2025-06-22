import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import toast from 'react-hot-toast';

interface SupportRequest {
  id: number;
  user_email: string;
  subject: string;
  message: string;
  created_at: string;
  resolved: boolean;
}

export default function AdminSupportPage() {
  const [requests, setRequests] = useState<SupportRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSupportRequests();
  }, []);

  const fetchSupportRequests = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('support_requests')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) {
      setRequests(data);
    }
    setLoading(false);
  };

  const markAsResolved = async (id: number) => {
    const { error } = await supabase
      .from('support_requests')
      .update({ resolved: true })
      .eq('id', id);

    if (!error) {
      toast.success('Marked as resolved');
      fetchSupportRequests();
    } else {
      toast.error('Failed to update');
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto min-h-screen bg-white dark:bg-gray-900 text-gray-800 dark:text-white">
      <h1 className="text-2xl font-bold mb-6 text-green-700">Customer Support Requests</h1>

      {loading ? (
        <p>Loading requests...</p>
      ) : requests.length === 0 ? (
        <p>No support requests found.</p>
      ) : (
        <div className="space-y-4">
          {requests.map((req) => (
            <div
              key={req.id}
              className="border rounded-lg p-4 bg-gray-50 dark:bg-gray-800 shadow"
            >
              <p className="text-sm text-gray-500">{new Date(req.created_at).toLocaleString()}</p>
              <p className="font-semibold text-green-700">{req.subject}</p>
              <p className="text-gray-700 dark:text-gray-300 mb-2">{req.message}</p>
              <p className="text-sm text-gray-600">From: {req.user_email}</p>
              <div className="mt-2">
                {req.resolved ? (
                  <span className="text-xs text-green-600 font-bold">Resolved</span>
                ) : (
                  <button
                    onClick={() => markAsResolved(req.id)}
                    className="text-xs bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600"
                  >
                    Mark as Resolved
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
