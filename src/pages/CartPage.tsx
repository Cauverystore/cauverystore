import { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabaseClient";

import { Button } from "@/components/ui/Button";
import Spinner from "@/components/ui/Spinner";
import ErrorAlert from "@/components/ui/ErrorAlert";
import EmptyState from "@/components/ui/EmptyState";
import { formatPrice } from "@/utils/formatPrice";

interface CartItem {
  id: string;
  product_id: string;
  quantity: number;
  product: {
    id: string;
    name: string;
    price: number;
    image_url: string;
  };
}

export default function CartPage() {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [authChecked, setAuthChecked] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (typeof window === "undefined") return;

    const checkSession = async () => {
      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        setError("User not logged in");
      }
      setAuthChecked(true);
    };
    checkSession();
  }, []);

  useEffect(() => {
    if (!authChecked) return;
    fetchCartItems();
  }, [authChecked]);

  const fetchCartItems = async () => {
    setLoading(true);
    setError("");
    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();
      if (userError || !user) {
        setError("User not logged in");
        setLoading(false);
        return;
      }

      const { data, error: cartError } = await supabase
        .from("cart_items")
        .select("*, product:products(*)")
        .eq("user_id", user.id);

      if (cartError) throw cartError;
      setCartItems(data || []);
    } catch (err: any) {
      setError(err.message || "Failed to load cart items.");
    } finally {
      setLoading(false);
    }
  };

  const removeFromCart = async (itemId: string) => {
    try {
      const { error } = await supabase
        .from("cart_items")
        .delete()
        .eq("id", itemId);

      if (error) throw error;

      setCartItems((prev) => prev.filter((item) => item.id !== itemId));
    } catch (err: any) {
      setError("Failed to remove item.");
    }
  };

  const total = cartItems.reduce(
    (acc, item) => acc + item.quantity * item.product.price,
    0
  );

  const handleCheckout = () => {
    if (typeof window !== "undefined" && "gtag" in window) {
      window.gtag("event", "begin_checkout", {
        currency: "INR",
        value: total,
        items: cartItems.map((item) => ({
          item_id: item.product.id,
          item_name: item.product.name,
          price: item.product.price,
          quantity: item.quantity,
        })),
      });
    }

    navigate("/account/checkout");
  };

  if (!authChecked) {
    return (
      <div className="py-12 flex justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <Helmet>
        <title>Your Cart | Cauverystore</title>
        <meta
          name="description"
          content="Review items in your cart before checkout. Modify quantities or remove items from your Cauverystore cart."
        />
        <meta property="og:title" content="Your Cart | Cauverystore" />
        <meta
          property="og:description"
          content="See the items you're about to purchase from Cauverystore."
        />
        <meta property="twitter:title" content="Your Cart | Cauverystore" />
        <meta
          property="twitter:description"
          content="Securely review your cart before checking out at Cauverystore."
        />
      </Helmet>

      <h1 className="text-3xl font-bold text-green-700 mb-6">Your Cart</h1>

      {loading ? (
        <div className="py-12 flex justify-center">
          <Spinner size="lg" />
        </div>
      ) : error ? (
        <ErrorAlert message={error} />
      ) : cartItems.length === 0 ? (
        <EmptyState message="Your cart is empty." />
      ) : (
        <div className="space-y-6">
          {cartItems.map((item) => (
            <div key={item.id} className="flex items-center gap-4 border-b pb-4">
              <img
                src={item.product.image_url}
                alt={item.product.name}
                className="w-20 h-20 object-cover rounded"
              />
              <div className="flex-1">
                <h2 className="font-semibold text-lg">{item.product.name}</h2>
                <p className="text-sm text-gray-600">
                  Qty: {item.quantity} × ₹{item.product.price}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <p className="font-bold">
                  {formatPrice(item.quantity * item.product.price)}
                </p>
                <button
                  onClick={() => removeFromCart(item.id)}
                  className="text-red-500 hover:text-red-700 text-sm"
                >
                  Remove
                </button>
              </div>
            </div>
          ))}

          <div className="text-right space-y-3">
            <p className="text-xl font-semibold text-green-800">
              Total: {formatPrice(total)}
            </p>
            <Button onClick={handleCheckout}>Proceed to Checkout</Button>
          </div>
        </div>
      )}
    </div>
  );
}
