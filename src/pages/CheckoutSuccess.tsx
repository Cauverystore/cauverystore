// src/pages/CheckoutSuccessPage.tsx
import { useEffect } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";

import PageHeader from "@/components/ui/PageHeader";
import Button from "@/components/ui/Button";
import { useCartStore } from "@/stores/useCartStore";
import { Helmet } from "react-helmet";

export default function CheckoutSuccessPage() {
  const clearCart = useCartStore((state) => state.clearCart);

  useEffect(() => {
    clearCart();
    toast.success("✅ Your order was placed successfully!");
    window.scrollTo(0, 0);
  }, [clearCart]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 px-4">
      <Helmet>
        <title>Order Placed | Cauvery Store</title>
        <meta
          name="description"
          content="Your order has been successfully placed and is being processed by Cauvery Store."
        />
      </Helmet>

      <div className="bg-white dark:bg-gray-800 p-8 rounded shadow text-center max-w-md w-full">
        <PageHeader title="🎉 Order Placed Successfully!" />

        <p className="text-gray-700 dark:text-gray-300 mb-6">
          Thank you for your purchase. Your order has been successfully placed and is being processed.
        </p>

        <div className="flex justify-center gap-4 flex-wrap">
          <Link to="/storefront">
            <Button className="bg-green-600 hover:bg-green-700 text-white px-6 py-2">
              Continue Shopping
            </Button>
          </Link>
          <Link to="/orders">
            <Button variant="secondary" className="px-6 py-2">
              View Orders
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
