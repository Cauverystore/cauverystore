import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useAuth } from "@/components/AuthProvider";
import { Link } from "react-router-dom";

export default function ReturnRequestsPage() {
  const { user } = useAuth();
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) fetchRequests();
  }, [user]);

  const fetchRequests = async () => {
    const { data, error } = await supabase
      .from("return_requests")
      .select(`*, order:order_id(created_at), items:order_items(quantity, product:product_id(name, image_url))`)
      .eq("user_id", user?.id)
      .order("created_at", { ascending: false });

    if (!error) setRequests(data || []);
    setLoading(false);
  };

  if (loading) return <div className="p-4">Loading return requests...</div>;

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold text-green-700 mb-6">My Return / Replace Requests</h2>

      {requests.length === 0 ? (
        <p>No return or replacement requests found.</p>
      ) : (
        <div className="space-y-6">
          {requests.map((req) => (
            <div key={req.id} className="border p-4 rounded bg-white shadow-sm">
              <p className="text-sm text-gray-500 mb-1">
                Order ID: <span className="font-mono">{req.order_id}</span>
              </p>
              <p className="text-sm text-gray-500 mb-1">
                Request Date: {new Date(req.created_at).toLocaleString()}
              </p>
              <p className="text-sm text-gray-800 mb-2">
                Reason: <span className="font-medium">{req.reason}</span>
              </p>
              {req.image_url && (
                <div className="mb-2">
                  <img src={req.image_url} alt="Return" className="w-32 rounded border" />
                </div>
              )}
              <div className="text-sm space-y-1">
                {req.items?.map((item: any, idx: number) => (
                  <div key={idx} className="flex gap-2 items-center">
                    <img src={item.product.image_url} alt={item.product.name} className="w-10 h-10 object-cover rounded" />
                    <span>{item.product.name} × {item.quantity}</span>
                  </div>
                ))}
              </div>
              <div className="mt-2 text-sm">
                Status: {req.status ? (
                  <span className={`font-medium ${
                    req.status === 'approved' ? 'text-green-600' :
                    req.status === 'rejected' ? 'text-red-600' :
                    'text-yellow-600'
                  }`}>{req.status}</span>
                ) : <span className="text-yellow-600 font-medium">Pending</span>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
