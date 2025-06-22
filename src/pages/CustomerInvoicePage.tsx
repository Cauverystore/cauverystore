// src/pages/CustomerInvoicePage.tsx
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabaseClient';
import { Helmet } from 'react-helmet-async';
import { jsPDF } from 'jspdf';
import toast from 'react-hot-toast';

export default function CustomerInvoicePage() {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInvoice();
  }, []);

  const fetchInvoice = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      toast.error('Please login to view invoice');
      navigate('/login');
      return;
    }

    const { data, error } = await supabase
      .from('orders')
      .select('*, order_items(*, products(*))')
      .eq('id', orderId)
      .eq('user_id', user.id)
      .single();

    if (error || !data) {
      toast.error('Invoice not found');
      navigate('/my-orders');
    } else {
      setOrder(data);
    }

    setLoading(false);
  };

  const generatePDF = () => {
    if (!order) return;

    const doc = new jsPDF();
    doc.text('Invoice', 14, 16);
    doc.setFontSize(10);
    doc.text(`Order ID: ${order.id}`, 14, 26);
    doc.text(`Date: ${new Date(order.created_at).toLocaleDateString()}`, 14, 32);
    doc.text(`Shipping Address: ${order.shipping_address}`, 14, 38);
    doc.text(`Status: ${order.status}`, 14, 44);

    let y = 54;
    order.order_items.forEach((item: any, i: number) => {
      doc.text(
        `${i + 1}. ${item.products.name} - ₹${item.products.price} x ${item.quantity}`,
        14,
        y
      );
      y += 6;
    });

    doc.text(`Total: ₹${order.total_amount}`, 14, y + 6);
    doc.save(`invoice-${order.id}.pdf`);
  };

  if (loading) return <div className="p-6">Loading invoice...</div>;

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white dark:bg-gray-900 text-gray-800 dark:text-white">
      <Helmet>
        <title>Invoice #{order?.id} | Cauverystore</title>
      </Helmet>

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-green-700">Invoice</h1>
        <p className="text-sm text-gray-600 dark:text-gray-300">
          Order ID: {order.id} | Date: {new Date(order.created_at).toLocaleString()}
        </p>
      </div>

      <div className="mb-6">
        <p><strong>Shipping Address:</strong> {order.shipping_address}</p>
        <p><strong>Status:</strong> {order.status}</p>
      </div>

      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Items</h2>
        <div className="space-y-3">
          {order.order_items.map((item: any) => (
            <div key={item.id} className="border p-3 rounded bg-gray-50 dark:bg-gray-800">
              <p className="font-semibold">{item.products.name}</p>
              <p className="text-sm">Qty: {item.quantity}</p>
              <p className="text-sm">Price: ₹{item.products.price}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="font-bold text-lg mb-4">
        Total: ₹{order.total_amount}
      </div>

      <button
        onClick={generatePDF}
        className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
      >
        Download PDF
      </button>
    </div>
  );
}
