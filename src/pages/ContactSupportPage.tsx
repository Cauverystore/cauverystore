// src/pages/ContactSupportPage.tsx
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

export default function ContactSupportPage() {
  const [message, setMessage] = useState("");
  const [subject, setSubject] = useState("");
  const [userId, setUserId] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    getUser();
  }, []);

  const getUser = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return navigate("/login");
    setUserId(user.id);
  };

  const handleSubmit = async () => {
    if (!subject.trim() || !message.trim()) {
      toast.error("Subject and message are required");
      return;
    }

    const { error } = await supabase.from("support_requests").insert({
      user_id: userId,
      subject,
      message,
    });

    if (!error) {
      toast.success("Support request sent!");
      setSubject("");
      setMessage("");
    } else {
      toast.error("Failed to send request");
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6 min-h-screen">
      <h1 className="text-2xl font-bold text-green-700 mb-6">Contact Support</h1>

      <div className="space-y-4 bg-white dark:bg-gray-900 p-6 rounded-lg shadow">
        <div>
          <label className="block font-semibold mb-1">Subject</label>
          <input
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="e.g. Issue with order, general query..."
            className="w-full border px-4 py-2 rounded"
          />
        </div>
        <div>
          <label className="block font-semibold mb-1">Message</label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Describe your issue or query..."
            rows={6}
            className="w-full border px-4 py-2 rounded"
          ></textarea>
        </div>
        <button
          onClick={handleSubmit}
          className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700"
        >
          Submit Request
        </button>
      </div>
    </div>
  );
}
