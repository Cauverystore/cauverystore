import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import toast from 'react-hot-toast';
import { Helmet } from 'react-helmet-async';

interface Reply {
  id: string;
  message: string;
  created_at: string;
  admin_name?: string;
}

export default function AdminRepliesPage() {
  const [replies, setReplies] = useState<Reply[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReplies();
  }, []);

  const fetchReplies = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('admin_replies').select('*').order('created_at', { ascending: false });
    if (error) {
      toast.error('Failed to load replies');
    } else {
      setReplies(data || []);
    }
    setLoading(false);
  };

  const deleteReply = async (id: string) => {
    const confirm = window.confirm('Are you sure you want to delete this reply?');
    if (!confirm) return;

    const { error } = await supabase.from('admin_replies').delete().eq('id', id);
    if (error) {
      toast.error('Failed to delete reply');
    } else {
      toast.success('Reply deleted');
      fetchReplies();
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <Helmet>
        <title>Admin Replies</title>
      </Helmet>
      <h1 className="text-2xl font-bold mb-4 text-green-700">Replies by Admin</h1>

      {loading ? (
        <p>Loading replies...</p>
      ) : (
        <div className="space-y-4">
          {replies.length === 0 ? (
            <p className="text-gray-500">No replies available.</p>
          ) : (
            replies.map((reply) => (
              <div
                key={reply.id}
                className="p-4 border rounded shadow bg-white dark:bg-gray-800 flex justify-between items-start"
              >
                <div>
                  <p className="text-sm text-gray-600 mb-1">
                    <strong>Admin:</strong> {reply.admin_name || 'Unknown'}
                  </p>
                  <p className="text-base text-gray-800 dark:text-gray-200">{reply.message}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    {new Date(reply.created_at).toLocaleString()}
                  </p>
                </div>
                <button
                  onClick={() => deleteReply(reply.id)}
                  className="text-sm text-red-600 hover:underline"
                >
                  Delete
                </button>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
