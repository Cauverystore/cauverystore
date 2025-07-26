import { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { supabase } from "@/lib/supabaseClient";

import { Button } from "@/components/ui/Button";
import Spinner from "@/components/ui/Spinner";
import ErrorAlert from "@/components/ui/ErrorAlert";
import { formatPrice } from "@/utils/formatPrice";

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as Papa from "papaparse";
import { saveAs } from "file-saver";
import {
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer
} from "recharts";

interface OrderItem {
  product_id: string;
  quantity: number;
  price: number;
}

interface Order {
  id: string;
  created_at: string;
  items: OrderItem[];
  user_id: string;
  merchant_id?: string;
  customer_email?: string;
  status?: string;
  expanded?: boolean;
  merchant_email?: string;
}

declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
  }
}

export default function AdminDashboard() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchOrders();
    const channel = supabase
      .channel("admin_dashboard")
      .on("postgres_changes", { event: "*", schema: "public", table: "orders" }, fetchOrders)
      .subscribe();

    if (typeof window !== "undefined" && window.gtag) {
      window.gtag("event", "view_admin_dashboard", {
        page_title: "Admin Dashboard"
      });
    }

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    setError("");
    try {
      const { data: ordersData, error: orderError } = await supabase
        .from("orders")
        .select("*")
        .order("created_at", { ascending: false });
      if (orderError) throw orderError;

      const { data: merchants } = await supabase.from("profiles").select("id, email");
      const merchantMap = Object.fromEntries((merchants || []).map((m) => [m.id, m.email]));

      const enrichedOrders = (ordersData || []).map((order: Order) => ({
        ...order,
        expanded: false,
        merchant_email: merchantMap[order.merchant_id || ""] || "Unknown"
      }));

      setOrders(enrichedOrders);
    } catch {
      setError("Failed to load orders.");
    } finally {
      setLoading(false);
    }
  };

  const toggleExpand = (orderId: string) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, expanded: !o.expanded } : o))
    );
  };

  const totalAmount = (items: OrderItem[]) =>
    items.reduce((sum, item) => sum + item.quantity * item.price, 0);

  const getSummaryStats = () => {
    const totalRevenue = orders.reduce((sum, o) => sum + totalAmount(o.items), 0);
    const totalOrders = orders.length;
    const statusCount = {
      Pending: 0,
      Processing: 0,
      Shipped: 0,
      Delivered: 0,
      Cancelled: 0
    };
    orders.forEach((o) => {
      if (o.status && statusCount[o.status] !== undefined) {
        statusCount[o.status]++;
      }
    });
    return { totalRevenue, totalOrders, statusCount };
  };

  const getChartData = () => {
    const map: Record<string, number> = {};
    orders.forEach((o) => {
      const date = new Date(o.created_at).toLocaleDateString();
      map[date] = (map[date] || 0) + totalAmount(o.items);
    });
    return Object.entries(map).map(([date, total]) => ({ date, total }));
  };

  const handleExportPDF = () => {
    const doc = new jsPDF();
    doc.text("Admin Orders Report", 14, 16);
    autoTable(doc, {
      startY: 22,
      head: [["Order ID", "Date", "Status", "Total"]],
      body: orders.map((o) => [
        o.id,
        new Date(o.created_at).toLocaleString(),
        o.status || "",
        formatPrice(totalAmount(o.items))
      ])
    });
    doc.save("admin_orders_report.pdf");
    if (typeof window !== "undefined" && window.gtag) {
      window.gtag("event", "export_pdf", { section: "admin_dashboard" });
    }
  };

  const handleExportCSV = () => {
    const csv = Papa.unparse(
      orders.map((o) => ({
        ID: o.id,
        Date: new Date(o.created_at).toLocaleString(),
        Status: o.status || "",
        Total: formatPrice(totalAmount(o.items))
      }))
    );
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    saveAs(blob, "admin_orders_report.csv");
    if (typeof window !== "undefined" && window.gtag) {
      window.gtag("event", "export_csv", { section: "admin_dashboard" });
    }
  };

  const { totalRevenue, totalOrders, statusCount } = getSummaryStats();
  const chartData = getChartData();

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <Helmet>
        <title>Admin Dashboard | Cauverystore</title>
        <meta name="description" content="View order insights and manage platform-wide performance." />
      </Helmet>

      <h1 className="text-3xl font-bold text-indigo-700 mb-6">Admin Dashboard</h1>

      {loading ? (
        <Spinner size="lg" />
      ) : error ? (
        <ErrorAlert message={error} />
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            <div className="p-4 border rounded shadow-sm">
              <h2 className="text-sm font-medium text-gray-600">Total Revenue</h2>
              <p className="text-xl font-bold text-green-600">{formatPrice(totalRevenue)}</p>
            </div>
            <div className="p-4 border rounded shadow-sm">
              <h2 className="text-sm font-medium text-gray-600">Total Orders</h2>
              <p className="text-xl font-bold text-blue-600">{totalOrders}</p>
            </div>
            <div className="p-4 border rounded shadow-sm">
              <h2 className="text-sm font-medium text-gray-600">Pending Orders</h2>
              <p className="text-xl font-bold text-yellow-600">{statusCount.Pending}</p>
            </div>
          </div>

          <div className="mb-6 bg-white p-4 border rounded shadow-sm">
            <h2 className="text-sm font-semibold mb-2">Revenue Over Time</h2>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="total" stroke="#6366f1" />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="flex gap-3 mb-4">
            <Button onClick={handleExportPDF}>Export PDF</Button>
            <Button variant="outline" onClick={handleExportCSV}>Export CSV</Button>
          </div>

          <div className="overflow-x-auto border rounded-lg">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-2">Order ID</th>
                  <th className="px-4 py-2">Date</th>
                  <th className="px-4 py-2">Merchant</th>
                  <th className="px-4 py-2">Status</th>
                  <th className="px-4 py-2">Total</th>
                  <th className="px-4 py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <>
                    <tr key={order.id} className="border-t">
                      <td className="px-4 py-2">{order.id}</td>
                      <td className="px-4 py-2">{new Date(order.created_at).toLocaleString()}</td>
                      <td className="px-4 py-2">{order.merchant_email}</td>
                      <td className="px-4 py-2">{order.status || "-"}</td>
                      <td className="px-4 py-2">{formatPrice(totalAmount(order.items))}</td>
                      <td className="px-4 py-2">
                        <Button size="sm" onClick={() => toggleExpand(order.id)}>
                          {order.expanded ? "Hide" : "Details"}
                        </Button>
                      </td>
                    </tr>
                    {order.expanded && (
                      <tr>
                        <td colSpan={6} className="bg-gray-50 px-4 py-2">
                          <p className="text-sm text-gray-600 mb-2">Customer Email: {order.customer_email || "N/A"}</p>
                          <ul className="space-y-1">
                            {order.items.map((item, i) => (
                              <li key={i} className="text-sm">
                                {item.quantity} × Product #{item.product_id} @ ₹{item.price}
                              </li>
                            ))}
                          </ul>
                        </td>
                      </tr>
                    )}
                  </>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
