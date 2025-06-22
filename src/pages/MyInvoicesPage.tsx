import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { format } from "date-fns";
import { jsPDF } from "jspdf";

interface Order {
  id: number;
  product_name: string;
  quantity: number;
  total_price: number;
  discount_applied?: number;
  created_at: string;
  user_id?: string;
  email?: string;
}

export default function MyInvoicesPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [resendingId, setResendingId] = useState<number | null>(null);

  useEffect(() => {
    fetchDeliveredOrders();
  }, []);

  const fetchDeliveredOrders = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .in("tracking_status", ["delivered", "completed"])
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching invoices:", error.message);
    } else {
      setOrders(data);
    }
    setLoading(false);
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
    doc.text(`Net Total: ₹${order.total_price - (order.discount_applied || 0)}`, 20, 85);
    doc.text(`Order Date: ${format(new Date(order.created_at), "dd MMM yyyy")}`, 20, 95);
    doc.save(`Invoice_Order_${order.id}.pdf`);
  };

  const resendInvoice = async (order: Order) => {
    setResendingId(order.id);
    const response = await fetch("/api/resend-invoice", {
      method: "POST",
      body: JSON.stringify({ order }),
    });

    const result = await response.json();
    if (result.success) {
      alert("Invoice email resent successfully!");
    } else {
      alert("Failed to resend invoice.");
    }

    setResendingId(null);
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">My Invoices</h1>

      {loading ? (
        <p>Loading invoices...</p>
      ) : orders.length === 0 ? (
        <p>You have no invoices yet.</p>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => (
            <div
              key={order.id}
              className="border border-gray-200 rounded-xl p-4 shadow-sm bg-white"
            >
              <div className="flex justify-between items-center mb-2">
                <div>
                  <p className="text-lg font-semibold">Order #{order.id}</p>
                  <p className="text-sm text-gray-500">{order.product_name}</p>
                  <p className="text-sm text-gray-500">
                    Ordered on: {format(new Date(order.created_at), "dd MMM yyyy")}
                  </p>
                </div>
                <div className="text-green-600 font-semibold text-lg">
                  ₹{order.total_price - (order.discount_applied || 0)}
                </div>
              </div>

              <div className="text-sm text-gray-700 space-y-1">
                <p><strong>Quantity:</strong> {order.quantity}</p>
                <p><strong>Total Price:</strong> ₹{order.total_price}</p>
                <p><strong>Discount:</strong> ₹{order.discount_applied || 0}</p>
                <p><strong>Net Total:</strong> ₹{order.total_price - (order.discount_applied || 0)}</p>
              </div>

              <div className="mt-3 flex gap-2">
                <button
                  onClick={() => downloadInvoice(order)}
                  className="bg-gray-800 text-white px-4 py-2 rounded hover:bg-gray-900"
                >
                  Download Invoice
                </button>
                <button
                  onClick={() => resendInvoice(order)}
                  disabled={resendingId === order.id}
                  className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 disabled:opacity-50"
                >
                  {resendingId === order.id ? "Resending..." : "Resend Invoice Email"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
