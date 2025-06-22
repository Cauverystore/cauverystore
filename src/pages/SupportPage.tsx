// src/pages/SupportPage.tsx
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useLocation, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import Spinner from "@/components/ui/Spinner";
import Input from "@/components/ui/Input";
import Textarea from "@/components/ui/Textarea";
import Button from "@/components/ui/Button";
import PageHeader from "@/components/ui/PageHeader";

interface SupportRequest {
  id: string;
  subject: string;
  message: string;
  order_id?: string;
  created_at: string;
}

export default function SupportPage() {
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [orderId, setOrderId] = useState<string | null>(null);
  const [requests, setRequests] = useState<SupportRequest[]>([]);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const orderIdParam = urlParams.get("order_id");
    if (orderIdParam) {
      setOrderId(orderIdParam);
    }

    fetchSupportRequests();
  }, [location.search]);

  const fetchSupportRequests = async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      toast.error("Please log in to view your support requests.");
      navigate("/login");
      return;
    }

    const { data, error } = await supabase
      .from("support_requests")
      .select("*")
      .eq("user_id", session.user.id)
      .order("created_at", { ascending: false });

    if (error) {
      toast.error("Failed to load support requests.");
    } else {
      setRequests(data || []);
    }

    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!subject || !message) {
      toast.error("Please fill out all required fields.");
      return;
    }

    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      toast.error("You must be logged in to submit a request.");
      return;
    }

    const { error } = await supabase.from("support_requests").insert({
      user_id: session.user.id,
      order_id: orderId,
      subject,
      message,
    });

    if (error) {
      toast.error("Failed to submit support request.");
    } else {
      toast.success("Support request submitted.");
      setSubject("");
      setMessage("");
      fetchSupportRequests(); // refresh list
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6">
      <PageHeader
        title="Support"
        subtitle="Reach out for help or report an issue."
      />

      <form
        onSubmit={handleSubmit}
        className="bg-white rounded shadow p-6 space-y-4 mt-6"
      >
        {orderId && (
          <div className="text-sm text-gray-600">
            Linked to order ID: <strong>{orderId}</strong>
          </div>
        )}

        <Input
          label="Subject"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          required
        />

        <Textarea
          label="Message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          required
        />

        <Button type="submit" className="bg-blue-600 text-white px-6 py-2">
          Submit Request
        </Button>
      </form>

      <div className="mt-10">
        <h3 className="text-xl font-semibold mb-4">Your Previous Requests</h3>
        {loading ? (
          <div className="flex justify-center py-6">
            <Spinner />
          </div>
        ) : requests.length === 0 ? (
          <p className="text-gray-600">No support requests submitted yet.</p>
        ) : (
          <ul className="space-y-4">
            {requests.map((req) => (
              <li key={req.id} className="border rounded p-4 bg-gray-50">
                <div className="font-medium">{req.subject}</div>
                <div className="text-sm text-gray-600 mt-1 whitespace-pre-line">
                  {req.message}
                </div>
                {req.order_id && (
                  <div className="text-sm text-gray-500 mt-2">
                    Linked Order ID: <strong>{req.order_id}</strong>
                  </div>
                )}
                <div className="text-xs text-gray-400 mt-1">
                  Submitted on: {new Date(req.created_at).toLocaleString()}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
