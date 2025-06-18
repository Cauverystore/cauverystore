import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";

interface WishlistItem {
  id: number;
  product_id: number;
  user_id: string;
  created_at: string;
  product: {
    name: string;
    image: string;
    price: number;
  };
}

export default function WishlistPage() {
  const [items, setItems] = useState<WishlistItem[]>([]);

  useEffect(() => {
    fetchWishlist();
  }, []);

  const fetchWishlist = async () => {
    const { data, error } = await supabase
      .from("wishlist")
      .select("*, product:products(*)");
    if (!error && data) setItems(data as WishlistItem[]);
  };

  const removeItem = async (id: number) => {
    const { error } = await supabase.from("wishlist").delete().eq("id", id);
    if (!error) fetchWishlist();
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <Helmet>
        <title>Your Wishlist | Cauverystore</title>
        <meta name="description" content="View and manage your saved wishlist items on Cauverystore." />
      </Helmet>
      <h1 className="text-2xl font-bold mb-6">My Wishlist</h1>
      {items.length === 0 ? (
        <p className="text-gray-500">Your wishlist is empty.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {items.map((item) => (
            <div key={item.id} className="border p-4 rounded shadow bg-white">
              <img src={item.product.image} alt={item.product.name} className="h-40 w-full object-cover mb-2 rounded" />
              <h2 className="text-lg font-semibold">{item.product.name}</h2>
              <p className="text-green-700 font-bold mb-2">₹{item.product.price}</p>
              <div className="flex justify-between">
                <Link
                  to={`/product/${item.product_id}`}
                  className="text-blue-600 hover:underline text-sm"
                >
                  View Product
                </Link>
                <button
                  onClick={() => removeItem(item.id)}
                  className="text-red-600 text-sm hover:underline"
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
