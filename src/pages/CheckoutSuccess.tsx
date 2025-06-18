import { useEffect } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { useCartStore } from "@/store/useCartStore";

const CheckoutSuccess = () => {
  const clearCart = useCartStore((state) => state.clearCart);

  useEffect(() => {
    clearCart();
    toast.success("Your order was placed successfully!");
  }, [clearCart]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 px-4">
      <div className="bg-white dark:bg-gray-800 p-8 rounded shadow text-center max-w-md">
        <h1 className="text-2xl font-bold text-green-700 dark:text-green-400 mb-4">
          Order Placed!
        </h1>
        <p className="text-gray-700 dark:text-gray-300 mb-6">
          Thank you for your purchase. Your order has been successfully placed.
        </p>
        <div className="flex justify-center gap-4">
          <Link
            to="/storefront"
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          >
            Continue Shopping
          </Link>
          <Link
            to="/orders"
            className="bg-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-400 dark:bg-gray-600 dark:text-white dark:hover:bg-gray-500"
          >
            View Orders
          </Link>
        </div>
      </div>
    </div>
  );
};

export default CheckoutSuccess;
