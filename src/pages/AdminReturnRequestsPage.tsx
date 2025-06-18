import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

interface ReturnRequest {
  id: string;
  order_id: number;
  user_id: string;
  request_type: string;
  reason: string;
  response_comment: string | null;
  status: string;
  submitted_at: string;
}

export default function AdminReturnRequestsPage() {
  const [requests, setRequests] = useState<ReturnRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("return_requests")
      .select("*")
      .order("submitted_at", { ascending: false });

    if (!error && data) setRequests(data);
    setLoading(false);
  };

  const updateStatus = async (id: string, status: string, comment: string) => {
    setSavingId(id);
    const { error } = await supabase
      .from("return_requests")
      .update({ status, response_comment: comment })
      .eq("id", id);

    if (!error) {
      alert("Request updated.");
      fetchRequests();
    } else {
      alert("Failed to update request.");
    }

    setSavingId(null);
  };

  return (
    <div className="max-w-5xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Return & Replace Requests</h1>
      {loading ? (
        <p>Loading...</p>
      ) : requests.length === 0 ? (
        <p>No return/replace requests yet.</p>
      ) : (
        <div className="space-y-6">
          {requests.map((req) => (
            <div
              key={req.id}
              className="border border-gray-300 rounded-lg p-4 shadow-sm bg-white"
            >
              <div className="mb-2">
                <strong>Order ID:</strong> {req.order_id}
              </div>
              <div className="mb-1">
                <strong>User ID:</strong> {req.user_id}
              </div>
              <div className="mb-1">
                <strong>Type:</strong> {req.request_type}
              </div>
              <div className="mb-1">
                <strong>Reason:</strong> {req.reason}
              </div>
              <div className="mb-2">
                <strong>Status:</strong>{" "}
                <span className="capitalize">{req.status}</span>
              </div>

              <label className="block mb-2 text-sm font-medium text-gray-700">
                Admin Response:
              </label>
              <textarea
                defaultValue={req.response_comment || ""}
             onBlur={(e) => {
  updateStatus(req.id, req.status, e.target.value);
}}
