import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '@/lib/supabaseClient';
import toast from 'react-hot-toast';

export default function ReportProductPage() {
  const { id } = useParams();
  const [product, setProduct] = useState<any>(null);
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchProduct();
  }, [id]);

  const fetchProduct = async () => {
    const { data, error } = await supabase.from('products').select('*').eq('id', id).single();
    if (error) {
      toast.error('Product not found');
    } else {
      setProduct(data);
    }
  };

  const handleSubmit = async () => {
    if (!reason.trim()) return toast.error('Please provide a reason');
    setSubmitting(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { error } = await supabase.from('product_reports').insert({
      product_id: id,
      user_id: user?.id,
      reason,
    });

    if (error) {
      toast.error('Failed to report product');
    } else {
      toast.success('Report submitted successfully');
      setReason('');
    }

    setSubmitting(false);
  };

  if (!product) return <div className="p-4">Loading product...</div>;

  return (
    <div className="p-6 max-w-xl mx-auto">
      <h2 className="text-2xl font-bold mb-4 text-red-700">Report Product</h2>
      <div className="border rounded p-4 shadow">
        <img src={product.image_url} alt={product.name} className="w-full h-48 object-cover rounded mb-3" />
        <h3 className="text-lg font-semibold text-green-700">{product.name}</h3>
        <p className="text-sm text-gray-600 mb-4">Category: {product.category}</p>

        <textarea
          placeholder="Describe the issue with this product"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          className="w-full border rounded px-3 py-2 mb-4"
          rows={4}
        ></textarea>

        <button
          onClick={handleSubmit}
          disabled={submitting}
          className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
        >
          {submitting ? 'Submitting...' : 'Submit Report'}
        </button>
      </div>
    </div>
  );
}
