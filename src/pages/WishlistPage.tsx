// WishlistPage.tsx – Enhanced with Cart Integration + Cleanup
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import PageHeader from "@/components/ui/PageHeader";
import Button from "@/components/ui/Button";
import Spinner from "@/components/ui/Spinner";
import EmptyState from "@/components/ui/EmptyState";
import { useCartStore } from "@/stores/useCartStore";

interface WishlistItem {
  id: number;
  product_id: string;
  user_id: string;
  created_at: string;
}

interface Product {
  id: string;
  name: string;
  price: number;
  image_url: string;
}

export default function WishlistPage() {
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const addToCart = useCartStore((state) => state.addToCart);

  useEffect(() => {
    fetchWishlist();
  }, []);

  const fetchWishlist = async () => {
    setLoading(true);

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      toast.error("You must be logged in to view wishlist.");
      navigate("/login");
      return;
    }

    const userId = session.user.id;

    const { data: wishlistData, error: wishlistError } = await supabase
      .from("wishlist_items")
      .select("*")
      .eq("user_id", userId);

    if (wishlistError) {
      toast.error("Failed to load wishlist");
      setLoading(false);
      return;
    }

    setWishlist(wishlistData || []);

    const productIds = wishlistData.map((item) => item.product_id);
    const { data: productsData, error: productsError } = await supabase
      .from("products")
      .select("*")
      .in("id", productIds);

    if (productsError) {
      toast.error("Failed to fetch product details.");
    } else {
      setProducts(productsData || []);
    }

    setLoading(false);
  };

  const removeFromWishlist = async (productId: string) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    const userId = session.user.id;

    const { error } = await supabase
      .from("wishlist_items")
      .delete()
      .eq("user_id", userId)
      .eq("product_id", productId);

    if (error) {
      toast.error("Failed to remove from wishlist.");
    } else {
      toast.success("Removed from wishlist.");
      setWishlist((prev) => prev.filter((item) => item.product_id !== productId));
      setProducts((prev) => prev.filter((p) => p.id !== productId));
    }
  };

  const moveToCart = (product: Product) => {
    addToCart({ id: product.id, name: product.name, price: product.price, quantity: 1 });
    removeFromWishlist(product.id);
    toast.success("Moved to cart!");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <PageHeader title="My Wishlist" subtitle="Saved products you love." />

      {products.length === 0 ? (
        <EmptyState
          title="Your Wishlist is Empty"
          description="Browse products and add items to your wishlist."
          actionLabel="Start Shopping"
          onAction={() => navigate("/")}
        />
      ) : (
        <div className="grid gap-6 mt-6 sm:grid-cols-2 md:grid-cols-2">
          {products.map((product) => (
            <div
              key={product.id}
              className="border rounded-lg shadow-sm p-4 bg-white flex flex-col"
            >
              <img
                src={product.image_url}
                alt={product.name}
                className="h-40 object-cover rounded mb-4"
              />
              <h2 className="text-lg font-semibold text-green-700 mb-1">
                {product.name}
              </h2>
              <p className="text-gray-700 mb-4">₹{product.price}</p>
              <div className="mt-auto flex justify-between items-center">
                <Button
                  onClick={() => moveToCart(product)}
                  className="bg-green-600 text-white px-4 py-2"
                >
                  Move to Cart
                </Button>
                <Button
                  onClick={() => removeFromWishlist(product.id)}
                  className="bg-red-600 text-white px-4 py-2"
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
