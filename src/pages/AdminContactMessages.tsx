// src/pages/AdminContactMessages.tsx
import { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { supabase } from "@/lib/supabaseClient";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import Spinner from "@/components/ui/Spinner";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Textarea from "@/components/ui/Textarea";
import Modal from "@/components/ui/Modal";
import ErrorAlert from "@/components/ui/ErrorAlert";
import PageHeader from "@/components/ui/PageHeader";
import { formatDistanceToNow } from "date-fns";

interface ContactMessage {
  id: string;
  email: string;
  subject: string;
  message: string;
  created_at: string;
  is_read: boolean;
  admin_reply?: string;
  notes?: string;
}

export default function AdminContactMessages() {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null);
  const [replyText, setReplyText] = useState("");
  const [notesMap, setNotesMap] = useState<Record<string, string>>({});
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState("all");
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const navigate = useNavigate();

  useEffect(() => {
    const checkAccess = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      const role = session?.user?.user_metadata?.role;
      if (role !== "admin") navigate("/unauthorized");
    };
    checkAccess();
  }, []);

  useEffect(() => {
    fetchMessages();
    const channel = supabase
      .channel("contact-updates")
      .on("postgres_changes", { event: "*", schema: "public", table: "contact_messages" }, fetchMessages)
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchMessages = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("contact_messages")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      setError("Failed to fetch contact messages.");
      return;
    }

    setMessages(data || []);
    setLoading(false);
  };

  const handleReply = async () => {
    if (!selectedMessage || !replyText.trim()) return;

    const { error } = await supabase
      .from("contact_messages")
      .update({ admin_reply: replyText, is_read: true })
      .eq("id", selectedMessage.id);

    if (!error) {
      await fetch("/api/email/reply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: selectedMessage.email,
          subject: `Re: ${selectedMessage.subject}`,
          message: replyText,
          contact_id: selectedMessage.id,
        }),
      });
      toast.success("Reply saved and email sent.");
      setReplyText("");
      setModalOpen(false);
      fetchMessages();
    } else {
      toast.error("Failed to send reply.");
    }
  };

  const handleDelete = async (ids: string[]) => {
    const { error } = await supabase.from("contact_messages").delete().in("id", ids);
    if (!error) {
      toast.success("Deleted");
      setSelectedIds(new Set());
      fetchMessages();
    } else {
      toast.error("Delete failed");
    }
  };

  const markAsRead = async () => {
    const { error } = await supabase
      .from("contact_messages")
      .update({ is_read: true })
      .in("id", Array.from(selectedIds));
    if (!error) {
      toast.success("Marked as read");
      setSelectedIds(new Set());
      fetchMessages();
    }
  };

  const handleExportServerCSV = async () => {
    try {
      const res = await fetch(
        "https://smwtliaoqgscyeppidvz.supabase.co/functions/v1/export-contact-logs",
        {
          method: "POST",
          headers: {
            Authorization: "Bearer YOUR_SUPABASE_SERVICE_ROLE_KEY", // Replace with env in production
            "Content-Type": "application/json",
          },
        }
      );
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || "Export failed");
      toast.success("Exported to Supabase Storage");
    } catch (err: any) {
      toast.error("Export failed: " + err.message);
    }
  };

  const filteredMessages = messages.filter((msg) =>
    (filter === "unread" ? !msg.is_read : true) &&
    (msg.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      msg.subject.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const unreadCount = messages.filter((msg) => !msg.is_read).length;
  const repliedCount = messages.filter((msg) => msg.admin_reply).length;

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <Helmet>
        <title>Admin Contact Messages | Cauverystore</title>
        <meta name="description" content="View and manage contact form messages sent to Cauverystore." />
        <script async src="https://www.googletagmanager.com/gtag/js?id=G-3KRHXGB7JV"></script>
        <script>{`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', 'G-3KRHXGB7JV');
        `}</script>
      </Helmet>

      <PageHeader title="Contact Messages" subtitle={`Unread: ${unreadCount} | Replied: ${repliedCount}`} />

      <div className="flex flex-wrap gap-3 mb-4">
        <Input placeholder="Search..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
        <Select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          options={[
            { value: "all", label: "All" },
            { value: "unread", label: "Unread Only" },
          ]}
        />
        <Button onClick={handleExportServerCSV}>📤 Export to Storage</Button>
        {selectedIds.size > 0 && (
          <>
            <Button onClick={() => handleDelete(Array.from(selectedIds))}>Delete Selected</Button>
            <Button onClick={markAsRead}>Mark Read</Button>
          </>
        )}
      </div>

      {loading ? (
        <Spinner size="lg" />
      ) : error ? (
        <ErrorAlert message={error} />
      ) : (
        <div className="grid gap-4">
          {filteredMessages.map((msg) => (
            <div key={msg.id} className="border p-4 rounded shadow bg-white dark:bg-gray-800">
              <div className="flex justify-between items-start">
                <div className="flex gap-2 items-start">
                  <input
                    type="checkbox"
                    checked={selectedIds.has(msg.id)}
                    onChange={() => {
                      const newSet = new Set(selectedIds);
                      newSet.has(msg.id) ? newSet.delete(msg.id) : newSet.add(msg.id);
                      setSelectedIds(newSet);
                    }}
                  />
                  <div>
                    <p className="font-medium text-green-700">{msg.subject}</p>
                    <p className="text-sm">{msg.email}</p>
                    <p className="text-xs text-gray-400">
                      {formatDistanceToNow(new Date(msg.created_at))} ago
                    </p>
                    <p className="text-xs">
                      {msg.is_read ? "✅ Read" : "❌ Unread"}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button onClick={() => { setSelectedMessage(msg); setModalOpen(true); }}>Reply</Button>
                  <Button variant="danger" onClick={() => handleDelete([msg.id])}>Delete</Button>
                </div>
              </div>
              <p className="mt-2 text-sm">{msg.message}</p>
              {msg.admin_reply && (
                <div className="mt-2 p-2 bg-green-50 dark:bg-green-900 rounded text-sm">
                  <strong>Reply:</strong> {msg.admin_reply}
                </div>
              )}
              <Textarea
                placeholder="Notes (optional)..."
                value={notesMap[msg.id] || ""}
                onChange={(e) => setNotesMap({ ...notesMap, [msg.id]: e.target.value })}
              />
            </div>
          ))}
        </div>
      )}

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Reply to Message">
        <Textarea
          value={replyText}
          onChange={(e) => setReplyText(e.target.value)}
          placeholder="Type your reply here..."
        />
        <div className="mt-4 flex justify-end">
          <Button onClick={handleReply}>Send Reply</Button>
        </div>
      </Modal>
    </div>
  );
}
