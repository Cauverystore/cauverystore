import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useAuthStore } from "@/store/authStore";
import { Link } from "react-router-dom";

type Product = {
  id: string;
  name: string;
  price: number;
  image_url: string;
};

export default function MerchantDashboard() {
  const { userId } = useAuthStore();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;

    const fetchProducts = async () => {
      const { data, error } = await supabase
        .from("products")
        .select("id, name, price, image_url")
        .eq("merchant_id", userId);

      if (error) {
        console.error("Error fetching products:", error.message);
      } else {
        setProducts(data);
      }

      setLoading(false);
    };

    fetchProducts();
  }, [userId]);

  const handleDelete = async (id: string) => {
    const confirm = window.confirm("Are you sure you want to delete this product?");
    if (!confirm) return;

    const { error } = await supabase.from("products").delete().eq("id", id);

    if (error) {
      alert("Failed to delete product.");
    } else {
      setProducts((prev) => prev.filter((p) => p.id !== id));
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold">Merchant Dashboard</h2>
        <Link
          to="/merchant/add-product"
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        >
          + Add Product
        </Link>
      </div>

      {loading ? (
        <p>Loading your products...</p>
      ) : products.length === 0 ? (
        <p>No products yet. Click "Add Product" to get started.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {products.map((product) => (
            <div key={product.id} className="border p-4 rounded shadow relative">
              <img
                src={product.image_url}
                alt={product.name}
                className="h-40 w-full object-cover mb-2 rounded"
              />
              <h3 className="text-lg font-semibold">{product.name}</h3>
              <p className="text-green-700 font-medium mb-2">₹{product.price}</p>

              <div className="flex justify-between text-sm text-white gap-2">
                <Link
                  to={`/merchant/edit-product/${product.id}`}
                  className="bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded w-full text-center"
                >
                  Edit
                </Link>
                <button
                  onClick={() => handleDelete(product.id)}
                  className="bg-red-600 hover:bg-red-700 px-3 py-1 rounded w-full"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
