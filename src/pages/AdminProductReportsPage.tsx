import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import toast from 'react-hot-toast';
import { Helmet } from 'react-helmet-async';

interface ProductReport {
  id: string;
  product_id: string;
  reason: string;
  created_at: string;
  product_name?: string;
}

export default function AdminProductReportsPage() {
  const [reports, setReports] = useState<ProductReport[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('product_reports')
      .select('*, products(name)')
      .order('created_at', { ascending: false });

    if (error) {
      toast.error('Failed to fetch product reports');
    } else {
      const formatted = (data || []).map((r: any) => ({
        id: r.id,
        product_id: r.product_id,
        reason: r.reason,
        created_at: r.created_at,
        product_name: r.products?.name || 'Unknown',
      }));
      setReports(formatted);
    }
    setLoading(false);
  };

  const deleteReport = async (id: string) => {
    const confirm = window.confirm('Are you sure you want to delete this report?');
    if (!confirm) return;
    const { error } = await supabase.from('product_reports').delete().eq('id', id);
    if (!error) {
      toast.success('Deleted report');
      fetchReports();
    } else {
      toast.error('Delete failed');
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <Helmet>
        <title>Admin Product Reports</title>
      </Helmet>
      <h1 className="text-2xl font-bold mb-4 text-green-700">Product Reports</h1>

      {loading ? (
        <p>Loading reports...</p>
      ) : reports.length === 0 ? (
        <p className="text-gray-500">No product reports found.</p>
      ) : (
        <ul className="space-y-3">
          {reports.map((r) => (
            <li key={r.id} className="p-4 border rounded bg-white dark:bg-gray-800">
              <p className="text-sm text-gray-700 dark:text-gray-200">
                <strong>Product:</strong> {r.product_name}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                <strong>Reason:</strong> {r.reason}
              </p>
              <p className="text-xs text-gray-400">
                Reported on: {new Date(r.created_at).toLocaleString()}
              </p>
              <button
                onClick={() => deleteReport(r.id)}
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
