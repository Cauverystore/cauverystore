// src/pages/MerchantDashboard.tsx

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useAuthStore } from "@/store/authStore";

interface Product {
  id: string;
  name: string;
  price: number;
  image_url: string;
  stock: number;
}

export default function MerchantDashboard() {
  const { userId } = useAuthStore();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;

    const fetchProducts = async () => {
      const { data, error } = await supabase
        .from("products")
        .select("id, name, price, image_url, stock")
        .eq("merchant_id", userId);

      if (!error && data) setProducts(data);
      setLoading(false);
    };

    fetchProducts();
  }, [userId]);

  const handleUpdate = async (id: string, updated: Partial<Product>) => {
    const { error } = await supabase.from("products").update(updated).eq("id", id);
    if (!error) {
      setProducts((prev) =>
        prev.map((p) => (p.id === id ? { ...p, ...updated } : p))
      );
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this product?")) return;
    const { error } = await supabase.from("products").delete().eq("id", id);
    if (!error) {
      setProducts((prev) => prev.filter((p) => p.id !== id));
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h2 className="text-3xl font-bold mb-6">Manage Your Products</h2>

      {loading ? (
        <p>Loading products...</p>
      ) : products.length === 0 ? (
        <p>No products found.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {products.map((product) => (
            <div key={product.id} className="border rounded p-4 shadow-sm space-y-2">
              <img
                src={product.image_url}
                alt={product.name}
                className="h-40 w-full object-cover rounded"
              />

              <input
                type="text"
                value={product.name}
                onChange={(e) =>
                  setProducts((prev) =>
                    prev.map((p) =>
                      p.id === product.id ? { ...p, name: e.target.value } : p
                    )
                  )
                }
                className="w-full p-2 border rounded"
              />

              <input
                type="number"
                min={1}
                value={product.price}
                onChange={(e) =>
                  setProducts((prev) =>
                    prev.map((p) =>
                      p.id === product.id ? { ...p, price: Number(e.target.value) } : p
                    )
                  )
                }
                className="w-full p-2 border rounded"
              />

              <input
                type="number"
                min={0}
                max={1000}
                value={product.stock}
                onChange={(e) =>
                  setProducts((prev) =>
                    prev.map((p) =>
                      p.id === product.id ? { ...p, stock: Number(e.target.value) } : p
                    )
                  )
                }
                className="w-full p-2 border rounded"
              />

              <div className="flex justify-between gap-2">
                <button
                  onClick={() =>
                    handleUpdate(product.id, {
                      name: product.name,
                      price: product.price,
                      stock: product.stock,
                    })
                  }
                  className="bg-blue-600 text-white px-4 py-1 rounded hover:bg-blue-700 w-full"
                >
                  Save
                </button>
                <button
                  onClick={() => handleDelete(product.id)}
                  className="bg-red-600 text-white px-4 py-1 rounded hover:bg-red-700 w-full"
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
