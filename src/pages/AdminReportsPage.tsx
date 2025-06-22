import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';

export default function AdminReportsPage() {
  const [productCount, setProductCount] = useState(0);
  const [reviewCount, setReviewCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReportCounts();
  }, []);

  const fetchReportCounts = async () => {
    setLoading(true);

    const [{ count: pc }, { count: rc }] = await Promise.all([
      supabase.from('product_reports').select('*', { count: 'exact', head: true }),
      supabase.from('review_reports').select('*', { count: 'exact', head: true }),
    ]);

    setProductCount(pc || 0);
    setReviewCount(rc || 0);
    setLoading(false);
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <Helmet>
        <title>Admin Report Dashboard</title>
      </Helmet>
      <h1 className="text-2xl font-bold mb-4 text-green-700">Reports Summary</h1>

      {loading ? (
        <p>Loading reports...</p>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          <div className="p-4 border rounded bg-white dark:bg-gray-800">
            <h2 className="text-lg font-semibold mb-2 text-green-700">Product Reports</h2>
            <p className="text-sm mb-2 text-gray-600">Total: {productCount}</p>
            <Link
              to="/admin/reports/products"
              className="inline-block text-sm text-blue-600 hover:underline"
            >
              View Product Reports →
            </Link>
          </div>

          <div className="p-4 border rounded bg-white dark:bg-gray-800">
            <h2 className="text-lg font-semibold mb-2 text-green-700">Review Reports</h2>
            <p className="text-sm mb-2 text-gray-600">Total: {reviewCount}</p>
            <Link
              to="/admin/reports/reviews"
              className="inline-block text-sm text-blue-600 hover:underline"
            >
              View Review Reports →
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
