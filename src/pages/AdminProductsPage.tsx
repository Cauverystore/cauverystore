import { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { supabase } from "@/lib/supabaseClient";
import toast from "react-hot-toast";
import Spinner from "@/components/ui/Spinner";
import ErrorAlert from "@/components/ui/ErrorAlert";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import EmptyState from "@/components/ui/EmptyState";

interface Product {
  id: string;
  name: string;
  price: number;
  stock: number;
  category: string;
  created_at: string;
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) setError("Failed to load products");
    else setProducts(data || []);

    setLoading(false);
  };

  const deleteProduct = async (id: string) => {
    const confirm = window.confirm("Are you sure you want to delete this product?");
    if (!confirm) return;
    const { error } = await supabase.from("products").delete().eq("id", id);
    if (!error) {
      toast.success("Deleted");
      fetchProducts();
    } else toast.error("Delete failed");
  };

  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <Helmet>
        <title>Admin Products</title>
        <meta name="description" content="Manage all products in the store." />
      </Helmet>

      <h1 className="text-3xl font-bold mb-4 text-green-700">Product Management</h1>

      <div className="mb-4">
        <Input
          placeholder="Search by product name"
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
        <div className="overflow-x-auto">
          <table className="w-full text-sm border">
            <thead className="bg-gray-100 dark:bg-gray-700">
              <tr>
                <th className="px-3 py-2 border">Name</th>
                <th className="px-3 py-2 border">Category</th>
                <th className="px-3 py-2 border">Price</th>
                <th className="px-3 py-2 border">Stock</th>
                <th className="px-3 py-2 border">Added</th>
                <th className="px-3 py-2 border">Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map((product) => (
                <tr key={product.id} className="text-center border-t">
                  <td className="px-3 py-2 border">{product.name}</td>
                  <td className="px-3 py-2 border">{product.category}</td>
                  <td className="px-3 py-2 border">₹{product.price}</td>
                  <td className="px-3 py-2 border">
                    <span
                      className={`text-xs px-2 py-1 rounded-full text-white ${
                        product.stock > 0 ? "bg-green-600" : "bg-red-600"
                      }`}
                    >
                      {product.stock > 0 ? "In Stock" : "Out of Stock"}
                    </span>
                  </td>
                  <td className="px-3 py-2 border">
                    {new Date(product.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-3 py-2 border">
                    <Button
                      variant="destructive"
                      size="sm"
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
