// src/pages/AdminReturnRequestsPage.tsx
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import toast from "react-hot-toast";
import PageHeader from "@/components/ui/PageHeader";
import Spinner from "@/components/ui/Spinner";
import Select from "@/components/ui/Select";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";

interface ReturnRequest {
  id: string;
  user_id: string;
  order_id: string;
  product_id: string;
  reason: string;
  type: "return" | "replace";
  status: "pending" | "approved" | "rejected";
  created_at: string;
  defect_image_url?: string;
  profiles?: {
    name?: string;
    email?: string;
  };
  products?: {
    name?: string;
    image_url?: string;
  };
}

const PAGE_SIZE = 10;

export default function AdminReturnRequestsPage() {
  const [requests, setRequests] = useState<ReturnRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    fetchRequests();
  }, [statusFilter, typeFilter, page]);

  const fetchRequests = async () => {
    setLoading(true);

    let query = supabase
      .from("return_requests")
      .select("*, profiles(name, email), products(name, image_url)")
      .order("created_at", { ascending: false })
      .range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1);

    if (statusFilter !== "all") query = query.eq("status", statusFilter);
    if (typeFilter !== "all") query = query.eq("type", typeFilter);

    const { data, error } = await query;

    if (error) {
      toast.error("Failed to fetch return requests.");
    } else {
      setRequests(page === 1 ? data || [] : [...requests, ...(data || [])]);
      setHasMore((data?.length || 0) === PAGE_SIZE);
    }

    setLoading(false);
  };

  const updateStatus = async (id: string, status: string) => {
    const { error } = await supabase
      .from("return_requests")
      .update({ status })
      .eq("id", id);

    if (error) {
      toast.error("Failed to update status.");
    } else {
      toast.success(`Marked as ${status}`);
      fetchRequests();
    }
  };

  const exportToCSV = () => {
    const csvContent = [
      [
        "Order ID",
        "User ID",
        "Name",
        "Email",
        "Product",
        "Type",
        "Status",
        "Reason",
        "Created At"
      ],
      ...requests.map((r) => [
        r.order_id,
        r.user_id,
        r.profiles?.name || "",
        r.profiles?.email || "",
        r.products?.name || "",
        r.type,
        r.status,
        r.reason,
        new Date(r.created_at).toLocaleString()
      ])
    ]
      .map((row) => row.map((v) => `"${v}"`).join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "return_requests.csv";
    link.click();
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <PageHeader
        title="Return & Replace Requests"
        subtitle="Review, approve, or reject customer return/replace requests"
      />

      <div className="flex flex-wrap justify-between gap-4 mb-6">
        <div className="flex gap-2">
          <Select
            value={statusFilter}
            onChange={(e) => {
              setPage(1);
              setRequests([]);
              setStatusFilter(e.target.value);
            }}
            options={[
              { label: "All Statuses", value: "all" },
              { label: "Pending", value: "pending" },
              { label: "Approved", value: "approved" },
              { label: "Rejected", value: "rejected" }
            ]}
          />
          <Select
            value={typeFilter}
            onChange={(e) => {
              setPage(1);
              setRequests([]);
              setTypeFilter(e.target.value);
            }}
            options={[
              { label: "All Types", value: "all" },
              { label: "Return", value: "return" },
              { label: "Replace", value: "replace" }
            ]}
          />
        </div>
        <Button onClick={exportToCSV} className="bg-green-600 text-white">
          Export to CSV
        </Button>
      </div>

      {loading && page === 1 ? (
        <div className="flex justify-center py-10">
          <Spinner />
        </div>
      ) : requests.length === 0 ? (
        <p className="text-gray-600">No return/replace requests found.</p>
      ) : (
        <ul className="space-y-6">
          {requests.map((r) => (
            <li key={r.id} className="border rounded p-4 bg-white shadow-sm">
              <div className="flex justify-between items-start">
                <div>
                  <div className="text-lg font-semibold">
                    {r.products?.name || "Product"} ({r.type})
                  </div>
                  <div className="text-sm text-gray-500">
                    Order: {r.order_id} • User: {r.profiles?.name || r.user_id}
                  </div>
                  <div className="text-xs text-gray-400">
                    Submitted: {new Date(r.created_at).toLocaleString()}
                  </div>
                  <p className="mt-2 text-sm whitespace-pre-line">{r.reason}</p>
                  {r.defect_image_url && (
                    <img
                      src={r.defect_image_url}
                      alt="Defect"
                      className="mt-3 max-h-48 border rounded"
                    />
                  )}
                </div>
                <div>
                  <Select
                    value={r.status}
                    onChange={(e) => updateStatus(r.id, e.target.value)}
                    options={[
                      { label: "Pending", value: "pending" },
                      { label: "Approved", value: "approved" },
                      { label: "Rejected", value: "rejected" }
                    ]}
                  />
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      {hasMore && (
        <div className="flex justify-center mt-6">
          <Button onClick={() => setPage((p) => p + 1)} className="bg-gray-200">
            Load More
          </Button>
        </div>
      )}
    </div>
  );
}
