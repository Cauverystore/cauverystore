import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Helmet } from 'react-helmet-async';
import toast from 'react-hot-toast';

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

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) toast.error('Failed to fetch users');
    else setUsers(data || []);
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
        <title>Admin Users</title>
      </Helmet>
      <h1 className="text-2xl font-bold mb-4 text-green-700">Manage Users</h1>

      {loading ? (
        <p>Loading users...</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full table-auto border">
            <thead className="bg-gray-100 dark:bg-gray-700 text-sm">
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
                <tr key={u.id} className="text-sm text-center">
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
                    <button
                      onClick={() => toggleUserStatus(u.id, u.status)}
                      className="text-sm text-blue-600 hover:underline"
                    >
                      {u.status === 'active' ? 'Suspend' : 'Reactivate'}
                    </button>
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
