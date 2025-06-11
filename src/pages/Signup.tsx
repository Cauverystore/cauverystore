import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

export default function Signup() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (signUpError || !data.user) {
      setLoading(false);
      setError(signUpError?.message || 'Signup failed');
      return;
    }

    const userId = data.user.id;

    // Insert into profiles table with default role
    const { error: profileError } = await supabase.from('profiles').insert([
      {
        id: userId,
        email,
        role: 'customer', // default role assigned here
        status: 'active', // default active status
      },
    ]);

    setLoading(false);

    if (profileError) {
      setError('Signup succeeded, but profile creation failed.');
      return;
    }

    toast.success('Signup successful. You can now log in.');
    navigate('/login');
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 px-4">
      <form
        onSubmit={handleSignup}
        className="p-6 rounded-xl shadow-lg w-full max-w-sm bg-white space-y-4"
      >
        <h2 className="text-2xl font-semibold text-center text-green-700">Create an Account</h2>

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
          required
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
          required
        />

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-green-600 hover:bg-green-700 text-white p-3 rounded-md transition duration-200"
        >
          {loading ? 'Signing up...' : 'Sign Up'}
        </button>
      </form>
    </div>
  );
}
