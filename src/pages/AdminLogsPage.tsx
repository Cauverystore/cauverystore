// src/pages/AdminLogsPage.tsx

import React, { useEffect, useState } from "react";
import { useAuth } from "@/Components/AuthProvider";
import { supabase } from "@/lib/supabaseClient";
import LogoutButton from "@/components/LogoutButton";
import { useNavigate } from "react-router-dom";

export default function AdminLogsPage() {
  const { user } = useAuth();
  const [logs, setLogs] = useState<any[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    const { data, error } = await supabase
      .from("admin_logs")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error && data) {
      setLogs(data);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="flex justify-between items-center mb-6 max-w-6xl mx-auto">
        <h2 className="text-2xl font-bold">Admin Logs</h2>
        <LogoutButton />
      </div>

      <div className="p-4 max-w-6xl mx-auto bg-white rounded shadow">
        <table className="w-full text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-2">Action</th>
              <th className="px-4 py-2">Admin Email</th>
              <th className="px-4 py-2">Target User</th>
              <th className="px-4 py-2">Date</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log) => (
              <tr key={log.id} className="border-t">
                <td className="px-4 py-2 text-center">{log.action}</td>
                <td className="px-4 py-2 text-center">{log.admin_email}</td>
                <td className="px-4 py-2 text-center">{log.target_user_id}</td>
                <td className="px-4 py-2 text-center">
                  {new Date(log.created_at).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
