// src/pages/SupportLogsExport.tsx

import { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/Button";
import Spinner from "@/components/ui/Spinner";
import ErrorAlert from "@/components/ui/ErrorAlert";
import { formatDistanceToNow } from "date-fns";
import toast from "react-hot-toast";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as Papa from "papaparse";

interface FileItem {
  name: string;
  created_at: string;
  size: number;
}

export default function SupportLogsExport() {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [sortAsc, setSortAsc] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      checkAdminRole();
      fetchFiles();
      window.gtag?.("event", "view_support_logs_export");
    }
  }, []);

  const checkAdminRole = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      toast.error("Not logged in");
      window.location.href = "/";
      return;
    }

    const { data: profile, error } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (error || profile?.role !== "admin") {
      toast.error("Access denied");
      window.location.href = "/";
    }
  };

  const fetchFiles = async () => {
    setLoading(true);
    const { data, error } = await supabase.storage
      .from("exports")
      .list("support_logs", {
        limit: 100,
        sortBy: { column: "created_at", order: "desc" },
      });

    if (error) {
      setError("Failed to load files");
    } else {
      const enriched: FileItem[] = data.map((file) => ({
        name: file.name,
        created_at: file.metadata?.lastModified || new Date().toISOString(),
        size: file.metadata?.size || 0,
      }));
      setFiles(enriched);
    }

    setLoading(false);
  };

  const formatSize = (bytes: number) => {
    if (bytes >= 1_000_000) return (bytes / 1_000_000).toFixed(1) + " MB";
    if (bytes >= 1_000) return (bytes / 1_000).toFixed(1) + " KB";
    return bytes + " B";
  };

  const downloadFile = async (name: string) => {
    const { data, error } = await supabase.storage
      .from("exports")
      .download(`support_logs/${name}`);

    if (error || !data) {
      toast.error("Download failed");
      return;
    }

    const blob = new Blob([data], {
      type: name.endsWith(".csv") ? "text/csv" : "application/pdf",
    });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = name;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const deleteFile = async (name: string) => {
    const confirm = window.confirm(`Delete "${name}" from storage?`);
    if (!confirm) return;

    const { error } = await supabase.storage
      .from("exports")
      .remove([`support_logs/${name}`]);

    if (error) {
      toast.error("Delete failed");
    } else {
      toast.success("File deleted");
      fetchFiles();
    }
  };

  const exportListAs = (format: "csv" | "pdf") => {
    const headers = [["Filename", "Size", "Created"]];
    const rows = files.map((f) => [
      f.name,
      formatSize(f.size),
      new Date(f.created_at).toLocaleString(),
    ]);

    if (format === "csv") {
      const csv = Papa.unparse({ fields: ["Filename", "Size", "Created"], data: rows });
      const blob = new Blob([csv], { type: "text/csv" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "support-log-exports.csv";
      a.click();
    } else {
      const doc = new jsPDF();
      autoTable(doc, {
        head: headers,
        body: rows,
      });
      doc.save("support-log-exports.pdf");
    }
  };

  const runExportNow = async () => {
    toast.loading("Running export...");
    try {
      const res = await fetch("/functions/v1/export-support-logs", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY || ""}`,
        },
      });

      if (res.ok) {
        toast.dismiss();
        toast.success("Export complete");
        fetchFiles();
      } else {
        toast.dismiss();
        toast.error("Export failed");
      }
    } catch (err) {
      toast.dismiss();
      toast.error("Export failed");
    }
  };

  const sortedFiles = [...files].sort((a, b) =>
    sortAsc
      ? new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      : new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <Helmet>
        <title>Support Log Exports | Cauverystore Admin</title>
        <meta name="description" content="Browse and download exported support logs." />
        <meta property="og:title" content="Support Log Exports" />
        <meta name="twitter:title" content="Support Log Exports" />
      </Helmet>

      <h1 className="text-3xl font-bold text-green-700 mb-4">Support Log Exports</h1>

      <div className="flex flex-wrap gap-2 mb-4">
        <Button variant="outline" onClick={() => setSortAsc(!sortAsc)}>
          Sort: {sortAsc ? "Oldest First" : "Newest First"}
        </Button>
        <Button onClick={() => exportListAs("csv")}>Export List as CSV</Button>
        <Button onClick={() => exportListAs("pdf")}>Export List as PDF</Button>
        <Button onClick={runExportNow} variant="success">
          Run Export Now
        </Button>
      </div>

      {loading ? (
        <Spinner size="lg" />
      ) : error ? (
        <ErrorAlert message={error} />
      ) : sortedFiles.length === 0 ? (
        <p className="text-gray-600 dark:text-gray-300">No exported logs found.</p>
      ) : (
        <div className="overflow-x-auto rounded border bg-white dark:bg-gray-900">
          <table className="w-full text-sm">
            <thead className="bg-gray-100 dark:bg-gray-800">
              <tr>
                <th className="px-4 py-2 text-left">File</th>
                <th className="px-4 py-2 text-left">Size</th>
                <th className="px-4 py-2 text-left">Created</th>
                <th className="px-4 py-2 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {sortedFiles.map((file) => (
                <tr key={file.name} className="border-t hover:bg-gray-50 dark:hover:bg-gray-800">
                  <td className="px-4 py-2">
                    <span className="inline-flex items-center gap-2">
                      {file.name.endsWith(".csv") ? "📄 CSV" : "🧾 PDF"}{" "}
                      <span className="truncate max-w-xs">{file.name}</span>
                    </span>
                  </td>
                  <td className="px-4 py-2">{formatSize(file.size)}</td>
                  <td className="px-4 py-2">
                    {formatDistanceToNow(new Date(file.created_at), {
                      addSuffix: true,
                    })}
                  </td>
                  <td className="px-4 py-2 flex gap-2">
                    <Button size="sm" onClick={() => downloadFile(file.name)}>
                      Download
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => deleteFile(file.name)}
                    >
                      Delete
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
