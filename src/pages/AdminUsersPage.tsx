import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    const { data, error } = await supabase.from("profiles").select("*");
    if (!error && data) setUsers(data);
    setLoading(false);
  };

  const toggleSuspend = async (id: string, current: boolean) => {
    const { error } = await supabase
      .from("profiles")
      .update({ suspended: !current })
      .eq("id", id);

    if (!error) fetchUsers();
    else alert("Failed to update user.");
  };

  return (
    <div className="max-w-5xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">All Users</h1>
      {loading ? (
        <p>Loading...</p>
      ) : users.length === 0 ? (
        <p>No users found.</p>
      ) : (
        users.map((user) => (
          <div key={user.id} className="border rounded p-4 mb-3 bg-white">
            <p><strong>Name:</strong> {user.name || "N/A"}</p>
            <p><strong>Email:</strong> {user.email}</p>
            <p><strong>Role:</strong> {user.role}</p>
            <p><strong>Status:</strong> {user.suspended ? "Suspended" : "Active"}</p>
            <button
              onClick={() => toggleSuspend(user.id, user.suspended)}
              className={`mt-2 px-4 py-2 rounded text-white ${
                user.suspended ? "bg-green-600 hover:bg-green-700" : "bg-red-600 hover:bg-red-700"
              }`}
            >
              {user.suspended ? "Reactivate" : "Suspend"}
            </button>
          </div>
        ))
      )}
    </div>
  );
}
