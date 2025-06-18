// --- AdminLogsPage.tsx ---

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Helmet } from "react-helmet-async";

interface LogEntry {
  id: number;
  action: string;
  user_id: string;
  created_at: string;
}

export default function AdminLogsPage() {
  const [logs, setLogs] = useState<LogEntry[]>([]);

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    const { data, error } = await supabase
      .from("admin_logs")
      .select("*")
      .order("created_at", { ascending: false });
    if (!error && data) setLogs(data);
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Helmet>
        <title>Admin Logs | Cauverystore</title>
        <meta
          name="description"
          content="View administrative logs and actions for Cauverystore."
        />
      </Helmet>
      <h1 className="text-2xl font-bold mb-6">Admin Logs</h1>
      {logs.map((log) => (
        <div key={log.id} className="border-b py-3">
          <p><strong>Action:</strong> {log.action}</p>
          <p><strong>User:</strong> {log.user_id}</p>
          <p><strong>Time:</strong> {new Date(log.created_at).toLocaleString()}</p>
        </div>
      ))}
    </div>
  );
}

// --- SupportRequestsPage.tsx ---

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Helmet } from "react-helmet-async";

interface SupportRequest {
  id: number;
  order_id: number;
  user_id: string;
  message: string;
  created_at: string;
}

export default function SupportRequestsPage() {
  const [requests, setRequests] = useState<SupportRequest[]>([]);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    const { data, error } = await supabase
      .from("support_requests")
      .select("*")
      .order("created_at", { ascending: false });
    if (!error && data) setRequests(data);
  };

  return (
    <div className="max-w-5xl mx-auto p-6">
      <Helmet>
        <title>Support Requests | Cauverystore</title>
        <meta
          name="description"
          content="Customer support queries and assistance for Cauverystore orders."
        />
      </Helmet>
      <h1 className="text-2xl font-bold mb-6">Customer Support Requests</h1>
      {requests.map((req) => (
        <div key={req.id} className="border rounded p-4 bg-white mb-4">
          <p><strong>Order ID:</strong> {req.order_id}</p>
          <p><strong>User ID:</strong> {req.user_id}</p>
          <p><strong>Message:</strong> {req.message}</p>
          <p><strong>Created At:</strong> {new Date(req.created_at).toLocaleString()}</p>
        </div>
      ))}
    </div>
  );
}

// --- AdminUsersPage.tsx ---

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Helmet } from "react-helmet-async";

interface User {
  id: string;
  email: string;
  role: string;
  status: string;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    const { data, error } = await supabase.from("users").select("*");
    if (!error && data) setUsers(data);
  };

  const toggleStatus = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === "active" ? "suspended" : "active";
    const { error } = await supabase.from("users").update({ status: newStatus }).eq("id", id);
    if (!error) fetchUsers();
  };

  const filteredUsers = users.filter((u) =>
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-5xl mx-auto p-6">
      <Helmet>
        <title>Manage Users | Cauverystore</title>
        <meta
          name="description"
          content="Admin panel to view, suspend, and manage user accounts."
        />
      </Helmet>
      <h1 className="text-2xl font-bold mb-6">Admin - Manage Users</h1>
      <input
        type="text"
        placeholder="Search by email"
        className="border rounded px-3 py-2 mb-4 w-full"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
      <div className="space-y-4">
        {filteredUsers.map((user) => (
          <div
            key={user.id}
            className="border p-4 rounded bg-white flex justify-between items-center"
          >
            <div>
              <p><strong>Email:</strong> {user.email}</p>
              <p><strong>Role:</strong> {user.role}</p>
              <p><strong>Status:</strong> {user.status}</p>
            </div>
            <button
              onClick={() => toggleStatus(user.id, user.status)}
              className={`px-4 py-2 rounded text-white ${
                user.status === "active" ? "bg-red-600 hover:bg-red-700" : "bg-green-600 hover:bg-green-700"
              }`}
            >
              {user.status === "active" ? "Suspend" : "Reactivate"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
