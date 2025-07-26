// src/pages/AdminAnalyticsPage.tsx

import { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { supabase } from "@/lib/supabaseClient";
import Spinner from "@/components/ui/Spinner";
import ErrorAlert from "@/components/ui/ErrorAlert";
import { Button } from "@/components/ui/Button";
import { format } from "date-fns";
import toast from "react-hot-toast";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as Papa from "papaparse";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

interface Order {
  id: number;
  product_name: string;
  total_price: number;
  tracking_status?: string;
  created_at: string;
  category?: string;
}

const COLORS = ["#8884d8", "#10b981", "#f59e0b", "#f43f5e", "#6366f1"];

export default function AdminAnalyticsPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [totalOrders, setTotalOrders] = useState(0);
  const [totalUsers, setTotalUsers] = useState(0);
  const [totalMerchants, setTotalMerchants] = useState(0);
  const [totalProducts, setTotalProducts] = useState(0);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [revenueTrend, setRevenueTrend] = useState<{ date: string; revenue: number }[]>([]);
  const [categoryRevenue, setCategoryRevenue] = useState<{ name: string; value: number }[]>([]);

  useEffect(() => {
    fetchAnalytics();
    window.gtag?.("event", "view_analytics_dashboard");
  }, []);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const [{ data: orders }, { data: users }, { data: products }] = await Promise.all([
        supabase.from("orders").select("*"),
        supabase.from("users").select("*"),
        supabase.from("products").select("*"),
      ]);

      if (!orders || !users || !products) throw new Error("Missing data");

      const completedOrders = orders.filter((o) =>
        ["delivered", "completed"].includes(o.tracking_status)
      );

      const revenue = completedOrders.reduce((sum, o) => sum + o.total_price, 0);
      setTotalRevenue(revenue);
      setTotalOrders(orders.length);
      setTotalUsers(users.length);
      setTotalMerchants(users.filter((u) => u.role === "merchant").length);
      setTotalProducts(products.length);

      const recent = orders
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .slice(0, 5);
      setRecentOrders(recent);

      const trendMap: Record<string, number> = {};
      const categoryMap: Record<string, number> = {};

      completedOrders.forEach((o) => {
        const day = format(new Date(o.created_at), "dd MMM");
        trendMap[day] = (trendMap[day] || 0) + o.total_price;

        const category = o.category || "Uncategorized";
        categoryMap[category] = (categoryMap[category] || 0) + o.total_price;
      });

      const trend = Object.entries(trendMap).map(([date, revenue]) => ({ date, revenue }));
      const categories = Object.entries(categoryMap).map(([name, value]) => ({ name, value }));

      setRevenueTrend(trend.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()));
      setCategoryRevenue(categories);
    } catch (err) {
      setError("Failed to load analytics");
    }
    setLoading(false);
  };

  const exportToCSV = () => {
    const csv = Papa.unparse([
      ["Metric", "Value"],
      ["Total Revenue", totalRevenue],
      ["Total Orders", totalOrders],
      ["Total Users", totalUsers],
      ["Total Merchants", totalMerchants],
      ["Total Products", totalProducts],
    ]);
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "admin-analytics.csv";
    a.click();
    window.gtag?.("event", "export_analytics_report", { format: "csv" });
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    autoTable(doc, {
      head: [["Metric", "Value"]],
      body: [
        ["Total Revenue", `₹${totalRevenue.toLocaleString()}`],
        ["Total Orders", totalOrders],
        ["Total Users", totalUsers],
        ["Total Merchants", totalMerchants],
        ["Total Products", totalProducts],
      ],
    });
    doc.save("admin-analytics.pdf");
    window.gtag?.("event", "export_analytics_report", { format: "pdf" });
  };

  const statBox = (label: string, value: number | string, color = "bg-green-100 text-green-800") => (
    <div className={`p-4 rounded-xl shadow border ${color}`}>
      <h2 className="text-sm font-medium uppercase">{label}</h2>
      <p className="text-xl font-bold mt-1">{value}</p>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto p-6">
      <Helmet>
        <title>Admin Analytics Dashboard | Cauverystore</title>
        <meta name="description" content="Track orders, revenue and platform growth metrics." />
        <meta property="og:title" content="Admin Analytics | Cauverystore" />
        <meta property="og:description" content="Track orders, revenue, users and performance" />
        <meta name="twitter:title" content="Admin Analytics | Cauverystore" />
      </Helmet>

      <h1 className="text-3xl font-bold mb-4 text-green-700">Admin Analytics Dashboard</h1>

      {loading ? (
        <Spinner size="lg" />
      ) : error ? (
        <ErrorAlert message={error} />
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            {statBox("Total Revenue", `₹${totalRevenue.toLocaleString()}`)}
            {statBox("Total Orders", totalOrders, "bg-blue-100 text-blue-800")}
            {statBox("Total Users", totalUsers, "bg-purple-100 text-purple-800")}
            {statBox("Total Merchants", totalMerchants, "bg-yellow-100 text-yellow-800")}
            {statBox("Total Products", totalProducts, "bg-indigo-100 text-indigo-800")}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="bg-white dark:bg-gray-900 p-4 rounded border shadow">
              <h2 className="text-lg font-semibold mb-3">Revenue Trend</h2>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={revenueTrend}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="revenue" stroke="#10b981" />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-white dark:bg-gray-900 p-4 rounded border shadow">
              <h2 className="text-lg font-semibold mb-3">Revenue by Category</h2>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    dataKey="value"
                    data={categoryRevenue}
                    nameKey="name"
                    outerRadius={80}
                    label
                  >
                    {categoryRevenue.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="mb-4 flex gap-3">
            <Button onClick={exportToCSV}>Export CSV</Button>
            <Button onClick={exportToPDF} variant="secondary">Export PDF</Button>
          </div>

          <div className="bg-white border rounded-xl shadow p-4">
            <h2 className="text-lg font-semibold mb-3">Recent Orders</h2>
            {recentOrders.length === 0 ? (
              <p className="text-sm text-gray-500">No recent orders.</p>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left border-b">
                    <th className="py-2">Order ID</th>
                    <th>Product</th>
                    <th>Status</th>
                    <th>Total</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map((order) => (
                    <tr key={order.id} className="border-b hover:bg-gray-50">
                      <td className="py-2">{order.id}</td>
                      <td>{order.product_name}</td>
                      <td>
                        <span className="capitalize px-2 py-1 text-xs rounded bg-gray-100">
                          {order.tracking_status || "pending"}
                        </span>
                      </td>
                      <td>₹{order.total_price}</td>
                      <td>{format(new Date(order.created_at), "dd MMM yyyy")}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </>
      )}
    </div>
  );
}
