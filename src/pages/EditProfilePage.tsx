// src/pages/EditProfilePage.tsx
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Helmet } from 'react-helmet-async';

export default function EditProfilePage() {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      navigate('/login');
      return;
    }

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (error) {
      toast.error('Failed to load profile');
    } else {
      setProfile(data);
    }

    setLoading(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const handleUpdate = async () => {
    const { error } = await supabase
      .from('profiles')
      .update(profile)
      .eq('id', profile.id);

    if (error) {
      toast.error('Failed to update profile');
    } else {
      toast.success('Profile updated');
    }
  };

  if (loading) {
    return <div className="p-6">Loading profile...</div>;
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <Helmet>
        <title>Edit Profile | Cauverystore</title>
      </Helmet>
      <h1 className="text-2xl font-bold mb-4 text-green-700">Edit Profile</h1>

      <div className="space-y-4">
        <input
          type="text"
          name="name"
          value={profile.name || ''}
          onChange={handleChange}
          placeholder="Full Name"
          className="border p-2 w-full rounded"
        />
        <input
          type="number"
          name="age"
          value={profile.age || ''}
          onChange={handleChange}
          placeholder="Age"
          className="border p-2 w-full rounded"
        />
        <select
          name="gender"
          value={profile.gender || ''}
          onChange={handleChange}
          className="border p-2 w-full rounded"
        >
          <option value="">Select Gender</option>
          <option value="Male">Male</option>
          <option value="Female">Female</option>
        </select>
        <select
          name="marital_status"
          value={profile.marital_status || ''}
          onChange={handleChange}
          className="border p-2 w-full rounded"
        >
          <option value="">Select Marital Status</option>
          <option value="Single">Single</option>
          <option value="Married">Married</option>
        </select>
        <input
          type="text"
          name="location"
          value={profile.location || ''}
          onChange={handleChange}
          placeholder="Location"
          className="border p-2 w-full rounded"
        />
        <button
          onClick={handleUpdate}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        >
          Update Profile
        </button>
      </div>
    </div>
  );
}
