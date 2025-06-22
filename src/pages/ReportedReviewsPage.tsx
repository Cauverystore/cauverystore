// src/pages/ReportReviewPage.tsx

import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabaseClient';
import toast from 'react-hot-toast';

export default function ReportReviewPage() {
  const { reviewId } = useParams();
  const navigate = useNavigate();
  const [reason, setReason] = useState('');
  const [userId, setUserId] = useState<string | null>(null);
  const [hasReported, setHasReported] = useState(false);

  useEffect(() => {
    getUser();
  }, []);

  const getUser = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      setUserId(user.id);
      checkExistingReport(user.id);
    }
  };

  const checkExistingReport = async (uid: string) => {
    const { data } = await supabase
      .from('review_reports')
      .select('id')
      .eq('user_id', uid)
      .eq('review_id', reviewId);
    if (data && data.length > 0) {
      setHasReported(true);
    }
  };

  const handleSubmit = async () => {
    if (!reason.trim()) return toast.error('Please enter a reason');
    if (!userId || hasReported) return;

    const { error } = await supabase.from('review_reports').insert({
      user_id: userId,
      review_id: reviewId,
      reason,
    });

    if (error) {
      toast.error('Failed to report review');
    } else {
      toast.success('Review reported successfully');
      setHasReported(true);
      setTimeout(() => navigate(-1), 1500);
    }
  };

  return (
    <div className="max-w-xl mx-auto p-6 bg-white dark:bg-gray-900 text-gray-800 dark:text-white rounded shadow">
      <h1 className="text-2xl font-bold mb-4 text-red-600">Report Review</h1>

      {hasReported ? (
        <p className="text-green-600">You have already reported this review.</p>
      ) : (
        <>
          <label className="block mb-2 text-sm font-semibold">Reason for Reporting</label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="w-full border px-3 py-2 rounded mb-4"
            rows={5}
            placeholder="Explain why you're reporting this review..."
          />
          <button
            onClick={handleSubmit}
            className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
          >
            Submit Report
          </button>
        </>
      )}
    </div>
  );
}
