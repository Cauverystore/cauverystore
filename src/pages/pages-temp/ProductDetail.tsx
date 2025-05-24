import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/lib/supabaseClient";
import { useCartStore } from "@/store/cartStore";

type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
  image_url: string;
};

export default function ProductDetail() {
  const { id } = useParams();
  const [product, setProduct] = useState<Product | null>(null);
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
        console.error("Error fetching product:", error.message);
      } else {
        setProduct(data);
      }
      setLoading(false);
    };

    if (id) fetchProduct();
  }, [id]);

  const handleAddToCart = () => {
    if (product) {
      addToCart({
        id: product.id,
        name: product.name,
        price: product.price,
        image_url: product.image_url,
        quantity,
      });
    }
  };

  if (loading) return <div className="p-6 text-center">Loading...</div>;
  if (!product) return <div className="p-6 text-center">Product not found.</div>;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-4">{product.name}</h1>
      <img
        src={product.image_url}
        alt={product.name}
        className="w-full max-h-96 object-cover rounded-xl mb-4"
      />
      <p className="text-xl text-green-700 font-semibold mb-2">₹{product.price}</p>
      <p className="text-gray-700 mb-6">{product.description}</p>

      <div className="flex items-center space-x-4 mb-6">
        <label htmlFor="quantity" className="text-sm font-medium">
          Quantity:
        </label>
        <input
          id="quantity"
          type="number"
          min="1"
          max="99"
          value={quantity}
          onChange={(e) => setQuantity(parseInt(e.target.value))}
          className="w-16 px-2 py-1 border rounded-md"
        />
      </div>

      <button
        onClick={handleAddToCart}
        className="bg-green-600 text-white px-6 py-2 rounded-xl hover:bg-green-700 transition"
      >
        Add to Cart
      </button>
    </div>
  );
}
