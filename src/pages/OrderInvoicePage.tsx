// Page: OrderInvoicePage.tsx

import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState, useRef } from 'react';
import { supabase } from '@/lib/supabaseClient';
import toast from 'react-hot-toast';

export default function OrderInvoicePage() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);
  const invoiceRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (orderId) fetchOrderDetails(orderId);
  }, [orderId]);

  const fetchOrderDetails = async (id: string) => {
    const { data: orderData, error: orderError } = await supabase
      .from('orders')
      .select('*, order_items(*)')
      .eq('id', id)
      .single();

    if (orderError || !orderData) {
      toast.error('Failed to fetch order');
      navigate('/orders');
      return;
    }

    setOrder(orderData);

    const productIds = orderData.order_items.map((item: any) => item.product_id);
    const { data: productData } = await supabase
      .from('products')
      .select('*')
      .in('id', productIds);

    setProducts(productData || []);
  };

  const handlePrint = () => {
    if (!invoiceRef.current) return;
    const printWindow = window.open('', '', 'width=800,height=600');
    if (!printWindow) return;

    printWindow.document.write(`
      <html>
        <head>
          <title>Invoice #${orderId}</title>
          <style>
            body { font-family: sans-serif; padding: 20px; }
            h1 { color: #1a202c; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ccc; padding: 8px; text-align: left; }
          </style>
        </head>
        <body>
          ${invoiceRef.current.innerHTML}
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    printWindow.close();
  };

  if (!order) return <div className="p-6">Loading invoice...</div>;

  return (
    <div className="p-6 max-w-4xl mx-auto bg-white dark:bg-gray-900 text-gray-800 dark:text-white">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Invoice #{order.id}</h1>
        <button
          onClick={handlePrint}
          className="bg-green-600 text-white px-4 py-2 rounded"
        >
          Print Invoice
        </button>
      </div>

      <div ref={invoiceRef}>
        <div className="mb-6">
          <p><strong>Order Date:</strong> {new Date(order.created_at).toLocaleString()}</p>
          <p><strong>Status:</strong> {order.status || 'N/A'}</p>
        </div>

        <table>
          <thead>
            <tr>
              <th>Product</th>
              <th>Qty</th>
              <th>Unit Price</th>
              <th>Subtotal</th>
            </tr>
          </thead>
          <tbody>
            {order.order_items.map((item: any) => {
              const product = products.find((p) => p.id === item.product_id);
              return (
                <tr key={item.id}>
                  <td>{product?.name || 'Product'}</td>
                  <td>{item.quantity}</td>
                  <td>₹{product?.price || 0}</td>
                  <td>₹{(product?.price || 0) * item.quantity}</td>
                </tr>
              );
            })}
            <tr>
              <td colSpan={3} className="text-right font-bold">Total</td>
              <td className="font-bold">₹{order.total}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
