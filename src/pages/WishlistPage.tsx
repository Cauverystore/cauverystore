import { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { supabase } from "@/lib/supabaseClient";
import PageHeader from "@/components/ui/PageHeader";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import ErrorAlert from "@/components/ui/ErrorAlert";
import EmptyState from "@/components/ui/EmptyState";
import Button from "@/components/ui/Button";
import toast from "react-hot-toast";

interface WishlistItem {
  id: string;
  product_id: string;
  created_at: string;
  product: {
    id: string;
    name: string;
    price: number;
    image_url: string;
  };
}

export default function WishlistPage() {
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchWishlist();
  }, []);

  const fetchWishlist = async () => {
    setLoading(true);
    setError("");

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("You must be logged in");

      const { data, error } = await supabase
        .from("wishlist")
        .select("*, product:products(*)")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;

      setWishlist(data || []);
    } catch (err: any) {
      console.error(err);
      setError("Failed to fetch wishlist.");
    } finally {
      setLoading(false);
    }
  };

  const removeFromWishlist = async (id: string) => {
    const { error } = await supabase.from("wishlist").delete().eq("id", id);
    if (error) {
      toast.error("Failed to remove item.");
    } else {
      toast.success("Removed from wishlist.");
      setWishlist((prev) => prev.filter((item) => item.id !== id));
    }
  };

  const moveToCart = async (product: WishlistItem["product"]) => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return toast.error("Not logged in");

    const { error } = await supabase.from("cart").insert([
      {
        user_id: user.id,
        product_id: product.id,
        quantity: 1,
        price: product.price,
        name: product.name,
      },
    ]);

    if (error) {
      toast.error("Could not move to cart");
    } else {
      toast.success("Added to cart");
    }
  };

  return (
    <div className="p-4 max-w-5xl mx-auto">
      <Helmet>
        <title>My Wishlist | Cauverystore</title>
        <meta
          name="description"
          content="View your wishlist on Cauverystore. Save favorite products and move them to cart when ready to purchase."
        />
      </Helmet>

      <PageHeader title="My Wishlist" />

      {loading ? (
        <div className="flex justify-center py-20">
          <LoadingSpinner />
        </div>
      ) : error ? (
        <ErrorAlert message={error} />
      ) : wishlist.length === 0 ? (
        <EmptyState message="Your wishlist is empty." />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {wishlist.map((item) => (
            <div
              key={item.id}
              className="border rounded shadow-sm bg-white dark:bg-gray-800 p-4 space-y-2"
            >
              <img
                src={item.product.image_url}
                alt={item.product.name}
                className="w-full h-40 object-cover rounded"
              />
              <h3 className="font-semibold text-lg">{item.product.name}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                ₹{item.product.price}
              </p>
              <div className="flex gap-2 mt-2">
                <Button
                  size="sm"
                  onClick={() => moveToCart(item.product)}
                >
                  Move to Cart
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => removeFromWishlist(item.id)}
                >
                  Remove
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
