import { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { supabase } from "@/lib/supabaseClient";
import Spinner from "@/components/ui/Spinner";
import ErrorAlert from "@/components/ui/ErrorAlert";
import EmptyState from "@/components/ui/EmptyState";
import { Button } from "@/components/ui/Button";
import toast from "react-hot-toast";

interface Subscription {
  id: string;
  user_id: string;
  plan: string;
  status: string;
  expires_at: string;
  created_at: string;
}

export default function AdminSubscriptionManager() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchSubscriptions();
  }, []);

  const fetchSubscriptions = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("subscriptions")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) setError("Failed to fetch subscriptions");
    else setSubscriptions(data || []);
    setLoading(false);
  };

  const cancelSubscription = async (id: string) => {
    const { error } = await supabase
      .from("subscriptions")
      .update({ status: "cancelled" })
      .eq("id", id);

    if (!error) {
      toast.success("Subscription cancelled");
      fetchSubscriptions();
    } else toast.error("Failed to cancel");
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <Helmet>
        <title>Admin Subscriptions | Cauverystore</title>
        <meta name="description" content="Manage all user subscriptions." />
      </Helmet>

      <h1 className="text-3xl font-bold mb-6 text-green-700">User Subscriptions</h1>

      {loading ? (
        <Spinner size="lg" />
      ) : error ? (
        <ErrorAlert message={error} />
      ) : subscriptions.length === 0 ? (
        <EmptyState message="No subscriptions found." />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm border">
            <thead className="bg-gray-100 dark:bg-gray-700">
              <tr>
                <th className="px-3 py-2 border">User ID</th>
                <th className="px-3 py-2 border">Plan</th>
                <th className="px-3 py-2 border">Status</th>
                <th className="px-3 py-2 border">Expires At</th>
                <th className="px-3 py-2 border">Created</th>
                <th className="px-3 py-2 border">Action</th>
              </tr>
            </thead>
            <tbody>
              {subscriptions.map((sub) => (
                <tr key={sub.id} className="text-center border-t">
                  <td className="px-3 py-2 border">{sub.user_id}</td>
                  <td className="px-3 py-2 border">{sub.plan}</td>
                  <td className="px-3 py-2 border">
                    <span
                      className={`text-xs px-2 py-1 rounded text-white ${
                        sub.status === "active" ? "bg-green-600" : "bg-red-600"
                      }`}
                    >
                      {sub.status}
                    </span>
                  </td>
                  <td className="px-3 py-2 border">
                    {new Date(sub.expires_at).toLocaleDateString()}
                  </td>
                  <td className="px-3 py-2 border">
                    {new Date(sub.created_at).toLocaleString()}
                  </td>
                  <td className="px-3 py-2 border">
                    {sub.status === "active" && (
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => cancelSubscription(sub.id)}
                      >
                        Cancel
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
