import { useEffect } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";

const CheckoutSuccess = () => {
  useEffect(() => {
    toast.success("Your order was placed successfully!");
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="bg-white p-8 rounded shadow text-center max-w-md">
        <h1 className="text-2xl font-bold text-green-700 mb-4">Order Placed!</h1>
        <p className="text-gray-700 mb-6">
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
            className="bg-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-400"
          >
            View Orders
          </Link>
        </div>
      </div>
    </div>
  );
};

export default CheckoutSuccess;
