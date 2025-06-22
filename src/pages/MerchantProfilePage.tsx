// ✅ src/pages/MerchantProfilePage.tsx

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Helmet } from 'react-helmet-async';

interface Merchant {
  id: string;
  email: string;
  name: string;
  phone?: string;
  store_name?: string;
  address?: string;
}

export default function MerchantProfilePage() {
  const [merchant, setMerchant] = useState<Merchant | null>(null);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState<Partial<Merchant>>({});
  const navigate = useNavigate();

  useEffect(() => {
    fetchMerchant();
  }, []);

  const fetchMerchant = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      toast.error('User not found');
      return navigate('/login');
    }

    const { data, error } = await supabase.from('users').select('*').eq('id', user.id).single();

    if (error || !data) {
      toast.error('Could not load profile');
      return;
    }

    setMerchant(data);
    setForm(data);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!merchant) return;

    const { error } = await supabase.from('users').update(form).eq('id', merchant.id);
    if (error) toast.error('Update failed');
    else {
      toast.success('Profile updated');
      setEditing(false);
      fetchMerchant();
    }
  };

  if (!merchant) return <p className="p-6">Loading...</p>;

  return (
    <div className="max-w-2xl mx-auto p-6">
      <Helmet>
        <title>Merchant Profile | Cauverystore</title>
      </Helmet>
      <h1 className="text-2xl font-bold text-green-700 mb-4">Merchant Profile</h1>

      {!editing ? (
        <div className="space-y-2">
          <p><strong>Email:</strong> {merchant.email}</p>
          <p><strong>Name:</strong> {merchant.name}</p>
          <p><strong>Store Name:</strong> {merchant.store_name || 'N/A'}</p>
          <p><strong>Phone:</strong> {merchant.phone || 'N/A'}</p>
          <p><strong>Address:</strong> {merchant.address || 'N/A'}</p>
          <button
            onClick={() => setEditing(true)}
            className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Edit Profile
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            name="name"
            placeholder="Name"
            className="border px-4 py-2 rounded w-full"
            value={form.name || ''}
            onChange={handleChange}
          />
          <input
            type="text"
            name="store_name"
            placeholder="Store Name"
            className="border px-4 py-2 rounded w-full"
            value={form.store_name || ''}
            onChange={handleChange}
          />
          <input
            type="text"
            name="phone"
            placeholder="Phone"
            className="border px-4 py-2 rounded w-full"
            value={form.phone || ''}
            onChange={handleChange}
          />
          <input
            type="text"
            name="address"
            placeholder="Address"
            className="border px-4 py-2 rounded w-full"
            value={form.address || ''}
            onChange={handleChange}
          />
          <div className="flex gap-2">
            <button
              type="submit"
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
            >
              Save
            </button>
            <button
              type="button"
              onClick={() => setEditing(false)}
              className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500"
            >
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
