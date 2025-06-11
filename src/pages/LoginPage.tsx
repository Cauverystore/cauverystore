import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const { data: authData, error: loginError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (loginError || !authData.session) {
      setLoading(false);
      setError(loginError?.message || 'Login failed.');
      return;
    }

    const userId = authData.session.user.id;

    // Fetch role from profiles
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', userId)
      .single();

    setLoading(false);

    if (profileError || !profile) {
      setError('Could not fetch user role.');
      return;
    }

    toast.success('Login successful.');

    // Redirect based on role
    switch (profile.role) {
      case 'admin':
        navigate('/admin');
        break;
      case 'merchant':
        navigate('/merchant');
        break;
      case 'customer':
        navigate('/customer-dashboard');
        break;
      default:
        navigate('/');
        break;
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 px-4">
      <form
        onSubmit={handleLogin}
        className="p-6 rounded-xl shadow-lg w-full max-w-sm bg-white space-y-4"
      >
        <h2 className="text-2xl font-semibold text-center text-green-700">Login to Cauvery Store</h2>

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
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </form>
    </div>
  );
}
