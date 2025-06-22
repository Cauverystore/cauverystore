// src/pages/ReviewRepliesPage.tsx
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';

interface ReviewReply {
  id: string;
  review_id: string;
  reply: string;
  created_at: string;
  product: {
    name: string;
    image_url: string;
  };
}

export default function ReviewRepliesPage() {
  const [replies, setReplies] = useState<ReviewReply[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchReplies();
  }, []);

  const fetchReplies = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      toast.error('Please log in to view replies');
      navigate('/login');
      return;
    }

    const { data, error } = await supabase
      .from('review_replies')
      .select(`
        id,
        review_id,
        reply,
        created_at,
        product:product_reviews (
          product_id,
          product:products ( name, image_url )
        )
      `)
      .in(
        'review_id',
        supabase
          .from('product_reviews')
          .select('id')
          .eq('user_id', user.id)
      );

    if (error || !data) {
      toast.error('Failed to load replies');
      setLoading(false);
      return;
    }

    // Flatten product object
    const formattedReplies = data.map((item: any) => ({
      ...item,
      product: item.product.product,
    }));

    setReplies(formattedReplies);
    setLoading(false);
  };

  if (loading) return <div className="p-6">Loading admin replies...</div>;

  return (
    <div className="max-w-5xl mx-auto p-6">
      <Helmet>
        <title>Admin Replies to Reviews | Cauverystore</title>
      </Helmet>
      <h1 className="text-2xl font-bold mb-4 text-green-700">Admin Replies to Your Reviews</h1>
      {replies.length === 0 ? (
        <p className="text-gray-600">No replies from admin yet.</p>
      ) : (
        <ul className="space-y-4">
          {replies.map((reply) => (
            <li
              key={reply.id}
              className="border rounded p-4 bg-white shadow dark:bg-gray-900"
            >
              <div className="flex items-center gap-4 mb-2">
                <img
                  src={reply.product.image_url}
                  alt={reply.product.name}
                  className="w-12 h-12 rounded object-cover"
                />
                <div>
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    <strong>Product:</strong> {reply.product.name}
                  </p>
                  <p className="text-sm text-gray-500">
                    <strong>Reply:</strong> {reply.reply}
                  </p>
                  <p className="text-xs text-gray-400">
                    <strong>Date:</strong> {new Date(reply.created_at).toLocaleString()}
                  </p>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
