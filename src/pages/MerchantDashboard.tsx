// src/pages/MerchantDashboard.tsx
import { useEffect, useState } from "react";
import { Helmet } from "react-helmet";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
} from "recharts";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import Spinner from "@/components/ui/Spinner";
import { Download, Edit, MessageCircle, Moon, Sun } from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as Papa from "papaparse";
import { saveAs } from "file-saver";
import { format, subDays } from "date-fns";

const MerchantDashboard = () => {
  const [salesData, setSalesData] = useState<any[]>([]);
  const [productStats, setProductStats] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [earnings, setEarnings] = useState(0);
  const [range, setRange] = useState<"7" | "30" | "all">("7");
  const [filterText, setFilterText] = useState("");
  const [darkMode, setDarkMode] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
  }, [darkMode]);

  useEffect(() => {
    fetchData();
    const channel = supabase
      .channel("merchant_dashboard_realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "orders" }, fetchData)
      .on("postgres_changes", { event: "*", schema: "public", table: "products" }, fetchData)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "support_requests" }, fetchData)
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [range]);

  const fetchData = async () => {
    setLoading(true);
    const { data: { session } } = await supabase.auth.getSession();
    const merchantId = session?.user?.id;
    if (!merchantId) return;

    const { data: orders } = await supabase
      .from("orders")
      .select("created_at, total_amount")
      .eq("merchant_id", merchantId);

    const { data: products } = await supabase
      .from("products")
      .select("id, name, stock, price, category")
      .eq("merchant_id", merchantId);

    const { data: support } = await supabase
      .from("support_requests")
      .select("id, subject, created_at")
      .eq("merchant_id", merchantId)
      .eq("status", "pending");

    const filteredOrders = orders?.filter((order: any) => {
      if (range === "all") return true;
      const days = parseInt(range);
      const orderDate = new Date(order.created_at);
      return orderDate >= subDays(new Date(), days);
    });

    const groupedSales: Record<string, number> = {};
    filteredOrders?.forEach((o: any) => {
      const date = new Date(o.created_at).toLocaleDateString();
      groupedSales[date] = (groupedSales[date] || 0) + o.total_amount;
    });

    const summarizedSales = Object.entries(groupedSales).map(([date, total]) => ({ date, total }));

    setSalesData(summarizedSales);
    setProductStats(products || []);
    setNotifications(support || []);
    setEarnings(filteredOrders?.reduce((sum, o) => sum + o.total_amount, 0) || 0);
    setLoading(false);
  };

  const lowStockProducts = productStats.filter((p) => p.stock < 5);

  const filteredProducts = productStats.filter((p) => {
    const text = filterText.toLowerCase();
    return (
      p.name.toLowerCase().includes(text) ||
      p.category?.toLowerCase().includes(text) ||
      String(p.stock).includes(text)
    );
  });

  const handleExportPDF = () => {
    const doc = new jsPDF();
    doc.text("Merchant Product Report", 14, 16);
    autoTable(doc, {
      startY: 22,
      head: [["Product", "Stock", "Price"]],
      body: filteredProducts.map((p) => [p.name, p.stock, p.price]),
    });
    doc.save("merchant_report.pdf");
  };

  const handleExportCSV = () => {
    const csv = Papa.unparse(
      filteredProducts.map((p) => ({
        Name: p.name,
        Stock: p.stock,
        Price: p.price,
      }))
    );
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    saveAs(blob, "merchant_report.csv");
  };

  if (loading) return <Spinner />;

  return (
    <>
      <Helmet>
        <title>Merchant Dashboard | Cauverystore</title>
        <meta name="description" content="View store performance, manage inventory, and access merchant tools." />
      </Helmet>

      <div className="p-4 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Merchant Dashboard</h1>
          <Button variant="ghost" onClick={() => setDarkMode(!darkMode)}>
            {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </Button>
        </div>

        {/* Admin Support Notifications */}
        {notifications.length > 0 && (
          <Card className="bg-yellow-100 dark:bg-yellow-900">
            <CardContent className="p-4">
              <h2 className="font-semibold mb-2">🛎 Unresolved Admin Support Tickets</h2>
              <ul className="list-disc ml-5 space-y-1">
                {notifications.map((msg) => (
                  <li key={msg.id}>
                    <a href={`/merchant/support/${msg.id}`} className="text-blue-600 underline">
                      {msg.subject}
                    </a>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Card><CardContent className="p-4"><h2 className="font-semibold">Total Earnings</h2><p className="text-xl font-bold mt-2">₹{earnings.toFixed(2)}</p></CardContent></Card>
          <Card><CardContent className="p-4"><h2 className="font-semibold">Total Products</h2><p className="text-xl font-bold mt-2">{productStats.length}</p></CardContent></Card>
          <Card><CardContent className="p-4"><h2 className="font-semibold">Low Stock Alerts</h2><p className="text-xl font-bold mt-2 text-red-600">{lowStockProducts.length}</p></CardContent></Card>
        </div>

        <div className="flex gap-2 items-center">
          <span className="text-sm font-medium">Sales Range:</span>
          <Button size="sm" variant={range === "7" ? "default" : "outline"} onClick={() => setRange("7")}>Last 7 Days</Button>
          <Button size="sm" variant={range === "30" ? "default" : "outline"} onClick={() => setRange("30")}>Last 30 Days</Button>
          <Button size="sm" variant={range === "all" ? "default" : "outline"} onClick={() => setRange("all")}>All Time</Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardContent className="p-4">
              <h2 className="font-semibold mb-2">📈 Sales Over Time</h2>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={salesData}>
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <CartesianGrid strokeDasharray="3 3" />
                  <Line type="monotone" dataKey="total" stroke="#8884d8" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <h2 className="font-semibold mb-2">📦 Stock Overview</h2>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={filteredProducts}>
                  <XAxis dataKey="name" hide />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="stock" fill="#82ca9d" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        <input
          type="text"
          className="w-full p-2 border rounded dark:bg-gray-800 dark:text-white"
          placeholder="Search products by name, stock or category..."
          value={filterText}
          onChange={(e) => setFilterText(e.target.value)}
        />

        <div className="overflow-x-auto border rounded-lg mt-4">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-100 dark:bg-gray-800 text-left">
              <tr>
                <th className="px-4 py-2">Name</th>
                <th className="px-4 py-2">Stock</th>
                <th className="px-4 py-2">Price</th>
                <th className="px-4 py-2">Category</th>
                <th className="px-4 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map((product) => (
                <tr key={product.id} className="border-t">
                  <td className="px-4 py-2">{product.name}</td>
                  <td className={`px-4 py-2 ${product.stock < 5 ? "text-red-500 font-bold" : ""}`}>{product.stock}</td>
                  <td className="px-4 py-2">₹{product.price}</td>
                  <td className="px-4 py-2">{product.category}</td>
                  <td className="px-4 py-2 space-x-2">
                    <a href={`/merchant/products/edit/${product.id}`} className="text-blue-600 hover:underline inline-flex items-center">
                      <Edit className="w-4 h-4 mr-1" /> Edit
                    </a>
                    <a href={`/merchant/support?product_id=${product.id}`} className="text-green-600 hover:underline inline-flex items-center">
                      <MessageCircle className="w-4 h-4 mr-1" /> Message Admin
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex flex-wrap gap-3 mt-4">
          <Button onClick={handleExportPDF}>
            <Download className="mr-2 h-4 w-4" />
            Export as PDF
          </Button>
          <Button variant="outline" onClick={handleExportCSV}>
            <Download className="mr-2 h-4 w-4" />
            Export as CSV
          </Button>
        </div>
      </div>
    </>
  );
};

export default MerchantDashboard;
