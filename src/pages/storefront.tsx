import { useEffect, useState } from "react";
import Storefront from "./pages/Storefront";
import { supabase } from "@/lib/supabase";
import { supabase } from "@/lib/supabaseClient";
import { useNavigate } from "react-router-dom";


interface Product {
  id: number;
  name: string;
  price: number;
  stock: number;
  image_url: string;
}

export default function Storefront() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCartStore();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProducts = async () => {
      const { data, error } = await supabase
        .from("products")
        .select("id, name, price, stock, image_url")
        .order("id", { ascending: false });

      if (!error && data) setProducts(data);
      setLoading(false);
    };

    fetchProducts();
  }, []);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-center">Cauvery Store</h1>

      {loading ? (
        <p>Loading products...</p>
      ) : products.length === 0 ? (
        <p>No products available.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <div key={product.id} className="border rounded-lg p-4 shadow">
              <img
                src={product.image_url}
                alt={product.name}
                className="h-40 w-full object-cover rounded mb-2"
              />
              <h2 className="text-lg font-semibold mb-1">{product.name}</h2>
              <p className="text-gray-700 mb-1">₹{product.price}</p>
              <p className="text-sm text-gray-500 mb-2">
                {product.stock > 0 ? `Stock: ${product.stock}` : "Out of Stock"}
              </p>
              <div className="flex gap-2">
                <button
                  disabled={product.stock === 0}
                  onClick={() =>
                    addToCart({
                      id: product.id,
                      name: product.name,
                      price: product.price,
                      image_url: product.image_url,
                      quantity: 1,
                    })
                  }
                  className={`w-full px-3 py-1 rounded text-white ${
                    product.stock === 0
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-green-600 hover:bg-green-700"
                  }`}
                >
                  Add to Cart
                </button>
                <button
                  disabled={product.stock === 0}
                  onClick={() => {
                    addToCart({
                      id: product.id,
                      name: product.name,
                      price: product.price,
                      image_url: product.image_url,
                      quantity: 1,
                    });
                    navigate("/checkout");
                  }}
                  className={`w-full px-3 py-1 rounded text-white ${
                    product.stock === 0
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-blue-600 hover:bg-blue-700"
                  }`}
                >
                  Buy Now
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
