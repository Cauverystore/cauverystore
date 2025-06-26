import { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabaseClient";

import Spinner from "@/components/ui/Spinner";
import EmptyState from "@/components/ui/EmptyState";
import ErrorAlert from "@/components/ui/ErrorAlert";
import { Button } from "@/components/ui/button";
import PageHeader from "@/components/ui/PageHeader";
import { formatPrice } from "@/utils/formatPrice";

interface WishlistItem {
  id: string;
  product_id: string;
  product: {
    id: string;
    name: string;
    image_url: string;
    price: number;
  };
}

export default function WishlistPage() {
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    fetchWishlist();
  }, []);

  const fetchWishlist = async () => {
    setLoading(true);
    setError("");
    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        setError("User not logged in");
        return;
      }

      const { data, error: wishlistError } = await supabase
        .from("wishlist")
        .select("*, product:products(*)")
        .eq("user_id", user.id);

      if (wishlistError) throw wishlistError;

      setItems(data || []);
    } catch (err: any) {
      console.error("Failed to load wishlist:", err);
      setError("Failed to load wishlist items.");
    } finally {
      setLoading(false);
    }
  };

  const removeFromWishlist = async (id: string) => {
    try {
      const { error } = await supabase.from("wishlist").delete().eq("id", id);
      if (error) throw error;
      setItems((prev) => prev.filter((item) => item.id !== id));
    } catch (err: any) {
      console.error("Failed to remove wishlist item:", err);
      setError("Failed to remove item.");
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <Helmet>
        <title>Your Wishlist | Cauverystore</title>
        <meta
          name="description"
          content="View and manage items you've saved to your Cauverystore wishlist."
        />
        <meta property="og:title" content="Your Wishlist | Cauverystore" />
        <meta
          property="og:description"
          content="Check out your favorite herbal and natural products in one place."
        />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="https://cauverystore.in/og-wishlist.jpg" />
        <meta name="twitter:title" content="Your Wishlist | Cauverystore" />
        <meta
          name="twitter:description"
          content="Easily access and manage your wishlist at Cauverystore."
        />
        <meta name="twitter:image" content="https://cauverystore.in/og-wishlist.jpg" />
      </Helmet>

      <PageHeader title="Your Wishlist" subtitle="Items you’ve saved for later" />

      {loading ? (
        <div className="py-12 flex justify-center">
          <Spinner size="lg" />
        </div>
      ) : error ? (
        <ErrorAlert message={error} />
      ) : items.length === 0 ? (
        <EmptyState message="Your wishlist is currently empty." />
      ) : (
        <div className="space-y-6">
          {items.map((item) => (
            <div key={item.id} className="flex items-center gap-4 border-b pb-4">
              <img
                src={item.product.image_url}
                alt={item.product.name}
                className="w-20 h-20 object-cover rounded"
              />
              <div className="flex-1">
                <h2 className="font-semibold text-lg">{item.product.name}</h2>
                <p className="text-sm text-gray-600">{formatPrice(item.product.price)}</p>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" onClick={() => navigate(`/product/${item.product.id}`)}>
                  View
                </Button>
                <Button variant="destructive" onClick={() => removeFromWishlist(item.id)}>
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
