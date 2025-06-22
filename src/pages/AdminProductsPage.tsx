// src/pages/AdminProductsPage.tsx
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';

interface Product {
  id: string;
  name: string;
  price: number;
  original_price?: number;
  stock: number;
  category: string;
  status: string;
  image_url: string;
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) toast.error('Failed to fetch products');
    else setProducts(data || []);
    setLoading(false);
  };

  const deleteProduct = async (id: string) => {
    const confirm = window.confirm('Are you sure you want to delete this product?');
    if (!confirm) return;
    const { error } = await supabase.from('products').delete().eq('id', id);
    if (!error) {
      toast.success('Product deleted');
      fetchProducts();
    } else toast.error('Delete failed');
  };

  const updateStatus = async (id: string, status: string) => {
    const { error } = await supabase.from('products').update({ status }).eq('id', id);
    if (!error) {
      toast.success(`Marked as ${status}`);
      fetchProducts();
    } else toast.error('Status update failed');
  };

  const filtered = products
    .filter((p) => {
      if (filter === 'low') return p.stock <= 5;
      if (filter === 'suspended') return p.status === 'suspended';
      return true;
    })
    .filter((p) => p.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="p-6 max-w-6xl mx-auto min-h-screen">
      <Helmet>
        <title>Admin Products</title>
      </Helmet>
      <h1 className="text-2xl font-bold mb-4 text-green-700">Manage Products</h1>

      <div className="flex gap-2 mb-4 flex-wrap">
        <input
          type="text"
          placeholder="Search..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border px-3 py-2 rounded"
        />
        <select value={filter} onChange={(e) => setFilter(e.target.value)} className="border px-3 py-2 rounded">
          <option value="all">All</option>
          <option value="low">Low Stock</option>
          <option value="suspended">Suspended</option>
        </select>
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className="grid gap-4">
          {filtered.map((p) => (
            <div key={p.id} className="flex items-center justify-between border p-4 rounded bg-white dark:bg-gray-800">
              <div className="flex items-center gap-4">
                <img src={p.image_url} alt={p.name} className="w-16 h-16 object-cover rounded" />
                <div>
                  <h3 className="text-lg font-bold text-green-700">{p.name}</h3>
                  <p className="text-sm text-gray-500">₹{p.price}</p>
                  <p className="text-xs text-gray-400">Category: {p.category}</p>
                  <p className="text-xs text-gray-400">Stock: {p.stock}</p>
                  <p className="text-xs text-gray-400">Status: {p.status}</p>
                </div>
              </div>
              <div className="flex flex-col gap-1">
                <button
                  onClick={() => navigate(`/admin/products/edit/${p.id}`)}
                  className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                >
                  Edit
                </button>
                <button
                  onClick={() => deleteProduct(p.id)}
                  className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
                >
                  Delete
                </button>
                <button
                  onClick={() => updateStatus(p.id, p.status === 'active' ? 'suspended' : 'active')}
                  className="px-3 py-1 bg-yellow-600 text-white text-sm rounded hover:bg-yellow-700"
                >
                  {p.status === 'active' ? 'Suspend' : 'Activate'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
