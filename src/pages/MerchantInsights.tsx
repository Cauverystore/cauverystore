import { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { supabase } from "@/lib/supabaseClient";
import Spinner from "@/components/ui/Spinner";
import ErrorAlert from "@/components/ui/ErrorAlert";
import { Button } from "@/components/ui/Button";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as Papa from "papaparse";
import toast from "react-hot-toast";
import {
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend,
} from "recharts";
import { format } from "date-fns";

interface Product {
  id: string;
  name: string;
  stock: number;
  price: number;
  created_at: string;
}

interface Order {
  id: string;
  merchant_id: string;
  created_at: string;
  items: {
    product_id: string;
    quantity: number;
    price: number;
  }[];
  total_price: number;
}

export default function MerchantInsights() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [merchantId, setMerchantId] = useState<string>("");
  const [dateRange, setDateRange] = useState("30");

  useEffect(() => {
    if (typeof window !== "undefined") {
      fetchMerchant();
      window.gtag?.("event", "view_merchant_insights");
    }
  }, [dateRange]);

  const fetchMerchant = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast.error("Not logged in");
      return (window.location.href = "/");
    }

    const { data: profile, error } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (error || profile?.role !== "merchant") {
      toast.error("Access denied");
      return (window.location.href = "/");
    }

    setMerchantId(user.id);
    fetchData(user.id);
  };

  const fetchData = async (id: string) => {
    setLoading(true);
    const fromDate = new Date();
    fromDate.setDate(fromDate.getDate() - parseInt(dateRange));
    const iso = fromDate.toISOString();

    const [{ data: productData }, { data: orderData }] = await Promise.all([
      supabase.from("products").select("*").eq("merchant_id", id),
      supabase.from("orders").select("*").gte("created_at", iso).eq("merchant_id", id),
    ]);

    setProducts(productData || []);
    setOrders(orderData || []);
    setLoading(false);
  };

  const totalRevenue = orders.reduce((sum, o) => sum + (o.total_price || 0), 0);
  const lowStock = products.filter((p) => p.stock <= 5);

  const revenueTrend = orders.reduce((acc: Record<string, number>, o) => {
    const day = format(new Date(o.created_at), "dd MMM");
    acc[day] = (acc[day] || 0) + o.total_price;
    return acc;
  }, {});
  const revenueChart = Object.entries(revenueTrend).map(([date, revenue]) => ({ date, revenue }));

  const productSales: Record<string, number> = {};
  orders.forEach((order) => {
    order.items.forEach((item: any) => {
      productSales[item.product_id] = (productSales[item.product_id] || 0) + item.quantity;
    });
  });

  const bestSellers = Object.entries(productSales)
    .map(([productId, quantity]) => {
      const product = products.find((p) => p.id === productId);
      return { name: product?.name || "Unknown", quantity };
    })
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, 5);

  const exportReport = (type: "csv" | "pdf") => {
    const rows = [
      ["Total Revenue", totalRevenue.toFixed(2)],
      ["Total Orders", orders.length],
      ["Total Products", products.length],
      ["Low Stock Items", lowStock.length],
    ];

    if (type === "csv") {
      const csv = Papa.unparse(rows);
      const blob = new Blob([csv], { type: "text/csv" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "merchant-insights.csv";
      a.click();
    } else {
      const doc = new jsPDF();
      autoTable(doc, {
        head: [["Metric", "Value"]],
        body: rows,
      });
      doc.save("merchant-insights.pdf");
    }

    window.gtag?.("event", "export_merchant_insights", { format: type });
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <Helmet>
        <title>Merchant Insights | Cauverystore</title>
        <meta name="description" content="View sales, product performance, and revenue insights." />
      </Helmet>

      <h1 className="text-3xl font-bold mb-4 text-green-700">Merchant Insights</h1>

      <div className="flex flex-wrap gap-3 mb-6">
        <Button onClick={() => setDateRange("7")} variant={dateRange === "7" ? "default" : "outline"}>
          Last 7 Days
        </Button>
        <Button onClick={() => setDateRange("30")} variant={dateRange === "30" ? "default" : "outline"}>
          Last 30 Days
        </Button>
        <Button onClick={() => setDateRange("90")} variant={dateRange === "90" ? "default" : "outline"}>
          Last 90 Days
        </Button>
        <Button onClick={() => exportReport("csv")}>Export CSV</Button>
        <Button onClick={() => exportReport("pdf")}>Export PDF</Button>
      </div>

      {loading ? (
        <Spinner size="lg" />
      ) : error ? (
        <ErrorAlert message={error} />
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
            <div className="p-4 bg-white dark:bg-gray-800 shadow rounded-xl">
              <p className="text-sm text-gray-500">Revenue</p>
              <p className="text-xl font-bold">₹{totalRevenue.toLocaleString()}</p>
            </div>
            <div className="p-4 bg-white dark:bg-gray-800 shadow rounded-xl">
              <p className="text-sm text-gray-500">Orders</p>
              <p className="text-xl font-bold">{orders.length}</p>
            </div>
            <div className="p-4 bg-white dark:bg-gray-800 shadow rounded-xl">
              <p className="text-sm text-gray-500">Products</p>
              <p className="text-xl font-bold">{products.length}</p>
            </div>
            <div className="p-4 bg-white dark:bg-gray-800 shadow rounded-xl">
              <p className="text-sm text-gray-500">Low Stock</p>
              <p className="text-xl font-bold">{lowStock.length}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="bg-white dark:bg-gray-900 p-4 rounded-xl shadow">
              <h2 className="text-lg font-semibold mb-2">Revenue Over Time</h2>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={revenueChart}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="revenue" stroke="#10b981" />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-white dark:bg-gray-900 p-4 rounded-xl shadow">
              <h2 className="text-lg font-semibold mb-2">Top 5 Best Sellers</h2>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={bestSellers}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="quantity" fill="#6366f1" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {lowStock.length > 0 && (
            <div className="bg-white dark:bg-gray-900 p-4 rounded-xl shadow">
              <h2 className="text-lg font-semibold mb-2 text-red-600">Low Stock Alerts</h2>
              <ul className="space-y-1">
                {lowStock.map((p) => (
                  <li key={p.id} className="text-sm text-red-500">
                    {p.name} — only {p.stock} left
                  </li>
                ))}
              </ul>
            </div>
          )}
        </>
      )}
    </div>
  );
}
