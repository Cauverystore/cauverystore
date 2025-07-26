import { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { supabase } from "@/lib/supabaseClient";
import Spinner from "@/components/ui/Spinner";
import ErrorAlert from "@/components/ui/ErrorAlert";
import EmptyState from "@/components/ui/EmptyState";
import { Button } from "@/components/ui/Button";

interface InvoiceRequest {
  id: string;
  order_id: string;
  user_id: string;
  status: "pending" | "generated";
  created_at: string;
}

export default function AdminInvoiceRequestPage() {
  const [requests, setRequests] = useState<InvoiceRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("invoice_requests")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) setError("Unable to load invoice requests");
    else setRequests(data || []);

    setLoading(false);
  };

  const markAsGenerated = async (id: string) => {
    const { error } = await supabase
      .from("invoice_requests")
      .update({ status: "generated" })
      .eq("id", id);
    if (!error) fetchRequests();
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <Helmet>
        <title>Invoice Requests | Admin</title>
        <meta name="description" content="Manage invoice generation requests from users." />
      </Helmet>

      <h1 className="text-3xl font-bold text-green-700 mb-6">Invoice Requests</h1>

      {loading ? (
        <Spinner size="lg" />
      ) : error ? (
        <ErrorAlert message={error} />
      ) : requests.length === 0 ? (
        <EmptyState message="No invoice requests found." />
      ) : (
        <div className="space-y-4">
          {requests.map((req) => (
            <div
              key={req.id}
              className="p-4 border rounded bg-white dark:bg-gray-800 shadow-sm"
            >
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm text-gray-800">
                    Order: <span className="font-medium">{req.order_id}</span>
                  </p>
                  <p className="text-sm text-gray-600 mt-1">User ID: {req.user_id}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    Requested on {new Date(req.created_at).toLocaleString()}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`text-xs px-2 py-1 rounded font-medium text-white ${
                      req.status === "pending" ? "bg-yellow-600" : "bg-green-600"
                    }`}
                  >
                    {req.status}
                  </span>
                  {req.status === "pending" && (
                    <Button size="sm" onClick={() => markAsGenerated(req.id)}>
                      Mark as Generated
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
