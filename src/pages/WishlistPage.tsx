// src/pages/WishlistPage.tsx
import { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { supabase } from "@/lib/supabaseClient";

import PageHeader from "@/components/ui/PageHeader";
import Spinner from "@/components/ui/Spinner";
import ErrorAlert from "@/components/ui/ErrorAlert";
import EmptyState from "@/components/ui/EmptyState";
import ProductCard from "@/components/ProductCard";

interface WishlistItem {
  id: string;
  product_id: string;
  product: {
    id: string;
    name: string;
    price: number;
    image_url: string;
    description: string;
  };
}

export default function WishlistPage() {
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const init = async () => {
      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        setError("You must be logged in to view your wishlist.");
        setLoading(false);
        setAuthChecked(true);
        return;
      }
      setAuthChecked(true);
    };
    init();
  }, []);

  useEffect(() => {
    if (!authChecked) return;

    const fetchWishlist = async () => {
      setLoading(true);
      setError("");

      try {
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();

        if (userError || !user) throw new Error("User not authenticated");

        const { data, error } = await supabase
          .from("wishlists")
          .select("*, product:products(*)")
          .eq("user_id", user.id);

        if (error) throw error;

        setWishlistItems(data || []);

        // ✅ Fire GA4 event for each wishlist item
        if (typeof window !== "undefined" && window.gtag && data?.length) {
          data.forEach((item) => {
            window.gtag("event", "add_to_wishlist", {
              product_id: item.product?.id,
              name: item.product?.name,
              price: item.product?.price,
            });
          });
        }
      } catch (err: any) {
        console.error("Fetch wishlist error:", err);
        setError(err.message || "Failed to fetch wishlist.");
      } finally {
        setLoading(false);
      }
    };

    fetchWishlist();
  }, [authChecked]);

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <Helmet>
        <title>My Wishlist | Cauverystore</title>
        <meta
          name="description"
          content="View your saved products and wishlist items on Cauverystore."
        />
        <meta property="og:title" content="My Wishlist | Cauverystore" />
        <meta
          property="og:description"
          content="Access your wishlist of saved products on Cauverystore."
        />
        <meta property="og:type" content="website" />
        <meta property="twitter:title" content="My Wishlist | Cauverystore" />
        <meta
          property="twitter:description"
          content="Easily access products you've saved to your wishlist on Cauverystore."
        />
      </Helmet>

      <PageHeader title="My Wishlist" subtitle="Your saved items" />

      {loading ? (
        <div className="py-12 flex justify-center">
          <Spinner size="lg" />
        </div>
      ) : error ? (
        <ErrorAlert message={error} />
      ) : wishlistItems.length === 0 ? (
        <EmptyState message="Your wishlist is empty." />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {wishlistItems.map((item) => (
            <ProductCard key={item.id} product={item.product} />
          ))}
        </div>
      )}
    </div>
  );
}
