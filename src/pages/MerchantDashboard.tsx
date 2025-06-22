// ✅ src/pages/MerchantDashboard.tsx

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Helmet } from 'react-helmet-async';

export default function MerchantDashboard() {
  const [orderCount, setOrderCount] = useState(0);
  const [productCount, setProductCount] = useState(0);
  const [lowStockCount, setLowStockCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    const [orderRes, productRes] = await Promise.all([
      supabase.from('orders').select('*', { count: 'exact', head: true }),
      supabase.from('products').select('*'),
    ]);

    setOrderCount(orderRes.count || 0);

    if (productRes.data) {
      setProductCount(productRes.data.length);
      setLowStockCount(productRes.data.filter((p) => p.stock <= 5).length);
    }

    setLoading(false);
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <Helmet>
        <title>Merchant Dashboard | Cauverystore</title>
      </Helmet>
      <h1 className="text-2xl font-bold mb-6 text-green-700">Merchant Dashboard</h1>

      {loading ? (
        <p>Loading dashboard...</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-gray-800 p-4 rounded shadow">
            <h2 className="text-lg font-semibold text-gray-700 dark:text-white">Orders</h2>
            <p className="text-3xl font-bold text-green-600">{orderCount}</p>
          </div>

          <div className="bg-white dark:bg-gray-800 p-4 rounded shadow">
            <h2 className="text-lg font-semibold text-gray-700 dark:text-white">Products</h2>
            <p className="text-3xl font-bold text-green-600">{productCount}</p>
          </div>

          <div className="bg-white dark:bg-gray-800 p-4 rounded shadow">
            <h2 className="text-lg font-semibold text-gray-700 dark:text-white">Low Stock</h2>
            <p className="text-3xl font-bold text-red-500">{lowStockCount}</p>
          </div>
        </div>
      )}
    </div>
  );
}
