// --- SupportRequestsPage.tsx ---

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Helmet } from "react-helmet-async";

interface SupportRequest {
  id: number;
  order_id: number;
  user_id: string;
  message: string;
  created_at: string;
}

export default function SupportRequestsPage() {
  const [requests, setRequests] = useState<SupportRequest[]>([]);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    const { data, error } = await supabase
      .from("support_requests")
      .select("*")
      .order("created_at", { ascending: false });
    if (!error && data) setRequests(data);
  };

  return (
    <div className="max-w-5xl mx-auto p-6">
      <Helmet>
        <title>Support Requests | Cauverystore</title>
        <meta
          name="description"
          content="Customer support queries and assistance for Cauverystore orders."
        />
      </Helmet>
      <h1 className="text-2xl font-bold mb-6">Customer Support Requests</h1>
      {requests.map((req) => (
        <div key={req.id} className="border rounded p-4 bg-white mb-4">
          <p><strong>Order ID:</strong> {req.order_id}</p>
          <p><strong>User ID:</strong> {req.user_id}</p>
          <p><strong>Message:</strong> {req.message}</p>
          <p><strong>Created At:</strong> {new Date(req.created_at).toLocaleString()}</p>
        </div>
      ))}
    </div>
  );
}
