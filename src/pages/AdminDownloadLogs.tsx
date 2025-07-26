// src/pages/AdminDownloadLogs.tsx
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import PageHeader from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/Button";
import Spinner from "@/components/ui/Spinner";
import ErrorAlert from "@/components/ui/ErrorAlert";

interface LogFile {
  name: string;
  created_at: string;
}

export default function AdminDownloadLogs() {
  const [logs, setLogs] = useState<LogFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLogs = async () => {
      const { data, error } = await supabase
        .storage
        .from("test-logs")
        .list("", { limit: 100, sortBy: { column: "created_at", order: "desc" } });

      if (error) {
        setError("Failed to fetch logs.");
      } else {
        setLogs(data || []);
      }

      setLoading(false);
    };

    fetchLogs();
  }, []);

  const handleDownload = async (filename: string) => {
    const { data, error } = await supabase
      .storage
      .from("test-logs")
      .download(filename);

    if (error || !data) {
      alert("Failed to download log.");
      return;
    }

    const url = URL.createObjectURL(data);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-4 max-w-3xl mx-auto">
      <PageHeader title="🧪 Test Logs" subtitle="Download archived test logs from Supabase Storage." />

      {loading ? (
        <Spinner />
      ) : error ? (
        <ErrorAlert message={error} />
      ) : (
        <div className="space-y-4 mt-6">
          {logs.length === 0 ? (
            <p>No logs found.</p>
          ) : (
            logs.map((file) => (
              <div key={file.name} className="flex justify-between items-center border p-3 rounded-lg">
                <span className="font-mono">{file.name}</span>
                <Button onClick={() => handleDownload(file.name)}>Download</Button>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
