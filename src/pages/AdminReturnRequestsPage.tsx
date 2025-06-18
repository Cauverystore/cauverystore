import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Helmet } from "react-helmet-async";

interface ReturnRequest {
  id: number;
  order_id: number;
  user_id: string;
  reason: string;
  status: string;
  created_at: string;
}

export default function AdminReturnRequestsPage() {
  const [requests, setRequests] = useState<ReturnRequest[]>([]);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    const { data, error } = await supabase
      .from("return_requests")
      .select("*")
      .order("created_at", { ascending: false });
    if (!error && data) setRequests(data);
  };

  const updateStatus = async (
    id: number,
    currentStatus: string,
    newStatus: string
  ) => {
    if (currentStatus === newStatus) return;
    const { error } = await supabase
      .from("return_requests")
      .update({ status: newStatus })
      .eq("id", id);
    if (!error) fetchRequests();
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <Helmet>
        <title>Return Requests | Admin Panel | Cauverystore</title>
        <meta
          name="description"
          content="Manage customer return and replacement requests for orders on Cauverystore."
        />
      </Helmet>
      <h1 className="text-2xl font-bold mb-6">Return & Replacement Requests</h1>
      {requests.length === 0 ? (
        <p className="text-gray-600">No return requests found.</p>
      ) : (
        <div className="space-y-4">
          {requests.map((req) => (
            <div
              key={req.id}
              className="bg-white border rounded p-4 shadow-sm space-y-1"
            >
              <p><strong>Order ID:</strong> {req.order_id}</p>
              <p><strong>User ID:</strong> {req.user_id}</p>
              <p><strong>Reason:</strong> {req.reason}</p>
              <p><strong>Status:</strong> {req.status}</p>
              <select
                className="border px-3 py-2 rounded mt-2"
                value={req.status}
                onChange={(e) =>
                  updateStatus(req.id, req.status, e.target.value)
                }
              >
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}