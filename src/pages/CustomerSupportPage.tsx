// src/pages/CustomerSupportPage.tsx
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import ErrorAlert from '@/components/ui/ErrorAlert';
import Spinner from '@/components/ui/Spinner';

interface SupportReply {
  id: number;
  message: string;
  is_admin: boolean;
  created_at: string;
  support_request_id: number;
}

interface SupportRequest {
  id: number;
  order_id: string;
  message: string;
  status: 'pending' | 'responded' | 'resolved';
  created_at: string;
  replies: SupportReply[];
}

export default function CustomerSupportPage() {
  const [userId, setUserId] = useState<string | null>(null);
  const [orderId, setOrderId] = useState('');
  const [message, setMessage] = useState('');
  const [requests, setRequests] = useState<SupportRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const init = async () => {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();

      if (error || !user) {
        toast.error('Please log in to access support');
        navigate('/login');
      } else {
        setUserId(user.id);
        fetchRequests(user.id);
      }
    };

    init();

    const channel = supabase
      .channel('customer-support-realtime')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'support_replies',
        },
        (payload) => {
          const newReply = payload.new as SupportReply;
          setRequests((prev) =>
            prev.map((req) =>
              req.id === newReply.support_request_id
                ? { ...req, replies: [...req.replies, newReply] }
                : req
            )
          );
          toast.success('New reply received from admin');
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchRequests = async (uid: string) => {
    setLoading(true);
    const { data, error } = await supabase
      .from('support_requests')
      .select('id, order_id, message, status, created_at, replies:support_replies(id, message, is_admin, created_at, support_request_id)')
      .eq('user_id', uid)
      .order('created_at', { ascending: false });

    if (error) {
      setError('Failed to load support requests.');
    } else {
      setRequests(data || []);
    }
    setLoading(false);
  };

  const handleSubmit = async () => {
    if (!orderId.trim() || !message.trim()) {
      toast.error('Please fill all fields');
      return;
    }

    const { error } = await supabase.from('support_requests').insert([
      {
        order_id: orderId,
        message,
        user_id: userId,
        status: 'pending',
      },
    ]);

    if (error) {
      toast.error('Failed to submit request');
    } else {
      toast.success('Request submitted');
      setOrderId('');
      setMessage('');
      fetchRequests(userId!);
    }
  };

  const statusStyle = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-200 text-yellow-800';
      case 'responded':
        return 'bg-blue-200 text-blue-800';
      case 'resolved':
        return 'bg-green-200 text-green-800';
      default:
        return 'bg-gray-200 text-gray-800';
    }
  };

  const filteredRequests = requests.filter((r) =>
    r.order_id.toLowerCase().includes(search.toLowerCase()) ||
    r.message.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 bg-white dark:bg-gray-900 text-gray-800 dark:text-white">
      <Helmet>
        <title>Customer Support | Cauverystore</title>
        <meta name="description" content="Get support for your orders or queries. View past messages and admin replies." />
      </Helmet>

      <h1 className="text-3xl font-bold mb-6 text-green-700">🛎️ Customer Support</h1>

      {error && <ErrorAlert message={error} />}

      <div className="grid gap-4 mb-6">
        <Input
          placeholder="Order ID"
          value={orderId}
          onChange={(e) => setOrderId(e.target.value)}
        />
        <textarea
          placeholder="Describe your issue..."
          className="w-full border p-3 rounded h-32 resize-none dark:bg-gray-800"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
        <Button onClick={handleSubmit}>📨 Submit Request</Button>
      </div>

      <hr className="my-6 border-gray-300 dark:border-gray-700" />

      <h2 className="text-2xl font-semibold mb-4">📋 Your Past Requests</h2>

      <Input
        placeholder="Search by order ID or message"
        className="mb-4"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {loading ? (
        <div className="flex justify-center py-10">
          <Spinner />
        </div>
      ) : (
        <div className="space-y-4">
          {filteredRequests.map((req) => (
            <div key={req.id} className="border rounded p-4 dark:border-gray-700">
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-medium">Order: {req.order_id}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Submitted on {format(new Date(req.created_at), 'PPpp')}
                  </p>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full ${statusStyle(req.status)}`}>
                  {req.status}
                </span>
              </div>

              <button
                className="mt-3 text-green-600 hover:underline text-sm"
                onClick={() => setExpandedId(expandedId === req.id ? null : req.id)}
              >
                {expandedId === req.id ? '▲ Hide Thread' : '▼ View Thread'}
              </button>

              {expandedId === req.id && (
                <div className="mt-3 space-y-2 bg-gray-50 dark:bg-gray-800 p-3 rounded">
                  <div className="border-l-4 pl-3 border-green-500">
                    <p className="font-semibold">You:</p>
                    <p>{req.message}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {format(new Date(req.created_at), 'PPpp')}
                    </p>
                  </div>

                  {req.replies?.map((reply) => (
                    <div
                      key={reply.id}
                      className={`border-l-4 pl-3 ${
                        reply.is_admin ? 'border-blue-500' : 'border-gray-400'
                      }`}
                    >
                      <p className="font-semibold">
                        {reply.is_admin ? 'Admin' : 'You'}:
                      </p>
                      <p>{reply.message}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {format(new Date(reply.created_at), 'PPpp')}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}

          {filteredRequests.length === 0 && (
            <p className="text-center text-gray-600 dark:text-gray-400">
              No support requests found.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
