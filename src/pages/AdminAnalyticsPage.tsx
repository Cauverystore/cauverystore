import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { format } from "date-fns";

interface Order {
  id: number;
  product_name: string;
  total_price: number;
  tracking_status?: string;
  created_at: string;
  user_id?: string;
}

export default function AdminAnalyticsPage() {
  const [loading, setLoading] = useState(true);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [totalOrders, setTotalOrders] = useState(0);
  const [totalUsers, setTotalUsers] = useState(0);
  const [totalMerchants, setTotalMerchants] = useState(0);
  const [totalProducts, setTotalProducts] = useState(0);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    setLoading(true);

    const [{ data: orders }, { data: users }, { data: products }] = await Promise.all([
      supabase.from("orders").select("*"),
      supabase.from("users").select("*"),
      supabase.from("products").select("*"),
    ]);

    if (orders && users && products) {
      const completedOrders = orders.filter((o) =>
        ["delivered", "completed"].includes(o.tracking_status)
      );

      setTotalRevenue(
        completedOrders.reduce((sum, o) => sum + o.total_price, 0)
      );

      setTotalOrders(orders.length);
      setTotalUsers(users.length);
      setTotalMerchants(users.filter((u) => u.role === "merchant").length);
      setTotalProducts(products.length);

      const sortedOrders = orders
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .slice(0, 5);

      setRecentOrders(sortedOrders);
    }

    setLoading(false);
  };

  const statBox = (label: string, value: number | string, color = "bg-green-100 text-green-800") => (
    <div className={`p-4 rounded-xl shadow border ${color}`}>
      <h2 className="text-sm font-medium uppercase">{label}</h2>
      <p className="text-xl font-bold mt-1">{value}</p>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Admin Analytics Dashboard</h1>

      {loading ? (
        <p>Loading analytics...</p>
      ) : (
        <>
          {/* Stat Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            {statBox("Total Revenue", `₹${totalRevenue.toLocaleString()}`, "bg-green-100 text-green-800")}
            {statBox("Total Orders", totalOrders, "bg-blue-100 text-blue-800")}
            {statBox("Total Users", totalUsers, "bg-purple-100 text-purple-800")}
            {statBox("Total Merchants", totalMerchants, "bg-yellow-100 text-yellow-800")}
            {statBox("Total Products", totalProducts, "bg-indigo-100 text-indigo-800")}
          </div>

          {/* Recent Orders */}
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
