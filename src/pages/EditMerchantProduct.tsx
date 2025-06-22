// ✅ src/pages/EditMerchantProduct.tsx

import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabaseClient';
import toast from 'react-hot-toast';
import { Helmet } from 'react-helmet-async';

export default function EditMerchantProduct() {
  const { id } = useParams<{ id: string }>();
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [originalPrice, setOriginalPrice] = useState('');
  const [stock, setStock] = useState('');
  const [category, setCategory] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchProduct();
  }, []);

  const fetchProduct = async () => {
    if (!id) return;
    const { data, error } = await supabase.from('products').select('*').eq('id', id).single();
    if (error || !data) {
      toast.error('Product not found');
      return;
    }

    setName(data.name);
    setPrice(data.price.toString());
    setOriginalPrice(data.original_price?.toString() || '');
    setStock(data.stock.toString());
    setCategory(data.category);
    setImageUrl(data.image_url);
    setLoading(false);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !price || !stock || !category || !imageUrl) {
      toast.error('Please fill in all required fields');
      return;
    }

    const { error } = await supabase.from('products').update({
      name,
      price: parseFloat(price),
      original_price: originalPrice ? parseFloat(originalPrice) : null,
      stock: parseInt(stock),
      category,
      image_url: imageUrl,
    }).eq('id', id);

    if (error) toast.error('Update failed');
    else {
      toast.success('Product updated successfully');
      navigate('/merchant/dashboard');
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <Helmet>
        <title>Edit Product | Merchant</title>
      </Helmet>
      <h1 className="text-2xl font-bold mb-4 text-green-700">Edit Product</h1>

      {loading ? (
        <p>Loading product...</p>
      ) : (
        <form onSubmit={handleUpdate} className="space-y-4">
          <input
            type="text"
            placeholder="Product Name"
            className="border rounded px-4 py-2 w-full"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <input
            type="number"
            placeholder="Price"
            className="border rounded px-4 py-2 w-full"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
          />
          <input
            type="number"
            placeholder="Original Price (optional)"
            className="border rounded px-4 py-2 w-full"
            value={originalPrice}
            onChange={(e) => setOriginalPrice(e.target.value)}
          />
          <input
            type="number"
            placeholder="Stock"
            className="border rounded px-4 py-2 w-full"
            value={stock}
            onChange={(e) => setStock(e.target.value)}
          />
          <input
            type="text"
            placeholder="Category"
            className="border rounded px-4 py-2 w-full"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          />
          <input
            type="text"
            placeholder="Image URL"
            className="border rounded px-4 py-2 w-full"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
          />
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Update Product
          </button>
        </form>
      )}
    </div>
  );
}
