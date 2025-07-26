// src/pages/MerchantSupportDashboard.tsx
import { useEffect, useState, useRef } from "react";
import { Helmet } from "react-helmet-async";
import { supabase } from "@/lib/supabaseClient";
import Spinner from "@/components/ui/Spinner";
import ErrorAlert from "@/components/ui/ErrorAlert";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import toast from "react-hot-toast";
import jsPDF from "jspdf";
import { Download } from "lucide-react";
import { format } from "date-fns";

interface Message {
  id: string;
  sender: "merchant" | "admin";
  message: string;
  created_at: string;
  request_id: string;
}

interface Request {
  id: string;
  subject: string;
  status: "pending" | "responded" | "resolved";
  created_at: string;
}

export default function MerchantSupportDashboard() {
  const [requests, setRequests] = useState<Request[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [activeRequest, setActiveRequest] = useState<Request | null>(null);
  const [newMsg, setNewMsg] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchRequests();

    const channel = supabase
      .channel("merchant_support_live")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "support_messages" }, (payload) => {
        const msg = payload.new as Message;
        if (msg.request_id === activeRequest?.id) {
          setMessages((prev) => [...prev, msg]);
        }
      })
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, [activeRequest]);

  useEffect(() => {
    if (activeRequest) fetchMessages(activeRequest.id);
  }, [activeRequest]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const fetchRequests = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    const { data, error } = await supabase
      .from("support_requests")
      .select("*")
      .eq("user_id", user?.id)
      .order("created_at", { ascending: false });
    if (error) setError("Failed to fetch support tickets");
    else setRequests(data || []);
    setLoading(false);
  };

  const fetchMessages = async (requestId: string) => {
    const { data, error } = await supabase
      .from("support_messages")
      .select("*")
      .eq("request_id", requestId)
      .order("created_at", { ascending: true });
    if (!error) setMessages(data || []);
  };

  const sendMessage = async () => {
    if (!newMsg.trim() || !activeRequest) return;

    const { data: { user } } = await supabase.auth.getUser();
    const { error } = await supabase.from("support_messages").insert([
      {
        request_id: activeRequest.id,
        sender: "merchant",
        message: newMsg.trim(),
        user_id: user?.id,
      },
    ]);

    if (!error) {
      toast.success("Message sent");
      setNewMsg("");

      // ✅ GA4 tracking
      if (typeof window !== "undefined" && window.gtag) {
        window.gtag("event", "merchant_support_reply_sent", {
          support_request_id: activeRequest.id,
          sender: "merchant",
        });
      }
    } else {
      toast.error("Failed to send message");
    }
  };

  const markAsResolved = async (id: string) => {
    const { error } = await supabase
      .from("support_requests")
      .update({ status: "resolved" })
      .eq("id", id);
    if (!error) {
      toast.success("Marked as resolved");
      fetchRequests();
    } else toast.error("Failed to mark as resolved");
  };

  const exportThreadPDF = () => {
    if (!activeRequest) return;
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text(`Support Thread - ${activeRequest.subject}`, 10, 20);
    doc.setFontSize(12);
    messages.forEach((m, i) => {
      const prefix = m.sender === "merchant" ? "You: " : "Admin: ";
      doc.text(`${prefix}${m.message}`, 10, 30 + i * 10);
    });
    doc.save(`merchant-thread-${activeRequest.id}.pdf`);
  };

  const filteredRequests = filterStatus === "all"
    ? requests
    : requests.filter((r) => r.status === filterStatus);

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <Helmet>
        <title>Merchant Support Dashboard | Cauverystore</title>
        <meta name="description" content="Manage support conversations with admin team." />
      </Helmet>

      <h1 className="text-3xl font-bold text-green-700 mb-4">🛠️ Merchant Support Dashboard</h1>

      <div className="mb-4 flex gap-2">
        <Input
          className="w-full sm:w-72"
          placeholder="Filter by status..."
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          list="status-options"
        />
        <datalist id="status-options">
          <option value="all" />
          <option value="pending" />
          <option value="responded" />
          <option value="resolved" />
        </datalist>
      </div>

      {loading ? (
        <Spinner size="lg" />
      ) : error ? (
        <ErrorAlert message={error} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Sidebar */}
          <div className="border rounded p-3 bg-white dark:bg-gray-800 max-h-[600px] overflow-y-auto">
            <h2 className="font-semibold mb-2">🎫 Your Tickets</h2>
            <ul className="space-y-2">
              {filteredRequests.map((req) => (
                <li
                  key={req.id}
                  onClick={() => setActiveRequest(req)}
                  className={`cursor-pointer p-2 rounded border ${
                    activeRequest?.id === req.id ? "bg-green-50 border-green-600" : ""
                  }`}
                >
                  <p className="font-medium">{req.subject}</p>
                  <p className="text-xs text-gray-500">{new Date(req.created_at).toLocaleDateString()}</p>
                  <p className="text-xs text-gray-700 capitalize">Status: {req.status}</p>
                </li>
              ))}
            </ul>
          </div>

          {/* Thread */}
          <div className="md:col-span-2 border rounded p-4 bg-white dark:bg-gray-900">
            {activeRequest ? (
              <>
                <div className="flex justify-between items-center mb-2">
                  <h2 className="font-semibold">📨 Conversation</h2>
                  <div className="flex gap-2">
                    {activeRequest.status !== "resolved" && (
                      <Button size="sm" onClick={() => markAsResolved(activeRequest.id)}>
                        ✅ Mark Resolved
                      </Button>
                    )}
                    <Button variant="outline" size="sm" onClick={exportThreadPDF}>
                      <Download className="w-4 h-4 mr-1" />
                      Export PDF
                    </Button>
                  </div>
                </div>

                <div className="h-[400px] overflow-y-auto space-y-3 p-2 bg-gray-50 dark:bg-gray-800 rounded">
                  {messages.map((m) => (
                    <div
                      key={m.id}
                      className={`p-3 rounded max-w-xs text-sm ${
                        m.sender === "merchant"
                          ? "bg-green-100 ml-auto text-right"
                          : "bg-gray-100 mr-auto text-left"
                      }`}
                    >
                      <div className="font-semibold">{m.sender === "merchant" ? "You" : "Admin"}</div>
                      <div>{m.message}</div>
                      <p className="text-[10px] text-gray-500 mt-1">
                        {format(new Date(m.created_at), "PPpp")}
                      </p>
                    </div>
                  ))}
                  <div ref={bottomRef} />
                </div>

                <div className="mt-4 flex gap-2 sticky bottom-0 bg-white dark:bg-gray-900 py-2">
                  <Input
                    placeholder="Type a message..."
                    value={newMsg}
                    onChange={(e) => setNewMsg(e.target.value)}
                  />
                  <Button onClick={sendMessage}>Send</Button>
                </div>
              </>
            ) : (
              <p className="text-gray-600">Select a ticket to view messages.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
