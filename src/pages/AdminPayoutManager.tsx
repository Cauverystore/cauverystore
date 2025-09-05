import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import Spinner from "@/components/ui/Spinner";
import PageHeader from "@/components/ui/PageHeader";
import LabeledSelect from "@/components/ui/LabeledSelect";
import toast from "react-hot-toast";
import { Helmet } from "react-helmet-async";
import { Button } from "@/components/ui/Button";

interface PayoutRequest {
  id: string;
  merchant_id: string;
  amount: number;
  status: "pending" | "approved" | "rejected";
  created_at: string;
  merchant_profile?: {
    name: string;
    email: string;
  };
}

const AdminPayoutManager = () => {
  const [requests, setRequests] = useState<PayoutRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("payout_requests")
      .select("*, merchant_profile:profiles(name, email)")
      .order("created_at", { ascending: false });

    if (error) {
      toast.error("Failed to load payout requests");
    } else {
      setRequests(data || []);
    }
    setLoading(false);
  };

  const updateStatus = async (id: string, newStatus: string) => {
    setUpdating(id);
    const { error } = await supabase
      .from("payout_requests")
      .update({ status: newStatus })
      .eq("id", id);

    if (error) {
      toast.error("Failed to update status");
    } else {
      toast.success("Status updated");
      fetchRequests();
    }
    setUpdating(null);
  };

  return (
    <>
      <Helmet>
        <title>Admin | Payout Manager</title>
        <meta name="description" content="Manage merchant payout requests on Cauverystore" />
      </Helmet>

      <PageHeader title="Payout Requests" description="Manage merchant payouts" />

      {loading ? (
        <div className="flex justify-center my-10">
          <Spinner />
        </div>
      ) : requests.length === 0 ? (
        <p className="text-center text-gray-500 mt-10">No payout requests available.</p>
      ) : (
        <div className="overflow-x-auto p-2">
          <table className="min-w-full bg-white border rounded shadow-sm">
            <thead>
              <tr className="bg-gray-100 text-left text-sm font-medium">
                <th className="p-3">Merchant</th>
                <th className="p-3">Email</th>
                <th className="p-3">Amount</th>
                <th className="p-3">Status</th>
                <th className="p-3">Requested On</th>
                <th className="p-3">Action</th>
              </tr>
            </thead>
            <tbody>
              {requests.map((req) => (
                <tr key={req.id} className="border-t text-sm">
                  <td className="p-3">{req.merchant_profile?.name || "—"}</td>
                  <td className="p-3">{req.merchant_profile?.email || "—"}</td>
                  <td className="p-3">₹{req.amount}</td>
                  <td className="p-3 capitalize">
                    <span
                      className={`inline-block px-2 py-1 text-xs rounded ${
                        req.status === "pending"
                          ? "bg-yellow-100 text-yellow-800"
                          : req.status === "approved"
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {req.status}
                    </span>
                  </td>
                  <td className="p-3">
                    {new Date(req.created_at).toLocaleString("en-IN", {
                      dateStyle: "medium",
                      timeStyle: "short",
                    })}
                  </td>
                  <td className="p-3">
                    <div className="flex items-center gap-2">
                      <LabeledSelect
                        value={req.status}
                        onChange={(e) => updateStatus(req.id, e.target.value)}
                        disabled={updating === req.id}
                      >
                        <option value="pending">Pending</option>
                        <option value="approved">Approved</option>
                        <option value="rejected">Rejected</option>
                      </LabeledSelect>
                      <Button
                        size="sm"
                        onClick={() => updateStatus(req.id, req.status)}
                        disabled={updating === req.id}
                      >
                        {updating === req.id ? "Updating..." : "Save"}
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
};

export default AdminPayoutManager;
