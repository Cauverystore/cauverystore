import { useEffect, useState } from "react";
import { supabase } from "@/lib/SupabaseClient";

const Storefront = () => {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("is_active", true); // optional: filter only active items

      if (error) {
        console.error("Error loading products:", error);
      } else {
        setProducts(data || []);
      }

      setLoading(false);
    };

    fetchProducts();
  }, []);

  const handleAddToCart = (product: any) => {
    // You can integrate this with Zustand, Redux, or Supabase cart logic
    alert(`Added "${product.name}" to cart!`);
  };

  if (loading) return <div className="text-center py-10">Loading products...</div>;

  return (
    <div className="max-w-7xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6 text-green-700">Storefront</h1>

      {products.length === 0 ? (
        <p>No products available.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => (
            <div
              key={product.id}
              className="bg-white shadow rounded p-4 flex flex-col"
            >
              <img
                src={product.image_url}
                alt={product.name}
                className="w-full h-48 object-cover rounded mb-3"
              />
              <h2 className="text-xl font-semibold">{product.name}</h2>
              <p className="text-gray-600">₹{product.price}</p>
              <p className="text-sm text-gray-500 mb-2">
                Stock: {product.stock > 0 ? product.stock : "Out of Stock"}
              </p>
              <button
                onClick={() => handleAddToCart(product)}
                disabled={product.stock <= 0}
                className={`mt-auto bg-green-600 text-white py-2 rounded hover:bg-green-700 ${
                  product.stock <= 0 ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                {product.stock > 0 ? "Add to Cart" : "Unavailable"}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Storefront;
