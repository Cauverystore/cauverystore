// src/pages/AdminLogsPage.tsx
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import Badge from "@/Components/Badge";

interface LogEntry {
  id: string;
  admin_email: string;
  target_user_id: string;
  action: string;
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

    if (error) console.error("Failed to fetch logs:", error.message);
    else setLogs(data || []);
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">Admin Action Logs</h2>
      {logs.length === 0 ? (
        <p>No logs found.</p>
      ) : (
        <div className="overflow-x-auto border rounded">
          <table className="w-full text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-2 text-left">Admin</th>
                <th className="px-4 py-2 text-left">Action</th>
                <th className="px-4 py-2 text-left">Target User</th>
                <th className="px-4 py-2 text-left">Time</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log.id} className="border-t">
                  <td className="px-4 py-2">{log.admin_email}</td>
                  <td className="px-4 py-2">
                    <Badge label={log.action} type="status" />
                  </td>
                  <td className="px-4 py-2 text-blue-600">{log.target_user_id}</td>
                  <td className="px-4 py-2">
                    {new Date(log.created_at).toLocaleString()}
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
