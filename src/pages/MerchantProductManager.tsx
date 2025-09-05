// src/pages/MerchantProductManager.tsx
import { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { supabase } from "@/lib/supabaseClient";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import Spinner from "@/components/ui/Spinner";
import ErrorAlert from "@/components/ui/ErrorAlert";
import EmptyState from "@/components/ui/EmptyState";
import toast from "react-hot-toast";

interface Product {
  id: string;
  name: string;
  price: number;
  stock: number;
  category: string;
  merchant_id: string;
  created_at: string;
}

export default function MerchantProductManager() {
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      fetchProducts();
    }
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();
    if (userError || !user) {
      setError("Authentication error");
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("merchant_id", user.id)
      .order("created_at", { ascending: false });

    if (error) setError("Failed to load products");
    else setProducts(data || []);
    setLoading(false);
  };

  const deleteProduct = async (id: string) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this product?");
    if (!confirmDelete) return;
    const { error } = await supabase.from("products").delete().eq("id", id);
    if (!error) {
      toast.success("Product deleted");
      setProducts((prev) => prev.filter((p) => p.id !== id));
      if (typeof window !== "undefined" && window.gtag) {
        window.gtag("event", "delete_product", {
          product_id: id,
        });
      }
    } else toast.error("Delete failed");
  };

  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <Helmet>
        <title>Merchant Products | Cauverystore</title>
        <meta name="description" content="Manage all your listed products." />
        <meta property="og:title" content="Merchant Product Manager - Cauverystore" />
        <meta property="og:description" content="View, search, and manage all your products as a merchant." />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:title" content="Merchant Product Manager - Cauverystore" />
        <meta name="twitter:description" content="View, search, and manage all your products as a merchant." />
      </Helmet>

      <h1 className="text-3xl font-bold mb-4 text-green-700 dark:text-green-300">Your Products</h1>

      <div className="mb-4">
        <Input
          placeholder="Search products by name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {loading ? (
        <Spinner size="lg" />
      ) : error ? (
        <ErrorAlert message={error} />
      ) : filteredProducts.length === 0 ? (
        <EmptyState message="No products found." />
      ) : (
        <div className="overflow-x-auto border rounded dark:border-gray-700">
          <table className="w-full text-sm">
            <thead className="bg-gray-100 dark:bg-gray-800">
              <tr className="text-left">
                <th className="px-4 py-2 border dark:border-gray-700">Name</th>
                <th className="px-4 py-2 border dark:border-gray-700">Price</th>
                <th className="px-4 py-2 border dark:border-gray-700">Stock</th>
                <th className="px-4 py-2 border dark:border-gray-700">Category</th>
                <th className="px-4 py-2 border dark:border-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map((product) => (
                <tr key={product.id} className="border-t dark:border-gray-700 text-center">
                  <td className="px-4 py-2">{product.name}</td>
                  <td className="px-4 py-2">₹{product.price.toFixed(2)}</td>
                  <td className={`px-4 py-2 ${product.stock < 5 ? "text-red-600 font-semibold" : ""}`}>
                    {product.stock}
                  </td>
                  <td className="px-4 py-2">{product.category}</td>
                  <td className="px-4 py-2 space-x-2">
                    <Button size="sm" variant="outline" onClick={() => toast("Edit UI pending")}>
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => deleteProduct(product.id)}
                    >
                      Delete
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
