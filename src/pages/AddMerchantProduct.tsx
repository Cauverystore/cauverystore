// ✅ src/pages/AddMerchantProduct.tsx

import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Helmet } from 'react-helmet-async';

export default function AddMerchantProduct() {
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [originalPrice, setOriginalPrice] = useState('');
  const [stock, setStock] = useState('');
  const [category, setCategory] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !price || !stock || !category || !imageUrl) {
      toast.error('Please fill in all required fields.');
      return;
    }

    const { error } = await supabase.from('products').insert([
      {
        name,
        price: parseFloat(price),
        original_price: originalPrice ? parseFloat(originalPrice) : null,
        stock: parseInt(stock),
        category,
        image_url: imageUrl,
        status: 'active',
      },
    ]);

    if (error) {
      toast.error('Failed to add product.');
    } else {
      toast.success('Product added successfully.');
      navigate('/merchant/dashboard');
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <Helmet>
        <title>Add Product | Merchant</title>
      </Helmet>
      <h1 className="text-2xl font-bold mb-4 text-green-700">Add New Product</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
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
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        >
          Add Product
        </button>
      </form>
    </div>
  );
}
