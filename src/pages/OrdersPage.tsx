// src/pages/OrdersPage.tsx

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { format, differenceInDays } from "date-fns";
import { jsPDF } from "jspdf";

interface Order {
  id: number;
  product_name: string;
  quantity: number;
  total_price: number;
  status?: string;
  created_at: string;
  tracking_id?: string;
  tracking_status?: string;
  courier_service?: string;
  estimated_delivery_date?: string;
  user_id?: string;
  delivery_address?: string;
  discount_applied?: number;
  email?: string;
}

const statusColorMap: Record<string, string> = {
  pending: "bg-yellow-200 text-yellow-800",
  shipped: "bg-blue-200 text-blue-800",
  out_for_delivery: "bg-purple-200 text-purple-800",
  delivered: "bg-green-200 text-green-800",
  cancelled: "bg-red-200 text-red-800",
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState<number | null>(null);
  const [requestModal, setRequestModal] = useState<null | number>(null);
  const [requestType, setRequestType] = useState("return");
  const [requestReason, setRequestReason] = useState("");
  const [requestComment, setRequestComment] = useState("");
  const [submittingRequest, setSubmittingRequest] = useState(false);
  const [resendingId, setResendingId] = useState<number | null>(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false });

    if (!data || error) {
      console.error("Error fetching orders:", error?.message);
    } else {
      setOrders(data);
    }
    setLoading(false);
  };

  const cancelOrder = async (orderId: number) => {
    setCancellingId(orderId);
    const { error } = await supabase
      .from("orders")
      .update({ tracking_status: "cancelled" })
      .eq("id", orderId);

    if (!error) {
      alert("Order cancelled successfully.");
      fetchOrders();
    } else {
      alert("Failed to cancel order.");
    }
    setCancellingId(null);
  };

  const submitReturnRequest = async (order: Order) => {
    if (!requestReason.trim()) return alert("Please enter a reason.");
    setSubmittingRequest(true);

    const { error } = await supabase.from("return_requests").insert({
      order_id: order.id,
      user_id: order.user_id,
      request_type: requestType,
      reason: requestReason,
      response_comment: requestComment,
    });

    if (!error) {
      alert("Your request has been submitted.");
      setRequestModal(null);
      setRequestReason("");
      setRequestComment("");
    } else {
      alert("Error submitting request.");
    }
    setSubmittingRequest(false);
  };

  const downloadInvoice = (order: Order) => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text("Invoice", 20, 20);
    doc.setFontSize(12);
    doc.text(`Order ID: ${order.id}`, 20, 35);
    doc.text(`Product: ${order.product_name}`, 20, 45);
    doc.text(`Quantity: ${order.quantity}`, 20, 55);
    doc.text(`Price: ₹${order.total_price}`, 20, 65);
    doc.text(`Discount: ₹${order.discount_applied || 0}`, 20, 75);
    doc.text(`Total: ₹${order.total_price - (order.discount_applied || 0)}`, 20, 85);
    doc.text(`Ordered On: ${format(new Date(order.created_at), "dd MMM yyyy")}`, 20, 95);
    doc.save(`Invoice_Order_${order.id}.pdf`);
  };

  const resendInvoice = async (order: Order) => {
    setResendingId(order.id);
    const response = await fetch("/api/resend-invoice", {
      method: "POST",
      body: JSON.stringify({ order }),
    });

    const result = await response.json();
    result.success
      ? alert("Invoice email resent successfully!")
      : alert("Failed to resend invoice.");

    setResendingId(null);
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">My Orders</h1>

      {loading ? (
        <p>Loading orders...</p>
      ) : orders.length === 0 ? (
        <p>You have no orders.</p>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => {
            const isReturnEligible =
              order.tracking_status === "delivered" &&
              order.estimated_delivery_date &&
              differenceInDays(new Date(), new Date(order.estimated_delivery_date)) <= 7;

            return (
              <div
                key={order.id}
                className="border border-gray-200 rounded-xl p-4 shadow-sm bg-white"
              >
                <div className="flex justify-between items-center mb-2">
                  <div>
                    <p className="text-lg font-semibold">{order.product_name}</p>
                    <p className="text-sm text-gray-500">Qty: {order.quantity}</p>
                    <p className="text-sm text-gray-500">
                      Ordered on: {format(new Date(order.created_at), "dd MMM yyyy")}
                    </p>
                  </div>
                  <div>
                    <span
                      className={`px-3 py-1 text-sm font-medium rounded-full ${
                        statusColorMap[order.tracking_status || "pending"] ||
                        "bg-gray-200 text-gray-800"
                      }`}
                    >
                      {order.tracking_status || "Pending"}
                    </span>
                  </div>
                </div>

                <div className="text-sm text-gray-700 space-y-1">
                  <p><strong>Tracking ID:</strong> {order.tracking_id || "N/A"}</p>
                  <p><strong>Courier:</strong> {order.courier_service || "N/A"}</p>
                  <p><strong>Estimated Delivery:</strong>{" "}
                    {order.estimated_delivery_date
                      ? format(new Date(order.estimated_delivery_date), "dd MMM yyyy")
                      : "N/A"}
                  </p>
                  <p><strong>Delivery Address:</strong> {order.delivery_address || "N/A"}</p>
                  <p><strong>Discount:</strong> ₹{order.discount_applied || 0}</p>
                </div>

                <div className="mt-3 flex justify-between items-center">
                  <div className="text-green-600 font-semibold text-lg">
                    ₹{order.total_price - (order.discount_applied || 0)}
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {order.tracking_status === "pending" && (
                      <button
                        onClick={() => cancelOrder(order.id)}
                        disabled={cancellingId === order.id}
                        className="bg-red-600 text-white px-3 py-2 rounded hover:bg-red-700 disabled:opacity-50"
                      >
                        {cancellingId === order.id ? "Cancelling..." : "Cancel Order"}
                      </button>
                    )}

                    {isReturnEligible && (
                      <button
                        onClick={() => setRequestModal(order.id)}
                        className="bg-yellow-500 text-white px-3 py-2 rounded hover:bg-yellow-600"
                      >
                        Request Return / Replace
                      </button>
                    )}

                    {order.tracking_id && (
                      <a
                        href={`https://track.aftership.com/${order.courier_service}/${order.tracking_id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-blue-600 text-white px-3 py-2 rounded hover:bg-blue-700"
                      >
                        Track Order
                      </a>
                    )}

                    <button
                      onClick={() => downloadInvoice(order)}
                      className="bg-gray-800 text-white px-3 py-2 rounded hover:bg-gray-900"
                    >
                      Download Invoice
                    </button>

                    <button
                      onClick={() => resendInvoice(order)}
                      disabled={resendingId === order.id}
                      className="bg-indigo-600 text-white px-3 py-2 rounded hover:bg-indigo-700 disabled:opacity-50"
                    >
                      {resendingId === order.id ? "Resending..." : "Resend Invoice Email"}
                    </button>
                  </div>
                </div>

                {requestModal === order.id && (
                  <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl p-6 w-full max-w-md">
                      <h2 className="text-lg font-semibold mb-3">Return / Replace Request</h2>
                      <select
                        value={requestType}
                        onChange={(e) => setRequestType(e.target.value)}
                        className="w-full mb-3 border rounded px-3 py-2"
                      >
                        <option value="return">Return</option>
                        <option value="replace">Replace</option>
                      </select>
                      <textarea
                        placeholder="Reason for return or replacement"
                        value={requestReason}
                        onChange={(e) => setRequestReason(e.target.value)}
                        className="w-full mb-3 border rounded px-3 py-2"
                        rows={3}
                      />
                      <textarea
                        placeholder="Additional comments (optional)"
                        value={requestComment}
                        onChange={(e) => setRequestComment(e.target.value)}
                        className="w-full mb-3 border rounded px-3 py-2"
                        rows={2}
                      />

                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => setRequestModal(null)}
                          className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => submitReturnRequest(order)}
                          disabled={submittingRequest}
                          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                        >
                          {submittingRequest ? "Submitting..." : "Submit Request"}
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
