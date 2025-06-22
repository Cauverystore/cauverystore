// src/pages/AdminSupportDashboard.tsx
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import toast from "react-hot-toast";
import Spinner from "@/components/ui/Spinner";
import Textarea from "@/components/ui/Textarea";
import Button from "@/components/ui/Button";
import PageHeader from "@/components/ui/PageHeader";
import Select from "@/components/ui/Select";
import Input from "@/components/ui/Input";

interface SupportRequest {
  id: string;
  user_id: string;
  subject: string;
  message: string;
  order_id?: string;
  created_at: string;
  status: string;
  admin_replies: { message: string; created_at: string }[];
  profiles?: {
    name?: string;
    email?: string;
  };
}

const PAGE_SIZE = 10;

export default function AdminSupportDashboard() {
  const [requests, setRequests] = useState<SupportRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [replyMap, setReplyMap] = useState<{ [id: string]: string }>({});
  const [filterStatus, setFilterStatus] = useState("all");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    fetchRequests();
  }, [filterStatus, search, page]);

  const fetchRequests = async () => {
    setLoading(true);

    let query = supabase
      .from("support_requests")
      .select("*, profiles(name, email)")
      .order("created_at", { ascending: false })
      .range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1);

    if (filterStatus !== "all") query = query.eq("status", filterStatus);
    if (search.trim()) {
      query = query.or(`subject.ilike.%${search}%,order_id.ilike.%${search}%`);
    }

    const { data, error, count } = await query;

    if (error) {
      toast.error("Failed to fetch support requests.");
    } else {
      setRequests(page === 1 ? data || [] : [...requests, ...(data || [])]);
      setHasMore((data?.length || 0) === PAGE_SIZE);
    }

    setLoading(false);
  };

  const handleReply = async (id: string) => {
    const reply = replyMap[id];
    if (!reply.trim()) return;

    const { error } = await supabase.rpc("add_admin_reply", {
      request_id: id,
      reply_text: reply,
    });

    if (error) {
      toast.error("Failed to send reply.");
    } else {
      toast.success("Reply sent.");
      setReplyMap((prev) => ({ ...prev, [id]: "" }));
      fetchRequests();
    }
  };

  const updateStatus = async (id: string, status: string) => {
    const { error } = await supabase
      .from("support_requests")
      .update({ status })
      .eq("id", id);

    if (error) {
      toast.error("Failed to update status.");
    } else {
      toast.success(`Marked as ${status}`);
      fetchRequests();
    }
  };

  const handleExport = () => {
    const csvContent = [
      ["Subject", "Message", "Order ID", "User ID", "Name", "Email", "Status", "Created At"],
      ...requests.map((r) => [
        r.subject,
        r.message,
        r.order_id || "",
        r.user_id,
        r.profiles?.name || "",
        r.profiles?.email || "",
        r.status,
        new Date(r.created_at).toLocaleString(),
      ]),
    ].map((row) => row.map((v) => `"${v}"`).join(",")).join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "support_requests.csv";
    link.click();
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <PageHeader title="Admin Support Dashboard" subtitle="Manage all support tickets" />

      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center mb-6">
        <div className="flex gap-2 w-full sm:w-auto">
          <Input
            placeholder="Search by subject/order ID..."
            value={search}
            onChange={(e) => {
              setPage(1);
              setRequests([]);
              setSearch(e.target.value);
            }}
          />
          <Select
            value={filterStatus}
            onChange={(e) => {
              setPage(1);
              setRequests([]);
              setFilterStatus(e.target.value);
            }}
            options={[
              { label: "All", value: "all" },
              { label: "Open", value: "open" },
              { label: "In Progress", value: "in_progress" },
              { label: "Resolved", value: "resolved" },
            ]}
          />
        </div>
        <Button onClick={handleExport} className="bg-green-600 text-white">Export to CSV</Button>
      </div>

      {loading && page === 1 ? (
        <div className="flex justify-center py-10">
          <Spinner />
        </div>
      ) : requests.length === 0 ? (
        <p className="text-gray-600">No support requests found.</p>
      ) : (
        <ul className="space-y-6">
          {requests.map((req) => (
            <li key={req.id} className="border rounded p-4 bg-white shadow-sm">
              <div className="flex justify-between items-center">
                <div>
                  <div className="text-lg font-semibold">{req.subject}</div>
                  <div className="text-sm text-gray-500">
                    Order: {req.order_id || "N/A"} • User ID: {req.user_id}
                    {req.profiles?.name && ` • ${req.profiles.name}`}
                  </div>
                  <div className="text-xs text-gray-400">
                    Submitted: {new Date(req.created_at).toLocaleString()}
                  </div>
                </div>
                <span
                  className={`px-2 py-1 rounded text-white text-xs ${
                    req.status === "resolved"
                      ? "bg-green-600"
                      : req.status === "in_progress"
                      ? "bg-yellow-500"
                      : "bg-red-500"
                  }`}
                >
                  {req.status}
                </span>
              </div>

              <div className="mt-3 border-t pt-2">
                <div className="text-sm whitespace-pre-line">{req.message}</div>
                {req.admin_replies?.length > 0 && (
                  <div className="mt-4">
                    <h4 className="font-semibold mb-1 text-sm text-gray-700">Admin Replies:</h4>
                    <ul className="space-y-1 text-sm text-gray-800">
                      {req.admin_replies.map((reply, i) => (
                        <li key={i} className="bg-gray-50 p-2 rounded border text-sm">
                          {reply.message}
                          <div className="text-xs text-gray-500 mt-1">
                            {new Date(reply.created_at).toLocaleString()}
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              <div className="mt-4 space-y-2">
                <Textarea
                  placeholder="Write your reply..."
                  value={replyMap[req.id] || ""}
                  onChange={(e) =>
                    setReplyMap((prev) => ({ ...prev, [req.id]: e.target.value }))
                  }
                />
                <div className="flex items-center gap-3">
                  <Button onClick={() => handleReply(req.id)} className="bg-blue-600 text-white">
                    Send Reply
                  </Button>
                  <Select
                    value={req.status}
                    onChange={(e) => updateStatus(req.id, e.target.value)}
                    options={[
                      { label: "Open", value: "open" },
                      { label: "In Progress", value: "in_progress" },
                      { label: "Resolved", value: "resolved" },
                    ]}
                  />
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      {hasMore && (
        <div className="flex justify-center mt-6">
          <Button onClick={() => setPage((p) => p + 1)} className="bg-gray-200">
            Load More
          </Button>
        </div>
      )}
    </div>
  );
}
