// src/pages/Checkout.tsx
import { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabaseClient";

import Spinner from "@/components/ui/Spinner";
import { Button } from "@/components/ui/Button";
import ErrorAlert from "@/components/ui/ErrorAlert";
import { formatPrice } from "@/utils/formatPrice";

interface CartItem {
  id: string;
  product_id: string;
  quantity: number;
  product: {
    name: string;
    price: number;
    image_url: string;
  };
}

declare global {
  interface Window {
    Razorpay: any;
  }
}

export default function Checkout() {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [authChecked, setAuthChecked] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // Load Razorpay script dynamically
  const loadRazorpayScript = () => {
    return new Promise<void>((resolve, reject) => {
      if (document.getElementById("razorpay-script")) {
        resolve();
        return;
      }
      const script = document.createElement("script");
      script.id = "razorpay-script";
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve();
      script.onerror = () => reject(new Error("Razorpay SDK failed to load"));
      document.body.appendChild(script);
    });
  };

  useEffect(() => {
    if (typeof window === "undefined") return;

    const init = async () => {
      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        navigate("/login");
        return;
      }
      setAuthChecked(true);
    };
    init();
  }, [navigate]);

  useEffect(() => {
    if (!authChecked) return;
    fetchCart();
  }, [authChecked]);

  const fetchCart = async () => {
    setLoading(true);
    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();
      if (userError || !user) throw userError;

      const { data, error } = await supabase
        .from("cart_items")
        .select("*, product:products(*)")
        .eq("user_id", user.id);

      if (error) throw error;

      setCartItems(data || []);
    } catch (err: any) {
      setError(err.message || "Failed to load cart items");
    } finally {
      setLoading(false);
    }
  };

  const total = cartItems.reduce(
    (acc, item) => acc + item.quantity * item.product.price,
    0
  );

  const handlePlaceOrder = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      // Prepare order items for your Supabase orders table
      const orderItems = cartItems.map((item) => ({
        product_id: item.product_id,
        quantity: item.quantity,
        price: item.product.price,
      }));

      // Create order record in Supabase with status 'pending'
      const { data: orderData, error: orderError } = await supabase
        .from("orders")
        .insert([
          {
            user_id: user.id,
            items: orderItems,
            status: "pending",
          },
        ])
        .select()
        .single();

      if (orderError) throw orderError;

      // Call your Supabase Edge Function to create Razorpay order
      const res = await fetch("/api/create-razorpay-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: total,
          currency: "INR",
          receipt: `order_rcptid_${orderData.id}`,
        }),
      });

      if (!res.ok) throw new Error("Failed to create Razorpay order");

      const { order } = await res.json();

      await loadRazorpayScript();

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: order.currency,
        name: "CauveryStore",
        description: `Order #${order.id}`,
        order_id: order.id,
        handler: async function (response: any) {
          // Here you can verify payment signature server-side or call a webhook
          alert(`Payment Successful! Payment ID: ${response.razorpay_payment_id}`);

          // Clear user's cart in Supabase
          await supabase.from("cart_items").delete().eq("user_id", user.id);

          // Update order status in Supabase to 'completed' (optional, ideally done via webhook)
          await supabase
            .from("orders")
            .update({ status: "completed" })
            .eq("id", orderData.id);

          navigate("/thank-you");
        },
        prefill: {
          email: user.email,
        },
        theme: {
          color: "#2f855a",
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();

      // GA4: Add Payment Info event
      if (typeof window !== "undefined" && "gtag" in window) {
        window.gtag("event", "add_payment_info", {
          currency: "INR",
          value: total,
          email: user.email,
        });
      }
    } catch (err: any) {
      setError(err.message || "Failed to place order.");
    }
  };

  if (!authChecked) {
    return (
      <div className="flex justify-center py-12">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <Helmet>
        <title>Checkout | Cauverystore</title>
        <meta
          name="description"
          content="Complete your purchase securely on Cauverystore. Review cart and place your order."
        />
        <meta property="og:title" content="Checkout | Cauverystore" />
        <meta
          property="og:description"
          content="Confirm your order and proceed to payment securely."
        />
        <meta name="twitter:title" content="Checkout | Cauverystore" />
        <meta
          name="twitter:description"
          content="Review and complete your order on Cauverystore."
        />
      </Helmet>

      <h1 className="text-3xl font-bold text-green-700 mb-6">Checkout</h1>

      {loading ? (
        <Spinner size="lg" />
      ) : error ? (
        <ErrorAlert message={error} />
      ) : cartItems.length === 0 ? (
        <p>Your cart is empty.</p>
      ) : (
        <div className="space-y-6">
          {cartItems.map((item) => (
            <div key={item.id} className="flex items-center gap-4">
              <img
                src={item.product.image_url}
                alt={item.product.name}
                className="w-16 h-16 object-cover rounded"
              />
              <div className="flex-1">
                <p className="font-semibold">{item.product.name}</p>
                <p className="text-sm text-gray-600">
                  Qty: {item.quantity} × ₹{item.product.price}
                </p>
              </div>
              <p className="font-bold">
                {formatPrice(item.quantity * item.product.price)}
              </p>
            </div>
          ))}

          <div className="text-right space-y-4 mt-6">
            <p className="text-xl font-semibold text-green-800">
              Total: {formatPrice(total)}
            </p>
            <Button onClick={handlePlaceOrder}>Place Order</Button>
          </div>
        </div>
      )}
    </div>
  );
}
