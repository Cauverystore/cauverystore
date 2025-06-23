// src/pages/ProductUploadPage.tsx – Fully Integrated with Supabase, UI, and Helmet SEO
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabaseClient';
import toast from 'react-hot-toast';
import { Helmet } from 'react-helmet';

import PageHeader from '@/components/ui/PageHeader';
import FormField from '@/components/ui/FormField';
import LabeledInput from '@/components/ui/LabeledInput';
import Textarea from '@/components/ui/Textarea';
import LoadingButton from '@/components/ui/LoadingButton';

export default function ProductUploadPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '',
    description: '',
    price: '',
    stock: '',
    image_url: '',
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    const { name, description, price, stock, image_url } = form;
    if (!name || !description || !price || !stock || !image_url) {
      toast.error('Please fill in all fields.');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.from('products').insert([
        {
          name,
          description,
          price: parseFloat(price),
          stock: parseInt(stock),
          image_url,
        },
      ]);

      if (error) throw error;

      toast.success('Product uploaded successfully!');
      navigate('/merchant/products');
    } catch (err: any) {
      console.error(err);
      toast.error('Failed to upload product.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <Helmet>
        <title>Upload Product | Cauvery Store</title>
        <meta name="description" content="Add a new product to Cauvery Store." />
      </Helmet>

      <PageHeader title="Upload Product" subtitle="Add a new product to your store" />

      <div className="space-y-4">
        <FormField label="Product Name">
          <LabeledInput
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="e.g. Organic Turmeric Powder"
          />
        </FormField>

        <FormField label="Description">
          <Textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            placeholder="Write a brief product description"
          />
        </FormField>

        <FormField label="Price (₹)">
          <LabeledInput
            name="price"
            type="number"
            value={form.price}
            onChange={handleChange}
            placeholder="e.g. 199"
          />
        </FormField>

        <FormField label="Stock">
          <LabeledInput
            name="stock"
            type="number"
            value={form.stock}
            onChange={handleChange}
            placeholder="e.g. 50"
          />
        </FormField>

        <FormField label="Image URL">
          <LabeledInput
            name="image_url"
            value={form.image_url}
            onChange={handleChange}
            placeholder="https://example.com/image.jpg"
          />
        </FormField>

        <LoadingButton
          loading={loading}
          onClick={handleSubmit}
          className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded"
        >
          Upload Product
        </LoadingButton>
      </div>
    </div>
  );
}
