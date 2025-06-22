import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import toast from 'react-hot-toast';
import { Helmet } from 'react-helmet-async';

interface Report {
  id: string;
  type: 'product' | 'review';
  reason: string;
  created_at: string;
  reference_id: string;
}

export default function AdminReportPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    setLoading(true);
    const { data: productReports, error: productError } = await supabase
      .from('product_reports')
      .select('*');

    const { data: reviewReports, error: reviewError } = await supabase
      .from('review_reports')
      .select('*');

    if (productError || reviewError) {
      toast.error('Failed to load reports');
      setLoading(false);
      return;
    }

    const formatted: Report[] = [
      ...(productReports || []).map((r) => ({
        id: r.id,
        type: 'product' as const,
        reason: r.reason,
        created_at: r.created_at,
        reference_id: r.product_id,
      })),
      ...(reviewReports || []).map((r) => ({
        id: r.id,
        type: 'review' as const,
        reason: r.reason,
        created_at: r.created_at,
        reference_id: r.review_id,
      })),
    ];

    setReports(formatted.sort((a, b) => b.created_at.localeCompare(a.created_at)));
    setLoading(false);
  };

  const deleteReport = async (type: 'product' | 'review', id: string) => {
    const confirm = window.confirm('Are you sure you want to delete this report?');
    if (!confirm) return;

    const table = type === 'product' ? 'product_reports' : 'review_reports';
    const { error } = await supabase.from(table).delete().eq('id', id);

    if (!error) {
      toast.success('Deleted report');
      fetchReports();
    } else {
      toast.error('Failed to delete');
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <Helmet>
        <title>Admin Reports</title>
      </Helmet>
      <h1 className="text-2xl font-bold mb-4 text-green-700">All Reports</h1>

      {loading ? (
        <p>Loading...</p>
      ) : reports.length === 0 ? (
        <p className="text-gray-500">No reports available.</p>
      ) : (
        <ul className="space-y-4">
          {reports.map((r) => (
            <li
              key={r.id}
              className="p-4 border rounded bg-white dark:bg-gray-800 shadow-sm"
            >
              <p className="text-sm text-gray-700 dark:text-gray-200">
                <strong>Type:</strong> {r.type.toUpperCase()}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                <strong>Reason:</strong> {r.reason}
              </p>
              <p className="text-xs text-gray-400">
                Reported on: {new Date(r.created_at).toLocaleString()}
              </p>
              <button
                onClick={() => deleteReport(r.type, r.id)}
                className="mt-2 text-sm text-red-600 hover:underline"
              >
                Delete Report
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
