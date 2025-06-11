import React, { useEffect, useState } from "react";
import { useAuth } from "@/Components/AuthProvider";
import { supabase } from "@/lib/supabaseClient";
import toast from "react-hot-toast";
import Pagination from "@/Components/Pagination";
import Badge from "@/Components/Badge";
import BulkActionToolbar from "@/Components/BulkActionToolbar";
import { useNavigate } from "react-router-dom";
import LogoutButton from "@/components/LogoutButton";

export default function AdminDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [users, setUsers] = useState<any[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [filterStatus, setFilterStatus] = useState("all");
  const [search, setSearch] = useState("");
  const [sortAsc, setSortAsc] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [usersPerPage] = useState(5);

  useEffect(() => {
    fetchUsers();
  }, [filterStatus, sortAsc, search]);

  const fetchUsers = async () => {
    let { data: rawUsers } = await supabase.from("profiles").select("*");
    let filtered = rawUsers || [];

    if (filterStatus !== "all") {
      filtered = filtered.filter((u) => u.status === filterStatus);
    }
    if (search.trim()) {
      filtered = filtered.filter(
        (u) =>
          u.email?.toLowerCase().includes(search.toLowerCase()) ||
          u.role?.toLowerCase().includes(search.toLowerCase())
      );
    }
    filtered.sort((a, b) =>
      sortAsc ? a.email.localeCompare(b.email) : b.email.localeCompare(a.email)
    );

    setUsers(filtered);
    setCurrentPage(1);
  };

  const handleBulkAction = async (type: "suspend" | "reactivate" | "delete") => {
    for (const id of selectedUsers) {
      if (type === "delete") {
        await supabase
          .from("profiles")
          .update({ deleted_at: new Date().toISOString() })
          .eq("id", id);
      } else {
        await supabase
          .from("profiles")
          .update({ status: type === "suspend" ? "suspended" : "active" })
          .eq("id", id);
      }

      await logAdminAction(type, id);
    }
    toast.success(`Users ${type}d`);
    setSelectedUsers([]);
    fetchUsers();
  };

  const logAdminAction = async (
    action: "suspend" | "reactivate" | "delete",
    targetUserId: string
  ) => {
    await supabase.from("admin_logs").insert({
      admin_id: user?.id,
      admin_email: user?.email,
      target_user_id: targetUserId,
      action,
    });
  };

  const paginated = users.slice((currentPage - 1) * usersPerPage, currentPage * usersPerPage);

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      {/* Header */}
      <div className="flex justify-between items-center mb-6 max-w-6xl mx-auto">
        <h2 className="text-2xl font-bold text-green-700">Admin Dashboard</h2>
        <LogoutButton />
      </div>

      <div className="p-4 max-w-6xl mx-auto">
        {/* Filter/Sort */}
        <div className="flex flex-wrap justify-between items-center mb-4 gap-2">
          <input
            placeholder="Search email or role"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border px-3 py-1 rounded"
          />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="border px-3 py-1 rounded"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active</option>
            <option value="suspended">Suspended</option>
          </select>
          <button
            onClick={() => setSortAsc(!sortAsc)}
            className="bg-gray-100 border px-3 py-1 rounded text-sm hover:bg-gray-200"
          >
            Sort: {sortAsc ? "A → Z" : "Z → A"}
          </button>
        </div>

        {/* Bulk Action Toolbar */}
        {selectedUsers.length > 0 && (
          <BulkActionToolbar
            onSuspend={() => handleBulkAction("suspend")}
            onReactivate={() => handleBulkAction("reactivate")}
            onDelete={() => handleBulkAction("delete")}
          />
        )}

        {/* User Table */}
        <div className="overflow-x-auto border rounded">
          <table className="w-full text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-2">Email</th>
                <th className="px-4 py-2">Role</th>
                <th className="px-4 py-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {paginated.map((u) => (
                <tr key={u.id} className="border-t">
                  <td className="px-4 py-2">
                    <span
                      className="text-blue-600 hover:underline cursor-pointer"
                      onClick={() => navigate(`/user-profile/${u.id}`)}
                    >
                      {u.email}
                    </span>
                  </td>
                  <td className="px-4 py-2">
                    <Badge label={u.role} type="role" />
                  </td>
                  <td className="px-4 py-2">
                    <Badge label={u.status || "active"} type="status" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <Pagination
          currentPage={currentPage}
          totalItems={users.length}
          perPage={usersPerPage}
          onChange={setCurrentPage}
        />
      </div>
    </div>
  );
}
