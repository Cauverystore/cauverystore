// src/pages/AdminSupportDashboard.tsx
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Helmet } from 'react-helmet-async';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import Spinner from '@/components/ui/Spinner';
import { Button } from '@/components/ui/Button';
import Textarea from '@/components/ui/Textarea';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { saveAs } from 'file-saver';

interface SupportReply {
  id: number;
  message: string;
  is_admin: boolean;
  created_at: string;
  support_request_id: number;
}

interface SupportRequest {
  id: number;
  user_id: string;
  order_id: string;
  message: string;
  status: 'pending' | 'responded' | 'resolved';
  created_at: string;
  replies: SupportReply[];
  profiles?: { email?: string };
}

export default function AdminSupportDashboard() {
  const [requests, setRequests] = useState<SupportRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [replyMessage, setReplyMessage] = useState('');
  const [replyingTo, setReplyingTo] = useState<number | null>(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchRequests();

    const channel = supabase
      .channel('admin-support-realtime')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'support_replies' },
        (payload) => {
          const newReply = payload.new as SupportReply;
          setRequests((prev) =>
            prev.map((req) =>
              req.id === newReply.support_request_id
                ? { ...req, replies: [...req.replies, newReply] }
                : req
            )
          );
        }
      )
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'support_requests' },
        (payload) => {
          const newRequest = payload.new as SupportRequest;
          setRequests((prev) => [newRequest, ...prev]);
          toast.success('New support request received');
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchRequests = async () => {
    const { data, error } = await supabase
      .from('support_requests')
      .select('id, user_id, order_id, message, status, created_at, replies:support_replies(id, message, is_admin, created_at, support_request_id), profiles(email)')
      .order('created_at', { ascending: false });

    if (error) {
      toast.error('Failed to fetch support requests');
    } else {
      setRequests(data || []);
    }
    setLoading(false);
  };

  const handleReply = async (requestId: number) => {
    const req = requests.find((r) => r.id === requestId);
    if (!req) return;

    const recipientEmail = req.profiles?.email || 'user@example.com';

    if (!replyMessage.trim()) {
      toast.error('Reply cannot be empty');
      return;
    }

    try {
      const response = await fetch('https://smwtliaoqgscyeppidvz.supabase.co/functions/v1/support-reply-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY}`,
        },
        body: JSON.stringify({
          email: recipientEmail,
          subject: `Reply to your support request: ${req.message.slice(0, 50)}...`,
          message: replyMessage,
          support_request_id: requestId,
          is_admin: true,
        }),
      });

      if (!response.ok) {
        toast.error('Failed to send reply');
        return;
      }

      toast.success('Reply sent and saved');
      setReplyMessage('');
      setReplyingTo(null);

      // ✅ GA4 Event
      if (typeof window !== 'undefined' && window.gtag) {
        window.gtag('event', 'support_reply_sent', {
          support_request_id: requestId,
          admin_email: import.meta.env.VITE_ADMIN_EMAIL || 'admin@cauverystore.in',
        });
      }

      // ✅ Auto-update status to responded
      await supabase
        .from('support_requests')
        .update({ status: 'responded' })
        .eq('id', requestId);

    } catch (err) {
      console.error('❌ Error sending reply:', err);
      toast.error('Network error');
    }
  };

  const handleMarkResolved = async (requestId: number) => {
    const { error } = await supabase
      .from('support_requests')
      .update({ status: 'resolved' })
      .eq('id', requestId);

    if (error) toast.error('Failed to mark as resolved');
    else toast.success('Marked as resolved');
  };

  const downloadAllCSV = () => {
    const csvData = requests.map((r) => ({
      id: r.id,
      order_id: r.order_id,
      user_id: r.user_id,
      message: r.message,
      status: r.status,
      created_at: r.created_at,
    }));

    const headers = Object.keys(csvData[0]).join(',');
    const rows = csvData.map((r) => Object.values(r).join(',')).join('\n');
    const blob = new Blob([`${headers}\n${rows}`], { type: 'text/csv' });
    saveAs(blob, 'support-requests.csv');
  };

  const downloadAllPDF = () => {
    const doc = new jsPDF();
    autoTable(doc, {
      head: [['ID', 'Order ID', 'User ID', 'Status', 'Created']],
      body: requests.map((r) => [
        r.id,
        r.order_id,
        r.user_id,
        r.status,
        format(new Date(r.created_at), 'PPpp'),
      ]),
    });
    doc.save('support-requests.pdf');
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

  const displayedRequests = filterStatus === 'all'
    ? filteredRequests
    : filteredRequests.filter((r) => r.status === filterStatus);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 bg-white dark:bg-gray-900 text-gray-800 dark:text-white">
      <Helmet>
        <title>Admin Support Dashboard | Cauverystore</title>
        <meta name="description" content="View and respond to all support requests from customers in real time." />
      </Helmet>

      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-blue-700">📡 Admin Support Dashboard</h1>
        <div className="flex gap-2">
          <Button onClick={downloadAllCSV}>⬇️ Export CSV</Button>
          <Button onClick={downloadAllPDF}>📄 Export PDF</Button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center mb-6">
        <div className="flex gap-2 w-full sm:w-auto">
          <Input
            placeholder="Search by order ID or message..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <Select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            options={[
              { label: 'All', value: 'all' },
              { label: 'Pending', value: 'pending' },
              { label: 'Responded', value: 'responded' },
              { label: 'Resolved', value: 'resolved' },
            ]}
          />
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-10">
          <Spinner />
        </div>
      ) : (
        <div className="space-y-6">
          {displayedRequests.map((req) => (
            <div key={req.id} className="border rounded p-4 dark:border-gray-700">
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-medium">Order: {req.order_id}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-300">User: {req.user_id}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Submitted: {format(new Date(req.created_at), 'PPpp')}
                  </p>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full ${statusStyle(req.status)}`}>
                  {req.status}
                </span>
              </div>

              <div className="flex gap-2 mt-2">
                <Button variant="outline" size="sm" onClick={() => setExpandedId(expandedId === req.id ? null : req.id)}>
                  {expandedId === req.id ? '▲ Hide Thread' : '▼ View Thread'}
                </Button>
                <Button variant="ghost" size="sm" onClick={() => handleMarkResolved(req.id)}>
                  ✅ Mark as Resolved
                </Button>
              </div>

              {expandedId === req.id && (
                <div className="mt-3 space-y-2 bg-gray-50 dark:bg-gray-800 p-3 rounded">
                  <div className="border-l-4 pl-3 border-green-500">
                    <p className="font-semibold">Customer:</p>
                    <p>{req.message}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {format(new Date(req.created_at), 'PPpp')}
                    </p>
                  </div>

                  {req.replies?.map((reply) => (
                    <div
                      key={reply.id}
                      className={`border-l-4 pl-3 ${reply.is_admin ? 'border-blue-500' : 'border-gray-400'}`}
                    >
                      <p className="font-semibold">{reply.is_admin ? 'Admin' : 'Customer'}:</p>
                      <p>{reply.message}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {format(new Date(reply.created_at), 'PPpp')}
                      </p>
                    </div>
                  ))}

                  <div className="mt-4">
                    <Textarea
                      placeholder="Type your reply..."
                      value={replyingTo === req.id ? replyMessage : ''}
                      onChange={(e) => {
                        setReplyingTo(req.id);
                        setReplyMessage(e.target.value);
                      }}
                    />
                    <Button className="mt-2" onClick={() => handleReply(req.id)}>
                      📨 Send Reply
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ))}

          {displayedRequests.length === 0 && (
            <p className="text-center text-gray-600 dark:text-gray-400">
              No support requests found.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
