// Full-featured MerchantOrders.tsx with enhancements
import { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { supabase } from "@/lib/supabaseClient";

import { Button } from "@/components/ui/Button";
import Spinner from "@/components/ui/Spinner";
import ErrorAlert from "@/components/ui/ErrorAlert";
import EmptyState from "@/components/ui/EmptyState";
import { formatPrice } from "@/utils/formatPrice";

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as Papa from "papaparse";
import { saveAs } from "file-saver";

interface OrderItem {
  product_id: string;
  quantity: number;
  price: number;
  name?: string;
  image_url?: string;
}

interface Order {
  id: string;
  created_at: string;
  items: OrderItem[];
  user_id: string;
  customer_email?: string;
  customer_name?: string;
  status?: string;
}

const STATUS_OPTIONS = ["Pending", "Processing", "Shipped", "Delivered", "Cancelled"];

export default function MerchantOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [authChecked, setAuthChecked] = useState(false);
  const [filterText, setFilterText] = useState("");

  useEffect(() => {
    if (typeof window === "undefined") return;
    const init = async () => {
      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        setError("You must be logged in to view orders.");
      }
      setAuthChecked(true);
    };
    init();
  }, []);

  useEffect(() => {
    if (!authChecked) return;
    fetchMerchantOrders();

    const channel = supabase
      .channel("merchant_orders_live")
      .on("postgres_changes", { event: "*", schema: "public", table: "orders" }, fetchMerchantOrders)
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [authChecked]);

  const fetchMerchantOrders = async () => {
    setLoading(true);
    setError("");
    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();
      if (userError || !user) {
        setError("You must be logged in to view orders.");
        return;
      }
      const { data: merchantProducts } = await supabase
        .from("products")
        .select("id, name, image_url")
        .eq("merchant_id", user.id);
      const productMap = Object.fromEntries(
        (merchantProducts || []).map((p) => [p.id, { name: p.name, image_url: p.image_url }])
      );

      const { data, error: orderError } = await supabase
        .from("orders")
        .select("*")
        .order("created_at", { ascending: false });
      if (orderError) throw orderError;

      const filtered = (data || []).filter((order: Order) =>
        order.items.some((item) => productMap[item.product_id])
      ).map((order: Order) => ({
        ...order,
        items: order.items.map((item) => ({
          ...item,
          name: productMap[item.product_id]?.name || "",
          image_url: productMap[item.product_id]?.image_url || ""
        }))
      }));

      setOrders(filtered);
    } catch {
      setError("Failed to load orders.");
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      await supabase.from("orders").update({ status: newStatus }).eq("id", orderId);
    } catch {
      alert("Failed to update order status.");
    }
  };

  const totalAmount = (items: OrderItem[]) =>
    items.reduce((sum, item) => sum + item.quantity * item.price, 0);

  const handleExportPDF = () => {
    const doc = new jsPDF();
    doc.text("Merchant Orders Report", 14, 16);
    autoTable(doc, {
      startY: 22,
      head: [["Order ID", "Date", "Total", "Status"]],
      body: filteredOrders.map((o) => [
        o.id,
        new Date(o.created_at).toLocaleString(),
        formatPrice(totalAmount(o.items)),
        o.status || ""
      ])
    });
    doc.save("merchant_orders.pdf");
  };

  const handleExportCSV = () => {
    const csv = Papa.unparse(
      filteredOrders.map((o) => ({
        ID: o.id,
        Date: new Date(o.created_at).toLocaleString(),
        Total: formatPrice(totalAmount(o.items)),
        Status: o.status || ""
      }))
    );
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    saveAs(blob, "merchant_orders.csv");
  };

  const filteredOrders = orders.filter(
    (o) =>
      o.id.toLowerCase().includes(filterText.toLowerCase()) ||
      o.customer_email?.toLowerCase().includes(filterText.toLowerCase())
  );

  if (!authChecked) {
    return (
      <div className="py-12 flex justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <Helmet>
        <title>Merchant Orders | Cauverystore</title>
        <meta name="description" content="View all customer orders for your products." />
      </Helmet>

      <div className="flex justify-between items-center mb-4">
        <h1 className="text-3xl font-bold text-green-700">Merchant Orders</h1>
        <div className="space-x-2">
          <Button onClick={handleExportPDF}>Export PDF</Button>
          <Button variant="outline" onClick={handleExportCSV}>Export CSV</Button>
        </div>
      </div>

      <input
        type="text"
        placeholder="Search by Order ID or Email"
        className="w-full mb-4 p-2 border rounded"
        value={filterText}
        onChange={(e) => setFilterText(e.target.value)}
      />

      {loading ? (
        <Spinner size="lg" />
      ) : error ? (
        <ErrorAlert message={error} />
      ) : filteredOrders.length === 0 ? (
        <EmptyState message="No orders found for your products yet." />
      ) : (
        <div className="space-y-6">
          {filteredOrders.map((order) => (
            <div key={order.id} className="border rounded-lg p-4 shadow-sm">
              <div className="flex justify-between items-center mb-2">
                <div>
                  <p className="text-sm text-gray-500">Order ID: <span className="font-medium">{order.id}</span></p>
                  {order.customer_email && (
                    <p className="text-sm text-gray-500">Email: {order.customer_email}</p>
                  )}
                </div>
                <p className="text-sm text-gray-500">{new Date(order.created_at).toLocaleString()}</p>
              </div>

              <ul className="space-y-2 mb-3">
                {order.items.map((item, index) => (
                  <li key={index} className="text-sm text-gray-700 flex items-center gap-2">
                    {item.image_url && <img src={item.image_url} alt="" className="w-8 h-8 rounded" />}
                    {item.quantity} × {item.name || `Product #${item.product_id}`} @ ₹{item.price}
                  </li>
                ))}
              </ul>

              <div className="flex justify-between items-center">
                <div>
                  <p className="font-semibold text-green-700">
                    Total: {formatPrice(totalAmount(order.items))}
                  </p>
                  <label className="text-sm text-gray-600">
                    Status: {" "}
                    <select
                      className="ml-2 border rounded p-1 text-sm"
                      value={order.status || "Pending"}
                      onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                    >
                      {STATUS_OPTIONS.map((status) => (
                        <option key={status} value={status}>{status}</option>
                      ))}
                    </select>
                  </label>
                </div>
                <Button variant="outline" onClick={() => window.print()}>
                  Print
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
