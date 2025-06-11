import { useEffect, useState } from "react";
import { supabase } from "@/lib/SupabaseClient";
import { useNavigate } from "react-router-dom";
import LogoutButton from "@/components/LogoutButton";

const MerchantDashboard = () => {
  const [products, setProducts] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [merchantId, setMerchantId] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        navigate("/login");
        return;
      }

      const userId = session.user.id;
      setMerchantId(userId);

      const { data: productData } = await supabase
        .from("products")
        .select("*")
        .eq("merchant_id", userId);

      const { data: orderData } = await supabase
        .from("orders")
        .select("*")
        .order("created_at", { ascending: false });

      setProducts(productData || []);
      setOrders(
        (orderData || []).filter((order) =>
          order.items?.some((item: any) => item.merchant_id === userId)
        )
      );

      setLoading(false);
    };

    fetchData();
  }, [navigate]);

  const handleDelete = async (id: string) => {
    await supabase.from("products").delete().eq("id", id);
    setProducts(products.filter((p) => p.id !== id));
  };

  const handleQuantityChange = async (id: string, newQty: number) => {
    await supabase.from("products").update({ stock: newQty }).eq("id", id);
    setProducts(
      products.map((p) =>
        p.id === id ? { ...p, stock: newQty } : p
      )
    );
  };

  if (loading) return <div className="text-center py-6">Loading dashboard...</div>;

  return (
    <div className="min-h-screen bg-gray-100 p-4 space-y-10">
      {/* Header with Logout */}
      <div className="flex justify-between items-center max-w-6xl mx-auto mb-6">
        <h1 className="text-2xl font-bold text-green-700">Merchant Dashboard</h1>
        <LogoutButton />
      </div>

      <section className="max-w-6xl mx-auto">
        <h2 className="text-xl font-semibold mb-3">Your Products</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {products.length === 0 ? (
            <p>No products found.</p>
          ) : (
            products.map((product) => (
              <div key={product.id} className="bg-white p-4 rounded shadow">
                <img
                  src={product.image_url}
                  alt={product.name}
                  className="w-full h-40 object-cover rounded mb-2"
                />
                <h3 className="font-semibold text-lg">{product.name}</h3>
                <p className="text-sm text-gray-700 mb-1">₹{product.price}</p>
                <div className="mb-2">
                  <label className="text-sm text-gray-600">Stock Quantity:</label>
                  <input
                    type="number"
                    value={product.stock}
                    min={0}
                    max={1000}
                    className="border rounded px-2 py-1 w-20 ml-2"
                    onChange={(e) => handleQuantityChange(product.id, Number(e.target.value))}
                  />
                </div>
                <p className={`text-sm mb-2 ${product.stock < 5 ? "text-red-600 font-semibold" : "text-green-600"}`}>
                  {product.stock < 5 ? "Low stock!" : "In stock"}
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => navigate(`/merchant/edit-product/${product.id}`)}
                    className="text-blue-600 hover:underline text-sm"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(product.id)}
                    className="text-red-600 hover:underline text-sm"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      <section className="max-w-6xl mx-auto">
        <h2 className="text-xl font-semibold mb-3">Latest 5 Orders</h2>
        <div className="bg-white p-4 shadow rounded">
          {orders.length === 0 ? (
            <p>No recent orders.</p>
          ) : (
            <ul className="space-y-3">
              {orders.slice(0, 5).map((order) => (
                <li key={order.id} className="border-b pb-2">
                  <p className="text-sm">
                    Order <strong>#{order.id}</strong> • {new Date(order.created_at).toLocaleString()}
                  </p>
                  <ul className="ml-4 list-disc text-sm text-gray-600">
                    {order.items
                      .filter((item: any) => item.merchant_id === merchantId)
                      .map((item: any) => (
                        <li key={item.product_id}>
                          {item.name} × {item.quantity}
                        </li>
                      ))}
                  </ul>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </div>
  );
};

export default MerchantDashboard;
