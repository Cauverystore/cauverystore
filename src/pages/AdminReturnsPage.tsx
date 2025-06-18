// AdminReturnsPage.tsx - Admin view for managing return/replace requests
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';

interface ReturnRequest {
  id: string;
  order_id: string;
  user_id: string;
  type: 'return' | 'replace';
  reason: string;
  status: string;
  created_at: string;
}

export default function AdminReturnsPage() {
  const [requests, setRequests] = useState<ReturnRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRequests = async () => {
      const { data, error } = await supabase
        .from('order_returns')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        toast.error('Failed to fetch return requests');
        return;
      }

      setRequests(data);
      setLoading(false);
    };

    fetchRequests();
  }, []);

  const handleUpdateStatus = async (id: string, status: string) => {
    const request = requests.find((r) => r.id === id);
    if (!request) return toast.error('Request not found');

    // Fetch user email from profiles
    const { data: userProfile, error: userError } = await supabase
      .from('profiles')
      .select('email')
      .eq('id', request.user_id)
      .single();

    if (userError || !userProfile?.email) {
      toast.error('Failed to fetch user email');
      return;
    }

    const { error } = await supabase
      .from('order_returns')
      .update({ status })
      .eq('id', id);

    if (error) {
      toast.error('Failed to update status');
    } else {
      toast.success(`Request marked as ${status}`);
      setRequests((prev) =>
        prev.map((req) => (req.id === id ? { ...req, status } : req))
      );

      await fetch('/api/send-return-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: userProfile.email,
          order_id: request.order_id,
          type: request.type,
          status,
        }),
      });
    }
  };

  if (loading) return <div className="p-6">Loading return requests...</div>;

  return (
    <div className="max-w-5xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Return/Replace Requests</h1>
        <div className="space-x-4">
          <Link to="/admin" className="text-sm text-blue-600 hover:underline">← Admin Dashboard</Link>
          <Link to="/admin/orders" className="text-sm text-blue-600 hover:underline">Orders</Link>
          <Link to="/admin/products" className="text-sm text-blue-600 hover:underline">Products</Link>
        </div>
      </div>

      {requests.length === 0 ? (
        <p>No return/replace requests found.</p>
      ) : (
        <table className="w-full border text-sm">
          <thead>
            <tr className="bg-gray-100 dark:bg-gray-800">
              <th className="p-2 border">Order ID</th>
              <th className="p-2 border">User ID</th>
              <th className="p-2 border">Type</th>
              <th className="p-2 border">Reason</th>
              <th className="p-2 border">Status</th>
              <th className="p-2 border">Requested At</th>
              <th className="p-2 border">Actions</th>
            </tr>
          </thead>
          <tbody>
            {requests.map((req) => (
              <tr key={req.id} className="odd:bg-white even:bg-gray-50 dark:odd:bg-gray-900 dark:even:bg-gray-800">
                <td className="p-2 border">{req.order_id}</td>
                <td className="p-2 border">{req.user_id}</td>
                <td className="p-2 border capitalize">{req.type}</td>
                <td className="p-2 border">{req.reason}</td>
                <td className="p-2 border capitalize">{req.status || 'pending'}</td>
                <td className="p-2 border">{new Date(req.created_at).toLocaleString()}</td>
                <td className="p-2 border space-x-2">
                  {req.status !== 'approved' && (
                    <button
                      onClick={() => handleUpdateStatus(req.id, 'approved')}
                      className="bg-green-600 text-white px-2 py-1 rounded text-xs hover:bg-green-700"
                    >
                      Approve
                    </button>
                  )}
                  {req.status !== 'rejected' && (
                    <button
                      onClick={() => handleUpdateStatus(req.id, 'rejected')}
                      className="bg-red-600 text-white px-2 py-1 rounded text-xs hover:bg-red-700"
                    >
                      Reject
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
