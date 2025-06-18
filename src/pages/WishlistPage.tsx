import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Helmet } from "react-helmet-async";

interface WishlistItem {
  id: number;
  user_id: string;
  product_id: number;
  created_at: string;
  product: {
    id: number;
    name: string;
    price: number;
    image: string;
  };
}

export default function WishlistPage() {
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);

  useEffect(() => {
    fetchWishlist();
  }, []);

  const fetchWishlist = async () => {
    const { data, error } = await supabase
      .from("wishlist")
      .select("*, product:products(id, name, price, image)")
      .order("created_at", { ascending: false });

    if (!error && data) setWishlist(data as WishlistItem[]);
  };

  const removeFromWishlist = async (id: number) => {
    const { error } = await supabase.from("wishlist").delete().eq("id", id);
    if (!error) fetchWishlist();
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <Helmet>
        <title>Wishlist | Cauverystore</title>
        <meta name="description" content="View and manage your saved items in your wishlist." />
      </Helmet>
      <h1 className="text-2xl font-bold mb-6">Your Wishlist</h1>
      {wishlist.length === 0 ? (
        <p className="text-gray-600">Your wishlist is empty.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {wishlist.map((item) => (
            <div key={item.id} className="border rounded p-4 bg-white shadow">
              <img
                src={item.product.image}
                alt={item.product.name}
                className="h-40 w-full object-cover rounded mb-2"
              />
              <h2 className="font-semibold">{item.product.name}</h2>
              <p className="text-green-600 font-bold">₹{item.product.price}</p>
              <button
                className="mt-2 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                onClick={() => removeFromWishlist(item.id)}
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
