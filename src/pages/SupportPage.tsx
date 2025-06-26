// src/pages/SupportPage.tsx – Fully Integrated with Status Filters, Threads, Admin Replies, Helmet
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useSearchParams } from 'react-router-dom';
import { Helmet } from 'react-helmet';

import PageHeader from '@/components/ui/PageHeader';
import { Button } from '@/components/ui/button'; // ✅ Fixed import
import Textarea from '@/components/ui/Textarea';
import Spinner from '@/components/ui/Spinner';
import EmptyState from '@/components/ui/EmptyState';

interface SupportRequest {
  id: string;
  created_at: string;
  order_id?: string;
  message: string;
  status: 'open' | 'closed' | 'pending';
  replies: {
    id: string;
    message: string;
    sender: 'user' | 'admin';
    created_at: string;
  }[];
}

export default function SupportPage() {
  const [requests, setRequests] = useState<SupportRequest[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [filter, setFilter] = useState<'all' | 'open' | 'closed' | 'pending'>('all');
  const [loading, setLoading] = useState(true);
  const [searchParams] = useSearchParams();
  const orderIdFromQuery = searchParams.get('order_id');

  const fetchSupportRequests = async () => {
    setLoading(true);
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    const { data, error } = await supabase
      .from('support_requests')
      .select('*, replies:support_replies(*)')
      .eq('user_id', session.user.id)
      .order('created_at', { ascending: false });

    if (!error) setRequests(data as SupportRequest[]);
    setLoading(false);
  };

  useEffect(() => {
    fetchSupportRequests();
  }, []);

  const handleSubmit = async () => {
    const trimmed = newMessage.trim();
    if (!trimmed) return;

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    const { error } = await supabase.from('support_requests').insert([
      {
        user_id: session.user.id,
        message: trimmed,
        order_id: orderIdFromQuery,
        status: 'open',
      },
    ]);

    if (!error) {
      setNewMessage('');
      fetchSupportRequests();
    }
  };

  const filteredRequests =
    filter === 'all' ? requests : requests.filter((r) => r.status === filter);

  return (
    <div className="max-w-3xl mx-auto p-6">
      <Helmet>
        <title>Support | Cauvery Store</title>
        <meta name="description" content="Need help? View and manage your support tickets here." />
      </Helmet>

      <PageHeader
        title="Support Center"
        subtitle="Submit requests or follow up on ongoing issues"
      />

      {/* Submit New Request */}
      <div className="border rounded p-4 bg-gray-50 mb-6">
        <Textarea
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Describe your issue or question..."
        />
        <Button className="mt-2" onClick={handleSubmit}>
          Submit Request
        </Button>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-4">
        {['all', 'open', 'pending', 'closed'].map((tab) => (
          <Button
            key={tab}
            variant={filter === tab ? 'default' : 'outline'}
            onClick={() => setFilter(tab as any)}
            className="capitalize"
          >
            {tab}
          </Button>
        ))}
      </div>

      {/* Requests */}
      {loading ? (
        <Spinner size="lg" />
      ) : filteredRequests.length === 0 ? (
        <EmptyState
          title="No Support Requests"
          description="You haven't submitted any support queries yet."
        />
      ) : (
        <ul className="space-y-4">
          {filteredRequests.map((req) => (
            <li key={req.id} className="border rounded p-4 bg-white shadow-sm">
              <div className="text-sm text-gray-600 space-y-1 mb-2">
                <p>
                  <strong>Request ID:</strong> {req.id}
                </p>
                {req.order_id && (
                  <p>
                    <strong>Order:</strong> #{req.order_id}
                  </p>
                )}
                <p>
                  <strong>Status:</strong>{' '}
                  <span
                    className={`inline-block px-2 py-0.5 rounded text-white text-xs ${
                      req.status === 'open'
                        ? 'bg-green-600'
                        : req.status === 'pending'
                        ? 'bg-yellow-600'
                        : 'bg-gray-600'
                    }`}
                  >
                    {req.status}
                  </span>
                </p>
                <p>
                  <strong>Created:</strong>{' '}
                  {new Date(req.created_at).toLocaleString()}
                </p>
              </div>

              <div className="bg-gray-50 border rounded p-3 mt-3 text-sm space-y-2">
                <p><strong>You:</strong> {req.message}</p>
                {req.replies.map((reply) => (
                  <div key={reply.id} className="border-t pt-2">
                    <p>
                      <strong>{reply.sender === 'admin' ? 'Admin' : 'You'}:</strong>{' '}
                      {reply.message}
                    </p>
                    <p className="text-xs text-gray-400">
                      {new Date(reply.created_at).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
