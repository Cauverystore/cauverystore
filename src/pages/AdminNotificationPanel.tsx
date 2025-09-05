// src/pages/AdminNotificationPanel.tsx
import { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { supabase } from "@/lib/supabaseClient";
import { formatDistanceToNow } from "date-fns";
import Spinner from "@/components/ui/Spinner";
import Button from "@/components/ui/Button";
import ErrorAlert from "@/components/ui/ErrorAlert";
import toast from "react-hot-toast";

interface Notification {
  id: string;
  type: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

export default function AdminNotificationPanel() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    checkAdminRole();
    fetchNotifications();
    const channel = supabase
      .channel("admin-notifications")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "notifications" },
        () => fetchNotifications()
      )
      .subscribe();
    return () => supabase.removeChannel(channel);
  }, []);

  const checkAdminRole = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user?.id)
      .single();

    if (profile?.role !== "admin") {
      toast.error("Access denied");
      window.location.href = "/";
    }
  };

  const fetchNotifications = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("notifications")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(100);
    if (error) setError("Failed to load notifications");
    else setNotifications(data || []);
    setLoading(false);
  };

  const markAsRead = async (id: string) => {
    const { error } = await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("id", id);
    if (!error) fetchNotifications();
  };

  const deleteNotification = async (id: string) => {
    const { error } = await supabase.from("notifications").delete().eq("id", id);
    if (!error) {
      toast.success("Deleted");
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    }
  };

  const markAllAsRead = async () => {
    const { error } = await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("is_read", false);
    if (!error) fetchNotifications();
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <Helmet>
        <title>Admin Notifications | Cauverystore</title>
        <meta name="description" content="View and manage platform alerts and messages." />
      </Helmet>

      <h1 className="text-3xl font-bold text-green-700 mb-4">🔔 Admin Notifications</h1>

      <div className="flex justify-end gap-3 mb-4">
        <Button onClick={markAllAsRead}>Mark All as Read</Button>
      </div>

      {loading ? (
        <Spinner size="lg" />
      ) : error ? (
        <ErrorAlert message={error} />
      ) : notifications.length === 0 ? (
        <p>No notifications found.</p>
      ) : (
        <ul className="space-y-3">
          {notifications.map((note) => (
            <li
              key={note.id}
              className={`border p-4 rounded shadow-sm flex justify-between items-start gap-4 transition ${
                note.is_read ? "bg-white dark:bg-gray-900" : "bg-yellow-50 dark:bg-yellow-900"
              }`}
            >
              <div className="flex-1">
                <p className="font-medium">
                  [{note.type}] {note.message}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {formatDistanceToNow(new Date(note.created_at), { addSuffix: true })}
                </p>
              </div>
              <div className="flex gap-2">
                {!note.is_read && (
                  <Button size="sm" variant="outline" onClick={() => markAsRead(note.id)}>
                    Mark Read
                  </Button>
                )}
                <Button size="sm" variant="destructive" onClick={() => deleteNotification(note.id)}>
                  Delete
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
