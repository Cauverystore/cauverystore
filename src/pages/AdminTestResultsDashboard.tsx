// src/pages/AdminTestResultsDashboard.tsx
import { useEffect, useState, useMemo } from "react";
import { supabase } from "@/lib/supabaseClient";
import { formatDistanceToNow, parseISO } from "date-fns";
import toast from "react-hot-toast";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import Papa from "papaparse";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip as RechartsTooltip,
  Legend,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer
} from "recharts";
import PageHeader from "@/components/ui/PageHeader";
import Spinner from "@/components/ui/Spinner";
import ErrorAlert from "@/components/ui/ErrorAlert";
import Button from "@/components/ui/Button";
import Select from "@/components/ui/Select";
import Input from "@/components/ui/Input";

interface LogEntry {
  name: string;
  status: "PASSED" | "FAILED" | "UNKNOWN";
  createdAt: string | null;
  note?: string;
  content?: string;
  selected?: boolean;
}

const PAGE_SIZE = 10;
const COLORS = ["#34d399", "#f87171"];

export default function AdminTestResultsDashboard() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<"ALL" | "PASSED" | "FAILED">("ALL");
  const [page, setPage] = useState(1);
  const [selectedLog, setSelectedLog] = useState<LogEntry | null>(null);
  const [noteInput, setNoteInput] = useState<string>("");
  const [selectAll, setSelectAll] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchLogs();
    const channel = supabase
      .channel("test-logs")
      .on("postgres_changes", { event: "*", schema: "storage", table: "objects" }, () => fetchLogs())
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      const email = user?.email;
      if (email === "papillonmediaworks@gmail.com") {
        setIsAdmin(true);
      }
    });
  }, []);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const { data: fileList, error: listError } = await supabase.storage
        .from("test-logs")
        .list("", { limit: 100, sortBy: { column: "name", order: "desc" } });

      if (listError) throw listError;

      const parsed: LogEntry[] = await Promise.all(
        (fileList || []).filter(f => f.name.endsWith(".txt")).map(async (file) => {
          const { data: fileData } = await supabase.storage.from("test-logs").download(file.name);
          const content = fileData ? await fileData.text() : "";
          const status = content.includes("✅ PASSED") ? "PASSED" : content.includes("❌ FAILED") ? "FAILED" : "UNKNOWN";
          const match = file.name.match(/log-(.*?)\.txt/);
          const createdAt = match ? match[1] : null;

          const { data: noteData } = await supabase
            .from("test_logs_meta")
            .select("note")
            .eq("log_name", file.name)
            .single();

          return {
            name: file.name,
            createdAt,
            status,
            content,
            note: noteData?.note || "",
            selected: false
          };
        })
      );

      setLogs(parsed);
    } catch (err) {
      console.error(err);
      setError("Failed to fetch or parse test results.");
    } finally {
      setLoading(false);
    }
  };

  const filteredLogs = useMemo(() => logs.filter(l => filter === "ALL" || l.status === filter), [logs, filter]);
  const paginatedLogs = useMemo(() => filteredLogs.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE), [filteredLogs, page]);

  const chartData = useMemo(() => {
    const passed = logs.filter(l => l.status === "PASSED").length;
    const failed = logs.filter(l => l.status === "FAILED").length;
    return [
      { name: "✅ Passed", value: passed },
      { name: "❌ Failed", value: failed }
    ];
  }, [logs]);

  const timelineData = useMemo(() => {
    const counts: { [key: string]: { PASSED: number; FAILED: number } } = {};
    logs.forEach((log) => {
      if (!log.createdAt) return;
      const day = log.createdAt.slice(0, 10);
      counts[day] = counts[day] || { PASSED: 0, FAILED: 0 };
      if (log.status === "PASSED") counts[day].PASSED++;
      if (log.status === "FAILED") counts[day].FAILED++;
    });
    return Object.entries(counts).map(([date, { PASSED, FAILED }]) => ({ date, PASSED, FAILED }));
  }, [logs]);

  const toggleSelectAll = () => {
    const updated = paginatedLogs.map(log => ({ ...log, selected: !selectAll }));
    setLogs(prev =>
      prev.map(log =>
        updated.find(u => u.name === log.name) || log
      )
    );
    setSelectAll(!selectAll);
  };

  const handleDeleteSelected = async () => {
    const toDelete = logs.filter(l => l.selected);
    if (!toDelete.length) return toast.error("No logs selected.");
    const names = toDelete.map(l => l.name);
    const { error } = await supabase.storage.from("test-logs").remove(names);
    if (error) toast.error("Delete failed.");
    else toast.success("Deleted selected logs.");
    fetchLogs();
  };

  const saveNote = async (log: LogEntry) => {
    const { error } = await supabase.from("test_logs_meta").upsert({
      log_name: log.name,
      note: noteInput
    });
    if (error) toast.error("Failed to save note");
    else toast.success("Note saved");
    fetchLogs();
  };

  const exportCSV = () => {
    const csv = Papa.unparse(filteredLogs);
    const blob = new Blob([csv], { type: "text/csv" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "test-logs.csv";
    a.click();
  };

  const exportPDF = () => {
    const doc = new jsPDF();
    autoTable(doc, {
      head: [["Name", "Status", "Timestamp", "Note"]],
      body: filteredLogs.map(l => [l.name, l.status, l.createdAt || "", l.note || ""])
    });
    doc.save("test-logs.pdf");
  };

  return (
    <div className="p-4 space-y-6">
      {isAdmin && (
        <div className="flex gap-4 items-center">
          <label className="text-sm font-medium">Upload .txt Log File:</label>
          <input
            type="file"
            accept=".txt"
            onChange={async (e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              setUploading(true);
              const filename = `log-${new Date().toISOString()}.txt`;
              const { error } = await supabase.storage.from("test-logs").upload(filename, file);
              if (error) toast.error("Upload failed");
              else toast.success("Log uploaded");
              setUploading(false);
              fetchLogs();
            }}
            disabled={uploading}
            className="text-sm"
          />
        </div>
      )}
      {!isAdmin && (
        <div className="p-4 text-sm bg-yellow-100 text-yellow-800 rounded border border-yellow-300">
          ⚠️ You have limited access. Only administrators can edit, export, or delete test logs.
        </div>
      )}

      <PageHeader title="🧪 Admin Test Results Dashboard" subtitle="Review and manage support test logs." />
      {error && <ErrorAlert message={error} />}
      {loading && <Spinner />}

      <div className="flex justify-between items-center gap-4">
        <Select
          label="Filter"
          value={filter}
          onChange={(e) => {
            setFilter(e.target.value as any);
            setPage(1);
          }}
          options={[
            { label: "All", value: "ALL" },
            { label: "✅ Passed", value: "PASSED" },
            { label: "❌ Failed", value: "FAILED" }
          ]}
        />
        {isAdmin && (
          <div className="flex gap-2">
            <Button onClick={exportCSV}>Export CSV</Button>
            <Button onClick={exportPDF}>Export PDF</Button>
            <Button onClick={handleDeleteSelected}>🧹 Delete Selected</Button>
          </div>
        )}
      </div>

      <div className="mt-4">
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie data={chartData} dataKey="value" nameKey="name" outerRadius={100}>
              {chartData.map((entry, index) => (
                <Cell key={entry.name} fill={COLORS[index]} />
              ))}
            </Pie>
            <RechartsTooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-6">
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={timelineData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <RechartsTooltip />
            <Legend />
            <Line type="monotone" dataKey="PASSED" stroke="#34d399" />
            <Line type="monotone" dataKey="FAILED" stroke="#f87171" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-6">
        <table className="w-full table-auto text-sm border">
          <thead>
            <tr className="bg-gray-100">
              {isAdmin && (<th><input type="checkbox" checked={selectAll} onChange={toggleSelectAll} /></th>)}
              <th>Log</th>
              <th>Status</th>
              <th>Timestamp</th>
              <th>Note</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginatedLogs.map((log) => (
              <tr key={log.name} className="border-t">
                {isAdmin && (
                  <td><input type="checkbox" checked={log.selected} onChange={() => {
                    setLogs((prev) => prev.map(l => l.name === log.name ? { ...l, selected: !l.selected } : l));
                  }} /></td>
                )}
                <td>{log.name}</td>
                <td>{log.status === "PASSED" ? "✅" : log.status === "FAILED" ? "❌" : "⏳"}</td>
                <td>{log.createdAt ? formatDistanceToNow(parseISO(log.createdAt), { addSuffix: true }) : "Unknown"}</td>
                <td>
                  <Input
                    value={log.name === selectedLog?.name ? noteInput : log.note || ""}
                    onChange={(e) => {
                      setNoteInput(e.target.value);
                      setSelectedLog(log);
                    }}
                    placeholder="Add note"
                    className="w-48"
                  />
                </td>
                <td className="flex gap-2">
                  {isAdmin && <Button onClick={() => saveNote(log)}>💾 Save</Button>}
                  <Button onClick={() => setSelectedLog(log)}>👁️ Preview</Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selectedLog && (
        <div className="mt-6 p-4 border rounded bg-gray-50">
          <h3 className="font-bold mb-2">Preview: {selectedLog.name}</h3>
          <pre className="whitespace-pre-wrap text-xs bg-white p-3 border max-h-96 overflow-auto">
            {selectedLog.content || "No content"}
          </pre>
          <Button className="mt-2" onClick={() => setSelectedLog(null)}>Close Preview</Button>
        </div>
      )}
    </div>
  );
}
