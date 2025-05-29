import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabaseClient";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { format } from "date-fns";

type Product = {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image_url: string;
};

type Order = {
  id: string;
  created_at: string;
  total: number;
  customer_name: string;
};

const TIME_FILTERS = {
  Today: () => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    return now.toISOString();
  },
  "Last 7 Days": () => {
    const now = new Date();
    now.setDate(now.getDate() - 7);
    return now.toISOString();
  },
  "This Month": () => {
    const now = new Date();
    now.setDate(1);
    now.setHours(0, 0, 0, 0);
    return now.toISOString();
  },
};

export default function MerchantDashboard() {
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [lowStock, setLowStock] = useState<Product[]>([]);
  const [filter, setFilter] = useState<keyof typeof TIME_FILTERS>("Today");

  const navigate = useNavigate();

  useEffect(() => {
    const fetchMerchantData = async () => {
      const user = (await supabase.auth.getUser()).data.user;
      if (!user) return;

      // Fetch products
      const { data: prodData } = await supabase
        .from("products")
        .select("*")
        .eq("merchant_id", user.id);

      if (prodData) {
        setProducts(prodData);
        const lowStockItems = prodData.filter((p) => p.quantity < 5);
        setLowStock(lowStockItems);
      }

      // Fetch latest orders
      const sinceDate = TIME_FILTERS[filter]();
      const { data: orderData } = await supabase
        .from("orders")
        .select("*")
        .gte("created_at", sinceDate)
        .order("created_at", { ascending: false })
        .limit(5);

      if (orderData) setOrders(orderData);
    };

    fetchMerchantData();
  }, [filter]);

  return (
    <ProtectedRoute allowedRoles={["merchant"]}>
      <div className="p-6 space-y-6">
        <h1 className="text-2xl font-bold text-green-700">Merchant Dashboard</h1>

        {/* Low Stock Alerts */}
        <div>
          <h2 className="text-xl font-semibold mb-2">⚠️ Low Stock Products</h2>
          {lowStock.length > 0 ? (
            <ul className="list-disc list-inside text-red-600">
              {lowStock.map((item) => (
                <li key={item.id}>
                  {item.name} – Only {item.quantity} left!
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-green-600">All products have sufficient stock.</p>
          )}
        </div>

        {/* Time Filter + Orders */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xl font-semibold">🛒 Latest Orders</h2>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as keyof typeof TIME_FILTERS)}
              className="border border-gray-300 rounded px-2 py-1"
            >
              {Object.keys(TIME_FILTERS).map((key) => (
                <option key={key} value={key}>
                  {key}
                </option>
              ))}
            </select>
          </div>
          <ul className="space-y-2">
            {orders.length > 0 ? (
              orders.map((order) => (
                <li key={order.id} className="border p-3 rounded shadow-sm">
                  <div className="flex justify-between">
                    <span>
                      <strong>Customer:</strong> {order.customer_name}
                    </span>
                    <span className="text-sm text-gray-600">
                      {format(new Date(order.created_at), "dd MMM yyyy, hh:mm a")}
                    </span>
                  </div>
                  <div>
                    <strong>Total:</strong> ₹{order.total.toFixed(2)}
                  </div>
                </li>
              ))
            ) : (
              <p className="text-gray-500">No orders in selected timeframe.</p>
            )}
          </ul>
        </div>

        {/* Product Summary */}
        <div>
          <h2 className="text-xl font-semibold mb-2">📦 Your Products</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {products.map((product) => (
              <div
                key={product.id}
                className="border p-3 rounded hover:shadow-md transition"
              >
                <img
                  src={product.image_url}
                  alt={product.name}
                  className="w-full h-40 object-cover rounded mb-2"
                />
                <div className="font-semibold">{product.name}</div>
                <div>₹{product.price}</div>
                <div className={`mt-1 text-sm ${product.quantity < 5 ? "text-red-600" : "text-green-600"}`}>
                  Stock: {product.quantity}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
