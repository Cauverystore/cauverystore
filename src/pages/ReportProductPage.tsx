import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import toast from 'react-hot-toast';

export default function ReportProductPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [reason, setReason] = useState('');
  const [userId, setUserId] = useState<string | null>(null);
  const [product, setProduct] = useState<any>(null);

  useEffect(() => {
    getUser();
    fetchProduct();
  }, [id]);

  const getUser = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      toast.error('Please log in to report');
      navigate('/login');
    } else {
      setUserId(user.id);
    }
  };

  const fetchProduct = async () => {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .single();
    if (error || !data) {
      toast.error('Product not found');
      navigate('/');
    } else {
      setProduct(data);
    }
  };

  const handleSubmit = async () => {
    if (!reason.trim()) {
      toast.error('Please provide a reason');
      return;
    }

    const { error } = await supabase.from('product_reports').insert({
      product_id: id,
      user_id: userId,
      reason,
    });

    if (error) {
      toast.error('Failed to submit report');
    } else {
      toast.success('Report submitted');
      navigate(`/product/${id}`);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 min-h-screen bg-white dark:bg-gray-900 text-gray-800 dark:text-white">
      <h1 className="text-2xl font-bold mb-4 text-red-600">Report Product</h1>

      {product ? (
        <div className="mb-4">
          <p className="text-lg font-semibold">{product.name}</p>
          <p className="text-sm text-gray-500">ID: {product.id}</p>
        </div>
      ) : (
        <p>Loading product details...</p>
      )}

      <textarea
        value={reason}
        onChange={(e) => setReason(e.target.value)}
        className="w-full border border-gray-300 dark:border-gray-700 rounded px-3 py-2 mb-4"
        placeholder="Describe the issue you found with this product..."
        rows={5}
      />

      <button
        onClick={handleSubmit}
        className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
      >
        Submit Report
      </button>
    </div>
  );
}
