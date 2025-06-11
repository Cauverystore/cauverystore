import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/lib/SupabaseClient";
import { useCartStore } from "@/store/cartStore";
import toast from "react-hot-toast";

const ProductDetail = () => {
  const { id } = useParams();
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);

  const addToCart = useCartStore((state) => state.addToCart);

  useEffect(() => {
    const fetchProduct = async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        toast.error("Failed to load product.");
      } else {
        setProduct(data);
      }

      setLoading(false);
    };

    fetchProduct();
  }, [id]);

  const handleAddToCart = () => {
    if (!product) return;
    addToCart({ id: product.id, name: product.name, price: product.price, quantity });
    toast.success("Added to cart!");
  };

  if (loading) return <div className="text-center py-10">Loading...</div>;
  if (!product) return <div className="text-center py-10">Product not found.</div>;

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-4">{product.name}</h1>
      <p className="text-gray-700 mb-2">₹{product.price}</p>
      <p className="text-gray-600 mb-6">{product.description}</p>

      <div className="flex items-center gap-4 mb-4">
        <label>Qty:</label>
        <input
          type="number"
          min="1"
          value={quantity}
          onChange={(e) => setQuantity(Number(e.target.value))}
          className="border rounded px-3 py-1 w-20"
        />
      </div>

      <button
        onClick={handleAddToCart}
        className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700"
      >
        Add to Cart
      </button>
    </div>
  );
};

export default ProductDetail;
