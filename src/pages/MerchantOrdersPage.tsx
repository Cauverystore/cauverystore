import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { format } from "date-fns";

type Order = {
  id: string;
  created_at: string;
  total: number;
  customer_name: string;
  products: {
    product_id: string;
    quantity: number;
    product: {
      name: string;
      price: number;
    };
  }[];
};

export default function MerchantOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMerchantOrders = async () => {
      setLoading(true);
      const user = (await supabase.auth.getUser()).data.user;
      if (!user) return;

      // Step 1: Get products belonging to this merchant
      const { data: merchantProducts } = await supabase
        .from("products")
        .select("id")
        .eq("merchant_id", user.id);

      const merchantProductIds = merchantProducts?.map((p) => p.id) || [];

      if (merchantProductIds.length === 0) {
        setOrders([]);
        setLoading(false);
        return;
      }

      // Step 2: Get order items where product_id is in the merchant's products
      const { data: orderItems } = await supabase
        .from("order_items")
        .select("order_id, quantity, product:product_id(name, price), orders!inner(id, created_at, customer_name, total)")
        .in("product_id", merchantProductIds);

      if (!orderItems) {
        setOrders([]);
        setLoading(false);
        return;
      }

      // Step 3: Group by order_id
      const grouped = orderItems.reduce((acc: Record<string, Order>, item: any) => {
        const { orders: order, ...rest } = item;

        if (!acc[order.id]) {
          acc[order.id] = {
            id: order.id,
            created_at: order.created_at,
            total: order.total,
            customer_name: order.customer_name,
            products: [],
          };
        }

        acc[order.id].products.push(rest);
        return acc;
      }, {});

      setOrders(Object.values(grouped));
      setLoading(false);
    };

    fetchMerchantOrders();
  }, []);

  return (
    <ProtectedRoute allowedRoles={["merchant"]}>
      <div className="p-6 space-y-6">
        <h1 className="text-2xl font-bold text-green-700">Your Orders</h1>

        {loading ? (
          <p className="text-gray-500">Loading orders...</p>
        ) : orders.length === 0 ? (
          <p className="text-gray-500">No orders found for your products.</p>
        ) : (
          <ul className="space-y-4">
            {orders.map((order) => (
              <li
                key={order.id}
                className="border rounded-lg p-4 shadow-sm hover:shadow-md transition"
              >
                <div className="flex justify-between items-center mb-2">
                  <div>
                    <p className="font-semibold">Customer: {order.customer_name}</p>
                    <p className="text-sm text-gray-500">
                      {format(new Date(order.created_at), "dd MMM yyyy, hh:mm a")}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-green-600 font-semibold">
                      ₹{order.total.toFixed(2)}
                    </p>
                  </div>
                </div>
                <div className="mt-2">
                  <p className="font-semibold mb-1">Products:</p>
                  <ul className="ml-4 list-disc">
                    {order.products.map((item, i) => (
                      <li key={i}>
                        {item.product.name} × {item.quantity} (
                        ₹{item.product.price.toFixed(2)} each)
                      </li>
                    ))}
                  </ul>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </ProtectedRoute>
  );
}
