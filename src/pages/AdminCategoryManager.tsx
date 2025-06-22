// ✅ AdminCategoryManager.tsx
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import toast from 'react-hot-toast';
import { Helmet } from 'react-helmet-async';

export default function AdminCategoryManager() {
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);
  const [newCategory, setNewCategory] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('categories').select('*');
    if (error) toast.error('Failed to load categories');
    else setCategories(data || []);
    setLoading(false);
  };

  const addCategory = async () => {
    if (!newCategory.trim()) return;
    const { error } = await supabase.from('categories').insert([{ name: newCategory }]);
    if (error) toast.error('Add failed');
    else {
      toast.success('Category added');
      setNewCategory('');
      fetchCategories();
    }
  };

  const deleteCategory = async (id: string) => {
    const confirm = window.confirm('Are you sure you want to delete this category?');
    if (!confirm) return;
    const { error } = await supabase.from('categories').delete().eq('id', id);
    if (!error) {
      toast.success('Deleted');
      fetchCategories();
    } else toast.error('Delete failed');
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <Helmet>
        <title>Admin Category Manager</title>
      </Helmet>
      <h1 className="text-2xl font-bold mb-4 text-green-700">Category Management</h1>

      <div className="flex gap-2 mb-4">
        <input
          type="text"
          value={newCategory}
          onChange={(e) => setNewCategory(e.target.value)}
          placeholder="New Category"
          className="border px-3 py-2 rounded w-full"
        />
        <button
          onClick={addCategory}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        >
          Add
        </button>
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <ul className="space-y-2">
          {categories.map((c) => (
            <li
              key={c.id}
              className="flex justify-between items-center p-2 border rounded bg-white dark:bg-gray-800"
            >
              <span>{c.name}</span>
              <button
                onClick={() => deleteCategory(c.id)}
                className="text-sm text-red-600 hover:underline"
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

// ✅ AdminProductsPage.tsx

// ✅ AdminProductReportsPage.tsx

// ✅ AdminReviewReportsPage.tsx

// ✅ AdminReportPage.tsx

// ✅ AdminReportsPage.tsx

// ✅ AdminRepliesPage.tsx

// ✅ AdminInvoiceRequestPage.tsx

// ✅ AdminOrderTrackingPage.tsx

