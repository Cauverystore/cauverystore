import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { supabase } from '@/lib/supabaseClient';
import toast from 'react-hot-toast';

import LoadingSpinner from '@/components/ui/LoadingSpinner';
import ErrorAlert from '@/components/ui/ErrorAlert';
import Button from '@/components/ui/Button';
import InputError from '@/components/ui/InputError';

interface Profile {
  id: string;
  full_name: string;
  phone?: string;
  address?: string;
  email?: string;
}

export default function UserProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    full_name: '',
    phone: '',
    address: '',
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    setLoading(true);
    setError('');
    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        setError('User not found.');
        return;
      }

      const { data, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profileError) {
        setError('Failed to load profile.');
        return;
      }

      setProfile(data);
      setFormData({
        full_name: data.full_name || '',
        phone: data.phone || '',
        address: data.address || '',
      });
    } catch (err: any) {
      console.error(err);
      setError('Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSave = async () => {
    if (!formData.full_name.trim()) {
      toast.error('Full name is required');
      return;
    }

    setLoading(true);
    try {
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          full_name: formData.full_name,
          phone: formData.phone,
          address: formData.address,
        })
        .eq('id', profile?.id);

      if (updateError) {
        toast.error('Failed to update profile');
        return;
      }

      toast.success('Profile updated successfully');
      fetchProfile(); // Refresh
    } catch (err) {
      console.error(err);
      toast.error('An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <Helmet>
        <title>My Profile | Cauverystore</title>
        <meta
          name="description"
          content="Update your personal profile and contact information on Cauverystore."
        />
        <meta property="og:title" content="My Profile | Cauverystore" />
        <meta
          property="og:description"
          content="Manage your personal details and contact preferences in your Cauverystore profile."
        />
        <meta property="og:type" content="website" />
        <meta property="twitter:card" content="summary" />
        <meta property="twitter:title" content="My Profile | Cauverystore" />
        <meta
          property="twitter:description"
          content="Access and update your contact and address information in your Cauverystore profile."
        />
      </Helmet>

      <h1 className="text-2xl font-bold text-green-700 mb-4">My Profile</h1>

      {loading ? (
        <LoadingSpinner size="lg" />
      ) : error ? (
        <ErrorAlert message={error} />
      ) : (
        <form className="space-y-4">
          <div>
            <label className="block font-medium text-gray-700">Full Name</label>
            <input
              type="text"
              name="full_name"
              value={formData.full_name}
              onChange={handleChange}
              className="border p-2 rounded w-full"
            />
            <InputError
              condition={!formData.full_name.trim()}
              message="Full name is required"
            />
          </div>

          <div>
            <label className="block font-medium text-gray-700">Phone</label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="border p-2 rounded w-full"
            />
          </div>

          <div>
            <label className="block font-medium text-gray-700">Address</label>
            <textarea
              name="address"
              value={formData.address}
              onChange={handleChange}
              className="border p-2 rounded w-full"
              rows={3}
            />
          </div>

          <Button type="button" onClick={handleSave}>
            Save Changes
          </Button>
        </form>
      )}
    </div>
  );
}
