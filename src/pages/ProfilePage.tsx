// src/pages/ProfilePage.tsx
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchUser();
  }, []);

  const fetchUser = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      navigate('/login');
      return;
    }

    setUser(user);
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (!error && data) setProfile(data);
  };

  return (
    <div className="max-w-3xl mx-auto p-6">
      <Helmet>
        <title>My Profile | Cauverystore</title>
        <meta name="description" content="View your personal details and profile information." />
      </Helmet>

      <h1 className="text-2xl font-bold mb-4 text-green-700">My Profile</h1>

      {user && profile ? (
        <div className="bg-white dark:bg-gray-800 p-4 rounded shadow space-y-2">
          <p><strong>Email:</strong> {user.email}</p>
          <p><strong>Name:</strong> {profile.name || 'N/A'}</p>
          <p><strong>Phone:</strong> {profile.phone || 'N/A'}</p>
          <p><strong>Age:</strong> {profile.age || 'N/A'}</p>
          <p><strong>Gender:</strong> {profile.gender || 'N/A'}</p>
          <p><strong>Marital Status:</strong> {profile.marital_status || 'N/A'}</p>
          <p><strong>Address:</strong> {profile.address || 'N/A'}</p>
          <p><strong>City:</strong> {profile.city || 'N/A'}</p>
          <p><strong>State:</strong> {profile.state || 'N/A'}</p>
          <p><strong>Pincode:</strong> {profile.pincode || 'N/A'}</p>
        </div>
      ) : (
        <p>Loading profile...</p>
      )}
    </div>
  );
}
