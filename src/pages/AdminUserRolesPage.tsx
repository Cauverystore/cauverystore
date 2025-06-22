import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Helmet } from 'react-helmet-async';

interface User {
  id: string;
  email: string;
  role: string;
}

export default function AdminUserRolesPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('users').select('id, email, role');
    if (!error && data) {
      setUsers(data);
    }
    setLoading(false);
  };

  const handleRoleChange = async (id: string, newRole: string) => {
    const { error } = await supabase.from('users').update({ role: newRole }).eq('id', id);
    if (!error) {
      setMessage(`Role updated to "${newRole}" for user.`);
      fetchUsers();
    } else {
      setMessage('Error updating role.');
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-6">
      <Helmet>
        <title>Manage User Roles | Cauverystore</title>
        <meta name="description" content="Admin panel to change roles for users." />
      </Helmet>

      <h1 className="text-2xl font-bold mb-4">Admin - Manage User Roles</h1>

      {message && <p className="text-green-600 mb-4">{message}</p>}

      {loading ? (
        <p>Loading users...</p>
      ) : (
        <div className="space-y-4">
          {users.map((user) => (
            <div
              key={user.id}
              className="flex justify-between items-center bg-white border p-4 rounded shadow"
            >
              <div>
                <p>
                  <strong>Email:</strong> {user.email}
                </p>
                <p>
                  <strong>Current Role:</strong> {user.role}
                </p>
              </div>
              <select
                value={user.role}
                onChange={(e) => handleRoleChange(user.id, e.target.value)}
                className="border px-3 py-2 rounded"
              >
                <option value="customer">Customer</option>
                <option value="merchant">Merchant</option>
                <option value="admin">Admin</option>
              </select>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
