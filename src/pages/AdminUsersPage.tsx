import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Helmet } from 'react-helmet-async';
import toast from 'react-hot-toast';
import Spinner from '@/components/ui/Spinner';
import { Button } from '@/components/ui/Button';
import ErrorAlert from '@/components/ui/ErrorAlert';

interface User {
  id: string;
  email: string;
  role: string;
  status: string;
  created_at: string;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    setError("");
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      toast.error('Failed to fetch users');
      setError('Unable to fetch user data.');
    } else {
      setUsers(data || []);
    }
    setLoading(false);
  };

  const toggleUserStatus = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'suspended' : 'active';
    const { error } = await supabase
      .from('users')
      .update({ status: newStatus })
      .eq('id', id);

    if (!error) {
      toast.success(`User ${newStatus === 'active' ? 're-activated' : 'suspended'}`);
      fetchUsers();
    } else {
      toast.error('Status update failed');
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <Helmet>
        <title>Admin Users | Cauverystore</title>
        <meta name="description" content="Manage all registered users." />
      </Helmet>

      <h1 className="text-3xl font-bold mb-4 text-green-700">Manage Users</h1>

      {loading ? (
        <Spinner size="lg" />
      ) : error ? (
        <ErrorAlert message={error} />
      ) : (
        <div className="overflow-x-auto border rounded-lg">
          <table className="w-full text-sm">
            <thead className="bg-gray-100 dark:bg-gray-700">
              <tr>
                <th className="px-3 py-2 border">Email</th>
                <th className="px-3 py-2 border">Role</th>
                <th className="px-3 py-2 border">Status</th>
                <th className="px-3 py-2 border">Joined</th>
                <th className="px-3 py-2 border">Action</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="text-center border-t">
                  <td className="px-3 py-2 border">{u.email}</td>
                  <td className="px-3 py-2 border capitalize">{u.role}</td>
                  <td className="px-3 py-2 border">
                    <span
                      className={`px-2 py-1 rounded text-white text-xs ${
                        u.status === 'active' ? 'bg-green-600' : 'bg-red-600'
                      }`}
                    >
                      {u.status}
                    </span>
                  </td>
                  <td className="px-3 py-2 border">
                    {new Date(u.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-3 py-2 border">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => toggleUserStatus(u.id, u.status)}
                    >
                      {u.status === 'active' ? 'Suspend' : 'Reactivate'}
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
