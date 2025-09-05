import { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { supabase } from "@/lib/supabaseClient";
import Spinner from "@/components/ui/Spinner";
import ErrorAlert from "@/components/ui/ErrorAlert";
import EmptyState from "@/components/ui/EmptyState";
import { Button } from "@/components/ui/Button";
import { formatPrice } from "@/utils/formatPrice";
import toast from "react-hot-toast";

interface Payout {
  id: string;
  amount: number;
  status: string;
  requested_at: string;
  processed_at?: string;
}

export default function MerchantPayoutRequests() {
  const [payouts, setPayouts] = useState<Payout[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined") fetchPayouts();
  }, []);

  const fetchPayouts = async () => {
    setLoading(true);
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();
    if (userError || !user) {
      setError("Authentication error");
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from("payout_requests")
      .select("*")
      .eq("merchant_id", user.id)
      .order("requested_at", { ascending: false });

    if (error) setError("Failed to fetch payout requests");
    else setPayouts(data || []);
    setLoading(false);
  };

  const requestNewPayout = async () => {
    const confirm = window.confirm("Do you want to request a new payout?");
    if (!confirm) return;
    const {
      data: { user },
    } = await supabase.auth.getUser();
    const { error } = await supabase
      .from("payout_requests")
      .insert([{ merchant_id: user?.id, amount: 0, status: "pending" }]);
    if (!error) {
      toast.success("Payout requested");
      fetchPayouts();
    } else toast.error("Failed to request payout");
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <Helmet>
        <title>Merchant Payouts | Cauverystore</title>
        <meta name="description" content="View and request payout for your earnings." />
      </Helmet>

      <h1 className="text-3xl font-bold text-green-700 mb-4">Payout Requests</h1>

      <Button onClick={requestNewPayout} className="mb-4">Request New Payout</Button>

      {loading ? (
        <Spinner size="lg" />
      ) : error ? (
        <ErrorAlert message={error} />
      ) : payouts.length === 0 ? (
        <EmptyState message="No payout requests yet." />
      ) : (
        <div className="overflow-x-auto border rounded">
          <table className="w-full text-sm">
            <thead className="bg-gray-100 dark:bg-gray-800">
              <tr>
                <th className="px-4 py-2 border">Amount</th>
                <th className="px-4 py-2 border">Status</th>
                <th className="px-4 py-2 border">Requested At</th>
                <th className="px-4 py-2 border">Processed At</th>
              </tr>
            </thead>
            <tbody>
              {payouts.map((p) => (
                <tr key={p.id} className="text-center">
                  <td className="px-4 py-2 border">{formatPrice(p.amount)}</td>
                  <td className="px-4 py-2 border">
                    <span
                      className={`text-xs px-2 py-1 rounded-full text-white ${
                        p.status === "processed"
                          ? "bg-green-600"
                          : p.status === "pending"
                          ? "bg-yellow-500"
                          : "bg-red-600"
                      }`}
                    >
                      {p.status}
                    </span>
                  </td>
                  <td className="px-4 py-2 border">{new Date(p.requested_at).toLocaleDateString()}</td>
                  <td className="px-4 py-2 border">
                    {p.processed_at ? new Date(p.processed_at).toLocaleDateString() : "-"}
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
