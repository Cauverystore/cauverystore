// src/pages/AdminSupportRequestsPage.tsx

import { useEffect, useState } from "react";
import { getSupportRequests, updateSupportRequestStatus } from "@/api/admin";
import { SupportRequest } from "@/types";

export default function AdminSupportRequestsPage() {
  const [requests, setRequests] = useState<SupportRequest[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const data = await getSupportRequests();
      setRequests(data);
    };
    fetchData();
  }, []);

  const updateStatus = async (id: number, currentStatus: string, newStatus: string) => {
    if (newStatus !== currentStatus) {
      await updateSupportRequestStatus(id, newStatus);
      setRequests((prev) =>
        prev.map((req) =>
          req.id === id ? { ...req, status: newStatus } : req
        )
      );
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Support Requests</h2>
      {requests.map((req) => (
        <div key={req.id} className="border p-4 rounded shadow mb-3">
          <p><strong>User:</strong> {req.user_email}</p>
          <p><strong>Message:</strong> {req.message}</p>
          <p><strong>Status:</strong> {req.status}</p>
          <select
            className="mt-2 p-1 border"
            defaultValue={req.status}
            onBlur={(e) => updateStatus(req.id, req.status, e.target.value)}
          >
            <option value="pending">Pending</option>
            <option value="resolved">Resolved</option>
            <option value="dismissed">Dismissed</option>
          </select>
        </div>
      ))}
    </div>
  );
}
