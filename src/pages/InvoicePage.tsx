import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/lib/supabaseClient";
import { jsPDF } from "jspdf";
import { format } from "date-fns";

interface Order {
  id: number;
  product_name: string;
  quantity: number;
  total_price: number;
  discount_applied?: number;
  created_at: string;
  user_id?: string;
  email?: string;
  delivery_address?: string;
}

export default function InvoicePage() {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) fetchOrder(id);
  }, [id]);

  const fetchOrder = async (orderId: string) => {
    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .eq("id", orderId)
      .single();

    if (error || !data) {
      console.error("Invoice not found");
    } else {
      setOrder(data);
    }

    setLoading(false);
  };

  const downloadPDF = () => {
    if (!order) return;
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

  if (loading) return <div className="p-6">Loading invoice...</div>;

  if (!order)
    return (
      <div className="p-6 text-red-600 font-semibold">
        Invoice not found or invalid ID.
      </div>
    );

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white dark:bg-gray-900 rounded shadow">
      <h1 className="text-2xl font-bold mb-4 text-green-700">Invoice</h1>

      <div className="space-y-2 text-gray-800 dark:text-gray-200 text-sm">
        <p><strong>Order ID:</strong> {order.id}</p>
        <p><strong>Product:</strong> {order.product_name}</p>
        <p><strong>Quantity:</strong> {order.quantity}</p>
        <p><strong>Total Price:</strong> ₹{order.total_price}</p>
        <p><strong>Discount Applied:</strong> ₹{order.discount_applied || 0}</p>
        <p><strong>Net Total:</strong> ₹{order.total_price - (order.discount_applied || 0)}</p>
        <p><strong>Ordered On:</strong> {format(new Date(order.created_at), "dd MMM yyyy")}</p>
        <p><strong>Delivery Address:</strong> {order.delivery_address || "N/A"}</p>
        <p><strong>Customer Email:</strong> {order.email || "N/A"}</p>
      </div>

      <button
        onClick={downloadPDF}
        className="mt-6 bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
      >
        Download PDF
      </button>
    </div>
  );
}
