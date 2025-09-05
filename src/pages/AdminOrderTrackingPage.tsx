import { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { supabase } from "@/lib/supabaseClient";
import Spinner from "@/components/ui/Spinner";
import ErrorAlert from "@/components/ui/ErrorAlert";
import EmptyState from "@/components/ui/EmptyState";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

interface TrackedOrder {
  id: string;
  user_id: string;
  shipping_status: string;
  tracking_number: string;
  courier: string;
  estimated_delivery: string;
  created_at: string;
}

export default function AdminOrderTrackingPage() {
  const [trackingList, setTrackingList] = useState<TrackedOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchTracking();
  }, []);

  const fetchTracking = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("order_tracking")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) setError("Unable to load tracking data.");
    else setTrackingList(data || []);

    setLoading(false);
  };

  const filteredList = trackingList.filter((t) =>
    t.tracking_number.toLowerCase().includes(search.toLowerCase()) ||
    t.user_id.toLowerCase().includes(search.toLowerCase()) ||
    t.courier.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <Helmet>
        <title>Order Tracking | Admin</title>
        <meta name="description" content="View and manage shipment tracking details for orders." />
      </Helmet>

      <h1 className="text-3xl font-bold text-green-700 mb-6">Order Tracking</h1>

      <Input
        placeholder="Search by tracking number, user ID, or courier"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="mb-4"
      />

      {loading ? (
        <Spinner size="lg" />
      ) : error ? (
        <ErrorAlert message={error} />
      ) : filteredList.length === 0 ? (
        <EmptyState message="No matching tracking entries found." />
      ) : (
        <div className="space-y-4">
          {filteredList.map((entry) => (
            <div
              key={entry.id}
              className="p-4 border rounded bg-white dark:bg-gray-800 shadow-sm"
            >
              <p className="text-sm">
                <strong>Tracking No:</strong> {entry.tracking_number}
              </p>
              <p className="text-sm">
                <strong>Courier:</strong> {entry.courier} | <strong>Status:</strong> {entry.shipping_status}
              </p>
              <p className="text-sm">
                <strong>Est. Delivery:</strong> {entry.estimated_delivery}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                User: {entry.user_id} | Logged: {new Date(entry.created_at).toLocaleString()}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
