import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Helmet } from 'react-helmet-async';

interface LogEntry {
  id: string;
  action: string;
  user_email: string;
  timestamp: string;
  details?: string;
}

export default function AdminLogsPage() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('admin_logs')
      .select('*')
      .order('timestamp', { ascending: false });

    if (error) {
      console.error('Error fetching logs:', error.message);
    } else {
      setLogs(data || []);
    }
    setLoading(false);
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <Helmet>
        <title>Admin Logs</title>
      </Helmet>
      <h1 className="text-2xl font-bold mb-4 text-green-700">Activity Logs</h1>

      {loading ? (
        <p>Loading logs...</p>
      ) : logs.length === 0 ? (
        <p>No activity logs found.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full table-auto border">
            <thead className="bg-gray-100 dark:bg-gray-700 text-sm">
              <tr>
                <th className="px-3 py-2 border">User</th>
                <th className="px-3 py-2 border">Action</th>
                <th className="px-3 py-2 border">Details</th>
                <th className="px-3 py-2 border">Timestamp</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log.id} className="text-sm text-center">
                  <td className="px-3 py-2 border">{log.user_email}</td>
                  <td className="px-3 py-2 border">{log.action}</td>
                  <td className="px-3 py-2 border">{log.details || '-'}</td>
                  <td className="px-3 py-2 border">
                    {new Date(log.timestamp).toLocaleString()}
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
