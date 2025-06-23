// src/pages/UserProfilePage.tsx – Fully Integrated with Helmet, Editable Profile, and UI
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Helmet } from 'react-helmet';
import toast from 'react-hot-toast';
import PageHeader from '@/components/ui/PageHeader';
import FormField from '@/components/ui/FormField';
import LabeledInput from '@/components/ui/LabeledInput';
import LoadingButton from '@/components/ui/LoadingButton';
import Spinner from '@/components/ui/Spinner';

interface Profile {
  full_name: string;
  email: string;
  phone: string | null;
  address: string | null;
}

export default function UserProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState<Profile>({
    full_name: '',
    email: '',
    phone: '',
    address: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    setLoading(true);
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      toast.error('Please login to view profile');
      return;
    }

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (error) {
      toast.error('Failed to fetch profile');
    } else {
      setProfile(data);
      setForm({
        full_name: data.full_name || '',
        email: user.email || '',
        phone: data.phone,
        address: data.address,
      });
    }

    setLoading(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    setSaving(true);
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      toast.error('Please login to save profile');
      setSaving(false);
      return;
    }

    const { error } = await supabase.from('profiles').upsert({
      id: user.id,
      full_name: form.full_name,
      phone: form.phone,
      address: form.address,
      updated_at: new Date().toISOString(),
    });

    if (error) {
      toast.error('Failed to update profile');
    } else {
      toast.success('Profile updated!');
      setEditMode(false);
      fetchProfile();
    }
    setSaving(false);
  };

  if (loading) {
    return (
      <div className="p-6 text-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="p-6 text-center">
        <p>No profile found.</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <Helmet>
        <title>My Profile | Cauvery Store</title>
        <meta name="description" content="View and update your account profile at Cauvery Store." />
      </Helmet>

      <PageHeader title="My Profile" />

      {!editMode ? (
        <div className="space-y-4">
          <p><strong>Name:</strong> {profile.full_name}</p>
          <p><strong>Email:</strong> {profile.email}</p>
          <p><strong>Phone:</strong> {profile.phone || '—'}</p>
          <p><strong>Address:</strong> {profile.address || '—'}</p>
          <LoadingButton onClick={() => setEditMode(true)} className="mt-4 bg-green-600 text-white">
            Edit Profile
          </LoadingButton>
        </div>
      ) : (
        <div className="space-y-4">
          <FormField label="Full Name">
            <LabeledInput name="full_name" value={form.full_name} onChange={handleChange} />
          </FormField>
          <FormField label="Email">
            <LabeledInput name="email" value={form.email} disabled />
          </FormField>
          <FormField label="Phone">
            <LabeledInput name="phone" value={form.phone || ''} onChange={handleChange} />
          </FormField>
          <FormField label="Address">
            <LabeledInput name="address" value={form.address || ''} onChange={handleChange} />
          </FormField>
          <div className="flex gap-2">
            <LoadingButton onClick={handleSave} loading={saving} className="bg-green-600 text-white">
              Save
            </LoadingButton>
            <LoadingButton onClick={() => setEditMode(false)} className="bg-gray-500 text-white">
              Cancel
            </LoadingButton>
          </div>
        </div>
      )}
    </div>
  );
}
